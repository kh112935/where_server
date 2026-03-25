const db = require('../config/db');

// 지역 및 음식 키워드로 DB 캐시 데이터 조회
exports.findCachedRestaurants = async (location, food) => {
    const sql = `
        SELECT id, name, address, category, phone, map_url 
        FROM restaurants 
        WHERE address LIKE ? AND (category LIKE ? OR name LIKE ?)
        LIMIT 15;
    `;
    const [rows] = await db.query(sql, [`%${location}%`, `%${food}%`, `%${food}%`]);
    return rows;
};

// 검색 로그 저장 및 업데이트 (Hit Count)
exports.saveSearchLog = async (location, food) => {
    const sql = `
        INSERT INTO search_logs (location_keyword, food_keyword, hit_count)
        VALUES (?, ?, 1)
        ON DUPLICATE KEY UPDATE hit_count = hit_count + 1;
    `;
    return await db.query(sql, [location, food]);
};

// 카카오 API로 가져온 식당 정보를 DB에 저장 (캐싱)
exports.upsertRestaurants = async (restaurants) => {
    const sql = `
        INSERT INTO restaurants (id, name, address, category, phone, map_url)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        name = VALUES(name), address = VALUES(address), category = VALUES(category), phone = VALUES(phone);
    `;
    for (const item of restaurants) {
        await db.query(sql, [item.id, item.name, item.address, item.category, item.phone, item.mapUrl]);
    }
};

// 내 위치 기반 거리순 조회 (하버사인 공식)
exports.findNearbyRestaurants = async (lat, lng, radius) => {
    const sql = `
        SELECT *, (
            6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))
        ) AS distance
        FROM restaurants
        HAVING distance <= ?
        ORDER BY distance ASC LIMIT 10;
    `;
    const [rows] = await db.query(sql, [lat, lng, lat, radius]);
    return rows;
};
