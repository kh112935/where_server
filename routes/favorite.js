const express = require('express');
const router = express.Router();
const pool = require('../server').pool;

/** POST /api/v1/favorite - 맛집 찜하기 */
router.post('/favorite', async (req, res) => {
    const { restaurantId } = req.body;
    if (!restaurantId) return res.status(400).json({ status: "fail", message: "식당 ID가 필요합니다." });

    try {
        const [existing] = await pool.query("SELECT * FROM favorites WHERE restaurant_id = ?", [restaurantId]);
        if (existing.length > 0) return res.status(400).json({ status: "fail", message: "이미 찜한 식당입니다." });

        const [resExists] = await pool.query("SELECT id FROM restaurants WHERE id = ?", [restaurantId]);
        if (resExists.length === 0) return res.status(400).json({ status: "fail", message: "존재하지 않는 식당입니다." });

        await pool.query("INSERT INTO favorites (restaurant_id) VALUES (?)", [restaurantId]);
        res.json({ status: "success", message: "찜 목록에 추가되었습니다." });
    } catch (error) {
        res.status(500).json({ status: "error", message: "찜하기 오류" });
    }
});

/** GET /api/v1/favorites - 찜 목록 조회 */
router.get('/favorites', async (req, res) => {
    try {
        const sql = `
            SELECT f.f_id, r.id AS restaurant_id, r.name, r.address, r.category, r.phone, r.map_url, f.created_at AS favorite_date
            FROM favorites f
            JOIN restaurants r ON f.restaurant_id = r.id
            ORDER BY f.created_at DESC;
        `;
        const [rows] = await pool.query(sql);
        res.json({ status: "success", results: rows.length, data: rows });
    } catch (error) {
        res.status(500).json({ status: "error", message: "조회 오류" });
    }
});

/** DELETE /api/v1/favorite/:f_id - 찜 취소하기 */
router.delete('/favorite/:f_id', async (req, res) => {
    const { f_id } = req.params;
    try {
        const [target] = await pool.query("SELECT * FROM favorites WHERE f_id = ?", [f_id]);
        if (target.length === 0) return res.status(404).json({ status: "fail", message: "내역 없음" });
        await pool.query("DELETE FROM favorites WHERE f_id = ?", [f_id]);
        res.json({ status: "success", message: "삭제 완료" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "삭제 오류" });
    }
});

module.exports = router;
