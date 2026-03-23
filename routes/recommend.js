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

module.exports = router;
