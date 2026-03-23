const express = require('express');
const router = express.Router();
const pool = require('../server').pool;
const verifyToken = require('../middleware/auth');

// [참고] server.js에서 이미 /api/v1/favorite 로 들어왔습니다.

/** POST / - 맛집 찜하기 (JWT 필수) -> /api/v1/favorite */
router.post('/', verifyToken, async (req, res) => {
    const { restaurantId } = req.body;
    const userId = req.user.userId;

    if (!restaurantId) return res.status(400).json({ status: "fail", message: "식당 ID가 필요합니다." });

    try {
        const [resExists] = await pool.query("SELECT id FROM restaurants WHERE id = ?", [restaurantId]);
        if (resExists.length === 0) return res.status(400).json({ status: "fail", message: "존재하지 않는 식당입니다." });

        await pool.query("INSERT INTO favorites (user_id, restaurant_id) VALUES (?, ?)", [userId, restaurantId]);
        res.json({ status: "success", message: "찜 목록에 추가되었습니다." });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ status: "fail", message: "이미 찜한 식당입니다." });
        }
        res.status(500).json({ status: "error", message: "찜하기 오류" });
    }
});

/** GET /list - 내 찜 목록 조회 -> /api/v1/favorite/list */
// (기존 /favorites와 겹치지 않게 'list'나 빈 값('/')으로 두는 것이 깔끔합니다)
router.get('/list', verifyToken, async (req, res) => {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const [countResult] = await pool.query("SELECT COUNT(*) AS total FROM favorites WHERE user_id = ?", [userId]);
        const totalItems = countResult[0].total;
        const totalPages = Math.ceil(totalItems / limit);

        const sql = `
            SELECT f.f_id, r.id AS restaurant_id, r.name, r.address, r.category, r.phone, r.map_url, f.created_at AS favorite_date
            FROM favorites f
            JOIN restaurants r ON f.restaurant_id = r.id
            WHERE f.user_id = ?
            ORDER BY f.created_at DESC
            LIMIT ? OFFSET ?;
        `;
        const [rows] = await pool.query(sql, [userId, limit, offset]);

        res.json({
            status: "success",
            pagination: { current_page: page, total_pages: totalPages, total_items: totalItems, items_per_page: limit },
            data: rows
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "조회 오류" });
    }
});

/** GET /ranking - 전체 찜 랭킹 TOP 5 -> /api/v1/favorite/ranking */
router.get('/ranking', async (req, res) => {
    try {
        const sql = `
            SELECT r.id AS restaurant_id, r.name, r.category, r.address, COUNT(f.f_id) AS favorite_count
            FROM restaurants r
            LEFT JOIN favorites f ON r.id = f.restaurant_id
            GROUP BY r.id
            HAVING favorite_count > 0
            ORDER BY favorite_count DESC, r.name ASC
            LIMIT 5;
        `;
        const [rows] = await pool.query(sql);
        res.json({ status: "success", count: rows.length, data: rows });
    } catch (error) {
        res.status(500).json({ status: "error", message: "랭킹 조회 오류" });
    }
});

/** GET /status/:restaurantId - 찜 여부 확인 -> /api/v1/favorite/status/:id */
router.get('/status/:restaurantId', verifyToken, async (req, res) => {
    const { restaurantId } = req.params;
    const userId = req.user.userId;
    try {
        const [rows] = await pool.query("SELECT f_id FROM favorites WHERE user_id = ? AND restaurant_id = ?", [userId, restaurantId]);
        const isFavorite = rows.length > 0;
        res.json({ status: "success", data: { isFavorite, f_id: isFavorite ? rows[0].f_id : null } });
    } catch (error) {
        res.status(500).json({ status: "error", message: "상태 확인 오류" });
    }
});

/** DELETE /:f_id - 찜 취소하기 -> /api/v1/favorite/:f_id */
router.delete('/:f_id', verifyToken, async (req, res) => {
    const { f_id } = req.params;
    const userId = req.user.userId;
    try {
        const [target] = await pool.query("SELECT * FROM favorites WHERE f_id = ? AND user_id = ?", [f_id, userId]);
        if (target.length === 0) return res.status(404).json({ status: "fail", message: "삭제 권한이 없습니다." });
        await pool.query("DELETE FROM favorites WHERE f_id = ?", [f_id]);
        res.json({ status: "success", message: "삭제 완료" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "삭제 오류" });
    }
});

module.exports = router;
