const express = require('express');
const router = express.Router();
const pool = require('../server').pool;

/** GET /api/v1/trends */
router.get('/', async (req, res) => {
    try {
        const sql = `
            SELECT location_keyword, food_keyword, hit_count 
            FROM search_logs 
            WHERE last_searched_at >= NOW() - INTERVAL 1 HOUR
            ORDER BY hit_count DESC 
            LIMIT 5;
        `;
        const [trends] = await pool.query(sql);

        res.json({
            status: "success",
            period: "last_1_hour",
            data: trends
        });
    } catch (error) {
        console.error("❌ 실시간 통계 조회 에러:", error.message);
        res.status(500).json({ status: "error", message: "실시간 데이터를 불러오지 못했습니다." });
    }
});

module.exports = router;
