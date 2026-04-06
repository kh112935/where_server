const db = require('../config/db');

class RecommendRepository {
    // 1. 캐시 데이터 조회 (AS 구문으로 컬럼명 매핑)
    static async findCachedRestaurants(location, food) {
        const sql = `
            SELECT id, name, address, category, phone, map_url, latitude AS lat, longitude AS lng 
            FROM restaurants 
            WHERE address LIKE ? AND (category LIKE ? OR name LIKE ?)
            LIMIT 15
        `;
        const [rows] = await db.execute(sql, [`%${location}%`, `%${food}%`, `%${food}%`]);
        return rows;
    }

    // 2. 검색 로그 저장
    static async saveSearchLog(location, food) {
        const sql = `
            INSERT INTO search_logs (location_keyword, food_keyword, hit_count)
            VALUES (?, ?, 1)
            ON DUPLICATE KEY UPDATE hit_count = hit_count + 1
        `;
        await db.execute(sql, [location, food]);
    }

    // 3. 카카오 API 데이터 DB 저장 (실제 컬럼명 latitude, longitude 적용)
    static async upsertRestaurants(restaurants) {
        const sql = `
            INSERT INTO restaurants (id, name, address, category, phone, map_url, latitude, longitude)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            name = VALUES(name), address = VALUES(address), category = VALUES(category), 
            phone = VALUES(phone), latitude = VALUES(latitude), longitude = VALUES(longitude)
        `;

        const promises = restaurants.map(item =>
            db.execute(sql, [item.id, item.name, item.address, item.category, item.phone, item.mapUrl, item.lat, item.lng])
        );
        await Promise.all(promises);
    }

    // 4. 내 위치 기반 거리순 조회 (실제 컬럼명 적용)
    static async findNearbyRestaurants(lat, lng, radius) {
        const sql = `
            SELECT id, name, address, category, phone, map_url, latitude AS lat, longitude AS lng, (
                6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))
            ) AS distance
            FROM restaurants
            HAVING distance <= ?
            ORDER BY distance ASC 
            LIMIT 15
        `;
        const [rows] = await db.execute(sql, [lat, lng, lat, radius]);
        return rows;
    }

    // 5. 평점 높은 순 맛집 조회
    static async findTopRated(category) {
        let sql = `
            SELECT r.id, r.name, r.category, r.address, 
                   IFNULL(ROUND(AVG(rev.rating), 1), 0) AS avg_rating,
                   COUNT(rev.r_id) AS review_count
            FROM restaurants r
            LEFT JOIN reviews rev ON r.id = rev.restaurant_id
        `;
        const params = [];

        if (category) {
            sql += ` WHERE r.category LIKE ?`;
            params.push(`%${category}%`);
        }

        sql += ` GROUP BY r.id HAVING review_count > 0 ORDER BY avg_rating DESC, review_count DESC LIMIT 10`;
        const [rows] = await db.execute(sql, params);
        return rows;
    }

    // 6. 통합 필터 복합 검색 (실제 컬럼명 적용)
    static async findComplexSearch(lat, lng, radius, categories, minRating) {
        let sql = `
            SELECT r.id, r.name, r.category, r.address, r.phone, r.map_url, r.latitude AS lat, r.longitude AS lng,
                   (6371 * acos(cos(radians(?)) * cos(radians(r.latitude)) * cos(radians(r.longitude) - radians(?)) + sin(radians(?)) * sin(radians(r.latitude)))) AS distance,
                   IFNULL(ROUND(AVG(rev.rating), 1), 0) AS avg_rating
            FROM restaurants r
            LEFT JOIN reviews rev ON r.id = rev.restaurant_id
            WHERE 1=1
        `;
        const params = [lat, lng, lat];

        if (categories && categories.length > 0) {
            const placeholders = categories.map(() => '?').join(',');
            sql += ` AND r.category IN (${placeholders})`;
            params.push(...categories);
        }

        sql += ` GROUP BY r.id HAVING distance <= ? AND avg_rating >= ? ORDER BY distance ASC LIMIT 20`;
        params.push(radius, minRating);

        const [rows] = await db.query(sql, params);
        return rows;
    }
}

module.exports = RecommendRepository;
