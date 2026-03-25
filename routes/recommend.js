const express = require('express');
const router = express.Router();
const axios = require('axios');
const pool = require('../config/db');

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

router.get('/nearby', async (req, res) => {
    const { lat, lng, radius = 3 } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ status: "fail", message: "현재 위치(lat, lng) 정보가 필요합니다." });
    }

    try {
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

router.get('/top-rated', async (req, res) => {
    const { category } = req.query;

    try {
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
            HAVING review_count > 0
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

router.post('/search', async (req, res) => {
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

        if (categories && categories.length > 0) {
            sql += ` AND r.category IN (${categories.map(() => '?').join(',')})`;
            params.push(...categories);
        }

        sql += ` GROUP BY r.id `;
        sql += ` HAVING distance <= ? AND average_rating >= ? `;
        params.push(radius, minRating);
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
