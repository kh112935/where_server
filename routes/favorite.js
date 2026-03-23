const express = require('express');
const router = express.Router();
const pool = require('../server').pool;
const verifyToken = require('../middleware/auth'); // [추가] 검문소 소환!

/** POST /api/v1/favorite - 맛집 찜하기 (JWT 필수) */
router.post('/favorite', verifyToken, async (req, res) => {
    const { restaurantId } = req.body;
    const userId = req.user.userId; // 검문소에서 넘겨준 진짜 유저 ID

    if (!restaurantId) return res.status(400).json({ status: "fail", message: "식당 ID가 필요합니다." });

    try {
        const [resExists] = await pool.query("SELECT id FROM restaurants WHERE id = ?", [restaurantId]);
        if (resExists.length === 0) return res.status(400).json({ status: "fail", message: "존재하지 않는 식당입니다." });

        // UNIQUE KEY 덕분에 중복 검사를 쿼리 한 줄로 깔끔하게 처리
        await pool.query("INSERT INTO favorites (user_id, restaurant_id) VALUES (?, ?)", [userId, restaurantId]);
        res.json({ status: "success", message: "찜 목록에 추가되었습니다." });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ status: "fail", message: "이미 찜한 식당입니다." });
        }
        res.status(500).json({ status: "error", message: "찜하기 오류" });
    }
});

/** GET /api/v1/favorites - 내 찜 목록 조회 (JWT 필수) */
router.get('/favorites', verifyToken, async (req, res) => {
    const userId = req.user.userId; // 내 ID로 찜한 것만 가져옴

    try {
        const sql = `
            SELECT f.f_id, r.id AS restaurant_id, r.name, r.address, r.category, r.phone, r.map_url, f.created_at AS favorite_date
            FROM favorites f
            JOIN restaurants r ON f.restaurant_id = r.id
            WHERE f.user_id = ?
            ORDER BY f.created_at DESC;
        `;
        const [rows] = await pool.query(sql, [userId]);
        res.json({ status: "success", results: rows.length, data: rows });
    } catch (error) {
        res.status(500).json({ status: "error", message: "조회 오류" });
    }
});

/** DELETE /api/v1/favorite/:f_id - 찜 취소하기 (JWT 필수) */
router.delete('/favorite/:f_id', verifyToken, async (req, res) => {
    const { f_id } = req.params;
    const userId = req.user.userId;

    try {
        // 남의 찜 내역을 삭제하지 못하도록 user_id도 함께 조건에 넣음 (실무 필수 보안)
        const [target] = await pool.query("SELECT * FROM favorites WHERE f_id = ? AND user_id = ?", [f_id, userId]);
        if (target.length === 0) return res.status(404).json({ status: "fail", message: "내역이 없거나 삭제 권한이 없습니다." });

        await pool.query("DELETE FROM favorites WHERE f_id = ?", [f_id]);
        res.json({ status: "success", message: "삭제 완료" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "삭제 오류" });
    }
});

module.exports = router;
