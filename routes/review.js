const multer = require('multer');
const path = require('path');
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const verifyToken = require('../middleware/auth');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.post('/', verifyToken, async (req, res) => {
    const { restaurantId, rating, comment } = req.body;
    const userId = req.user.userId;

    if (!restaurantId || !rating || !comment) {
        return res.status(400).json({ status: "fail", message: "식당 ID, 별점, 내용은 필수입니다." });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ status: "fail", message: "별점은 1점에서 5점 사이여야 합니다." });
    }

    try {
        const [resExists] = await pool.query("SELECT id FROM restaurants WHERE id = ?", [restaurantId]);
        if (resExists.length === 0) {
            return res.status(404).json({ status: "fail", message: "존재하지 않는 식당입니다." });
        }

        const sql = `
            INSERT INTO reviews (user_id, restaurant_id, rating, comment)
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await pool.query(sql, [userId, restaurantId, rating, comment]);

        res.status(201).json({
            status: "success",
            message: "리뷰가 성공적으로 등록되었습니다.",
            data: { reviewId: result.insertId }
        });
    } catch (error) {
        console.error("❌ 리뷰 작성 오류:", error);
        res.status(500).json({ status: "error", message: "서버 오류로 리뷰를 등록할 수 없습니다." });
    }
});

router.post('/with-image', verifyToken, upload.single('image'), async (req, res) => {
    const { restaurantId, rating, comment } = req.body;
    const userId = req.user.userId;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!restaurantId || !rating || !comment) {
        return res.status(400).json({ status: "fail", message: "필수 데이터가 누락되었습니다." });
    }

    try {
        const sql = `
            INSERT INTO reviews (user_id, restaurant_id, rating, comment, image_url)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await pool.query(sql, [userId, restaurantId, rating, comment, imageUrl]);

        res.status(201).json({
            status: "success",
            message: "사진 리뷰가 등록되었습니다.",
            data: {
                reviewId: result.insertId,
                imageUrl: imageUrl
            }
        });
    } catch (error) {
        console.error("❌ 사진 리뷰 작성 오류:", error);
        res.status(500).json({ status: "error", message: "서버 오류 발생" });
    }
});

router.get('/my/list', verifyToken, async (req, res) => {
    const userId = req.user.userId;

    try {
        const sql = `
            SELECT 
                r.r_id, r.rating, r.comment, r.image_url, r.created_at,
                res.name AS restaurant_name, res.category AS restaurant_category
            FROM reviews r
            JOIN restaurants res ON r.restaurant_id = res.id
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC
        `;
        const [rows] = await pool.query(sql, [userId]);

        res.json({ status: "success", count: rows.length, data: rows });
    } catch (error) {
        console.error("❌ 내 리뷰 조회 오류:", error);
        res.status(500).json({ status: "error", message: "내 리뷰를 불러오는 중 오류가 발생했습니다." });
    }
});

router.get('/summary/:restaurantId', async (req, res) => {
    const { restaurantId } = req.params;

    try {
        const sql = `
            SELECT 
                COUNT(r_id) AS total_reviews,
                IFNULL(ROUND(AVG(rating), 1), 0) AS average_rating
            FROM reviews
            WHERE restaurant_id = ?
        `;
        const [rows] = await pool.query(sql, [restaurantId]);

        res.json({
            status: "success",
            data: {
                restaurant_id: restaurantId,
                total_reviews: rows[0].total_reviews,
                average_rating: rows[0].average_rating
            }
        });
    } catch (error) {
        console.error("❌ 리뷰 요약 조회 오류:", error);
        res.status(500).json({ status: "error", message: "리뷰 요약을 불러올 수 없습니다." });
    }
});

router.get('/:restaurantId', async (req, res) => {
    const { restaurantId } = req.params;

    try {
        const sql = `
            SELECT 
                r.r_id, r.rating, r.comment, r.image_url, r.created_at,
                u.username AS user_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.restaurant_id = ?
            ORDER BY r.created_at DESC
        `;
        const [rows] = await pool.query(sql, [restaurantId]);

        res.json({ status: "success", count: rows.length, data: rows });
    } catch (error) {
        console.error("❌ 리뷰 조회 오류:", error);
        res.status(500).json({ status: "error", message: "리뷰를 불러오는 중 오류가 발생했습니다." });
    }
});

router.patch('/:r_id', verifyToken, async (req, res) => {
    const { r_id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.userId;

    try {
        const [target] = await pool.query("SELECT * FROM reviews WHERE r_id = ? AND user_id = ?", [r_id, userId]);
        if (target.length === 0) {
            return res.status(403).json({ status: "fail", message: "수정 권한이 없거나 존재하지 않는 리뷰입니다." });
        }

        const sql = "UPDATE reviews SET rating = ?, comment = ? WHERE r_id = ?";
        await pool.query(sql, [rating || target[0].rating, comment || target[0].comment, r_id]);

        res.json({ status: "success", message: "리뷰가 수정되었습니다." });
    } catch (error) {
        res.status(500).json({ status: "error", message: "수정 중 오류 발생" });
    }
});

router.delete('/:r_id', verifyToken, async (req, res) => {
    const { r_id } = req.params;
    const userId = req.user.userId;

    try {
        const [result] = await pool.query("DELETE FROM reviews WHERE r_id = ? AND user_id = ?", [r_id, userId]);

        if (result.affectedRows === 0) {
            return res.status(403).json({ status: "fail", message: "삭제 권한이 없거나 이미 삭제된 리뷰입니다." });
        }

        res.json({ status: "success", message: "리뷰가 삭제되었습니다." });
    } catch (error) {
        res.status(500).json({ status: "error", message: "삭제 중 오류 발생" });
    }
});

module.exports = router;
