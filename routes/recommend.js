const express = require('express');
const router = express.Router();
const axios = require('axios');
const pool = require('../server').pool;

const KAKAO_KEY = process.env.KAKAO_REST_API_KEY;

// [유틸리티: 데이터 정제]
const refineData = (doc) => {
    const categoryParts = doc.category_name.split(' > ');
    let category = categoryParts.pop();
    if (category.includes(',')) category = category.split(',')[0];
    const address = doc.address_name.replace(/광주광역시 |광주 /g, '');
    const distance = doc.distance
        ? (parseInt(doc.distance) >= 1000 ? `${(doc.distance / 1000).toFixed(1)}km` : `${doc.distance}m`)
        : "정보 없음";

    return {
        id: doc.id,
        name: doc.place_name,
        address: address,
        category: category,
        phone: doc.phone || "번호 없음",
        distance: distance,
        mapUrl: doc.place_url
    };
};

/** GET /api/v1/recommend */
router.get('/', async (req, res) => {
    const { location, food } = req.query;
    if (!location || !food) {
        return res.status(400).json({ status: "fail", message: "지역과 음식 정보를 모두 보내주세요." });
    }

    try {
        const logSql = `
            INSERT INTO search_logs (location_keyword, food_keyword, hit_count)
            VALUES (?, ?, 1)
            ON DUPLICATE KEY UPDATE hit_count = hit_count + 1;
        `;
        await pool.query(logSql, [location, food]);

        const cacheSql = `
            SELECT id, name, address, category, phone, map_url 
            FROM restaurants 
            WHERE address LIKE ? AND (category LIKE ? OR name LIKE ?)
            LIMIT 15;
        `;
        const [cachedData] = await pool.query(cacheSql, [`%${location}%`, `%${food}%`, `%${food}%`]);

        if (cachedData.length >= 5) {
            console.log(`⚡ [Cache Hit] DB에서 데이터를 가져왔습니다: ${location} ${food}`);
            return res.json({
                status: "success",
                source: "database",
                results: cachedData.length,
                data: cachedData
            });
        }

        console.log(`🌐 [Cache Miss] 카카오 API를 호출합니다: ${location} ${food}`);
        const response = await axios.get('https://dapi.kakao.com/v2/local/search/keyword.json', {
            params: { query: `광주 ${location} ${food}`, size: 15, sort: "accuracy" },
            headers: { 'Authorization': `KakaoAK ${KAKAO_KEY}` }
        });

        const results = response.data.documents.map(refineData);

        for (const item of results) {
            const saveSql = `
                INSERT INTO restaurants (id, name, address, category, phone, map_url)
                VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                name = VALUES(name), address = VALUES(address), category = VALUES(category), phone = VALUES(phone);
            `;
            await pool.query(saveSql, [item.id, item.name, item.address, item.category, item.phone, item.mapUrl]);
        }

        res.json({
            status: "success",
            source: "kakao_api",
            results: results.length,
            data: results
        });

    } catch (error) {
        console.error("❌ 추천 로직 에러:", error.message);
        res.status(500).json({ status: "error", message: "서버 내부 오류" });
    }
});

/**
 * @route   GET /api/v1/recommend/nearby
 * @desc    내 위치 기반 가까운 맛집 검색 (거리순 정렬)
 */
router.get('/nearby', async (req, res) => {
    // 프론트엔드에서 보낸 현재 위치와 검색 반경(기본 3km)
    const { lat, lng, radius = 3 } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ status: "fail", message: "현재 위치(lat, lng) 정보가 필요합니다." });
    }

    try {
        // 하버사인 공식(Haversine Formula)을 이용한 거리 계산 SQL
        // 6371은 지구의 반지름(km)입니다.
        const sql = `
            SELECT *, (
                6371 * acos(
                    cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + 
                    sin(radians(?)) * sin(radians(latitude))
                )
            ) AS distance
            FROM restaurants
            HAVING distance <= ?
            ORDER BY distance ASC
            LIMIT 10;
        `;

        const [rows] = await pool.query(sql, [lat, lng, lat, radius]);

        res.json({
            status: "success",
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error("❌ 거리순 조회 오류:", error);
        res.status(500).json({ status: "error", message: "거리 계산 중 오류가 발생했습니다." });
    }
});

/**
 * @route   GET /api/v1/recommend/top-rated
 * @desc    평점 높은 순 맛집 검색 (리뷰 수 포함)
 */
router.get('/top-rated', async (req, res) => {
    const { category } = req.query; // 특정 카테고리만 보고 싶을 때 사용

    try {
        // [핵심] restaurants 테이블과 reviews 테이블을 JOIN하여 평균과 개수를 계산
        let sql = `
            SELECT 
                r.id, r.name, r.category, r.address,
                COUNT(rev.r_id) AS review_count,
                IFNULL(ROUND(AVG(rev.rating), 1), 0) AS average_rating
            FROM restaurants r
            LEFT JOIN reviews rev ON r.id = rev.restaurant_id
        `;

        const params = [];
        if (category) {
            sql += " WHERE r.category = ? ";
            params.push(category);
        }

        sql += `
            GROUP BY r.id
            HAVING review_count > 0  -- 리뷰가 최소 1개 이상인 곳만 우선 노출
            ORDER BY average_rating DESC, review_count DESC
            LIMIT 10;
        `;

        const [rows] = await pool.query(sql, params);

        res.json({
            status: "success",
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error("❌ 평점순 조회 오류:", error);
        res.status(500).json({ status: "error", message: "랭킹 조회 중 오류 발생" });
    }
});

/**
 * @route   POST /api/v1/recommend/search
 * @desc    통합 검색 (거리 + 평점 + 다중 카테고리 + 최소 평점)
 */
router.post('/search', async (req, res) => {
    // lat/lng는 필수, 나머지는 선택
    const { lat, lng, categories, minRating = 0, radius = 3 } = req.body;

    if (!lat || !lng) {
        return res.status(400).json({ status: "fail", message: "현재 위치 정보가 필요합니다." });
    }

    try {
        let sql = `
            SELECT 
                r.*, 
                COUNT(rev.r_id) AS review_count,
                IFNULL(ROUND(AVG(rev.rating), 1), 0) AS average_rating,
                (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance
            FROM restaurants r
            LEFT JOIN reviews rev ON r.id = rev.restaurant_id
            WHERE 1=1
        `;

        const params = [lat, lng, lat];

        // 1. 다중 카테고리 필터 (배열로 받음: ["돈까스", "일식"])
        if (categories && categories.length > 0) {
            sql += ` AND r.category IN (${categories.map(() => '?').join(',')})`;
            params.push(...categories);
        }

        sql += ` GROUP BY r.id `;

        // 2. 최소 평점 및 거리 필터 (HAVING 절 사용)
        sql += ` HAVING distance <= ? AND average_rating >= ? `;
        params.push(radius, minRating);

        // 3. 정렬 (가까운 순 우선, 그다음 평점 순)
        sql += ` ORDER BY distance ASC, average_rating DESC LIMIT 20; `;

        const [rows] = await pool.query(sql, params);

        res.json({
            status: "success",
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error("❌ 통합 검색 오류:", error);
        res.status(500).json({ status: "error", message: "검색 중 서버 오류 발생" });
    }
});

module.exports = router;
