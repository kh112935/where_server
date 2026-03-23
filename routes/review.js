const multer = require('multer');
const path = require('path');

// 이미지 저장 위치 및 파일명 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // 파일이 저장될 폴더
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
const express = require('express');
const router = express.Router();
const pool = require('../server').pool;
const verifyToken = require('../middleware/auth');

/**
 * @route   POST /api/v1/review
 * @desc    식당 리뷰 작성 (JWT 필수)
 */
router.post('/', verifyToken, async (req, res) => {
    const { restaurantId, rating, comment } = req.body;
    const userId = req.user.userId;

    // 1. 필수 데이터 검증
    if (!restaurantId || !rating || !comment) {
        return res.status(400).json({ status: "fail", message: "식당 ID, 별점, 내용은 필수입니다." });
    }

    // 2. 별점 범위 체크 (1~5점)
    if (rating < 1 || rating > 5) {
        return res.status(400).json({ status: "fail", message: "별점은 1점에서 5점 사이여야 합니다." });
    }

    try {
        // 3. 식당 존재 여부 확인
        const [resExists] = await pool.query("SELECT id FROM restaurants WHERE id = ?", [restaurantId]);
        if (resExists.length === 0) {
            return res.status(404).json({ status: "fail", message: "존재하지 않는 식당입니다." });
        }

        // 4. 리뷰 저장
        const sql = `
            INSERT INTO reviews (user_id, restaurant_id, rating, comment)
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await pool.query(sql, [userId, restaurantId, rating, comment]);

        res.status(201).json({
            status: "success",
            message: "리뷰가 성공적으로 등록되었습니다.",
            data: {
                reviewId: result.insertId
            }
        });
    } catch (error) {
        console.error("❌ 리뷰 작성 오류:", error);
        res.status(500).json({ status: "error", message: "서버 오류로 리뷰를 등록할 수 없습니다." });
    }
});

/**
 * @route   GET /api/v1/review/:restaurantId
 * @desc    특정 식당의 리뷰 목록 조회 (작성자 이름 포함)
 */
router.get('/:restaurantId', async (req, res) => {
    const { restaurantId } = req.params;

    try {
        // [핵심] reviews와 users 테이블을 JOIN하여 작성자의 이름을 가져옵니다.
        const sql = `
            SELECT 
                r.r_id, 
                r.rating, 
                r.comment, 
                r.image_url, 
                r.created_at,
                u.username AS user_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.restaurant_id = ?
            ORDER BY r.created_at DESC
        `;

        const [rows] = await pool.query(sql, [restaurantId]);

        res.json({
            status: "success",
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error("❌ 리뷰 조회 오류:", error);
        res.status(500).json({ status: "error", message: "리뷰를 불러오는 중 오류가 발생했습니다." });
    }
});

/**
 * @route   GET /api/v1/review/summary/:restaurantId
 * @desc    식당별 평균 별점 및 총 리뷰 개수 요약
 */
router.get('/summary/:restaurantId', async (req, res) => {
    const { restaurantId } = req.params;

    try {
        // AVG: 평균 계산, COUNT: 개수 계산
        // IFNULL: 리뷰가 없을 경우를 대비해 0으로 치환
        // ROUND(..., 1): 소수점 첫째 자리까지만 표시
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

/**
 * @route   PATCH /api/v1/review/:r_id
 * @desc    내가 작성한 리뷰 수정 (별점, 내용)
 */
router.patch('/:r_id', verifyToken, async (req, res) => {
    const { r_id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.userId;

    try {
        // 1. 본인이 작성한 리뷰인지 먼저 확인
        const [target] = await pool.query("SELECT * FROM reviews WHERE r_id = ? AND user_id = ?", [r_id, userId]);
        if (target.length === 0) {
            return res.status(403).json({ status: "fail", message: "수정 권한이 없거나 존재하지 않는 리뷰입니다." });
        }

        // 2. 수정 실행 (값이 들어온 것만 업데이트)
        const sql = "UPDATE reviews SET rating = ?, comment = ? WHERE r_id = ?";
        await pool.query(sql, [rating || target[0].rating, comment || target[0].comment, r_id]);

        res.json({ status: "success", message: "리뷰가 수정되었습니다." });
    } catch (error) {
        res.status(500).json({ status: "error", message: "수정 중 오류 발생" });
    }
});

/**
 * @route   DELETE /api/v1/review/:r_id
 * @desc    내가 작성한 리뷰 삭제
 */
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

/**
 * @route   POST /api/v1/review/with-image
 * @desc    사진을 포함한 리뷰 작성 (JWT 필수)
 */
router.post('/with-image', verifyToken, upload.single('image'), async (req, res) => {
    const { restaurantId, rating, comment } = req.body;
    const userId = req.user.userId;

    // 파일이 업로드되었다면 DB에 저장할 경로 생성, 없으면 null
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

/**
 * @route   GET /api/v1/review/my
 * @desc    내가 작성한 모든 리뷰 목록 조회 (식당 이름 포함)
 */
router.get('/my/list', verifyToken, async (req, res) => {
    const userId = req.user.userId;

    try {
        const sql = `
            SELECT 
                r.r_id, 
                r.rating, 
                r.comment, 
                r.image_url, 
                r.created_at,
                res.name AS restaurant_name,
                res.category AS restaurant_category
            FROM reviews r
            JOIN restaurants res ON r.restaurant_id = res.id
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC
        `;

        const [rows] = await pool.query(sql, [userId]);

        res.json({
            status: "success",
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error("❌ 내 리뷰 조회 오류:", error);
        res.status(500).json({ status: "error", message: "내 리뷰를 불러오는 중 오류가 발생했습니다." });
    }
});
module.exports = router;
