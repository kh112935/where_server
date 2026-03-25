const db = require('../config/db');

// 1. 새로운 리뷰 생성
exports.createReview = async (reviewData) => {
    const { userId, restaurantId, rating, comment, imageUrl } = reviewData;
    const sql = `INSERT INTO reviews (user_id, restaurant_id, rating, comment, image_url) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await db.query(sql, [userId, restaurantId, rating, comment, imageUrl]);
    return result.insertId;
};

// 2. 특정 식당의 전체 리뷰 조회 (식당 상세 페이지용)
exports.findReviewsByRestaurantId = async (restaurantId) => {
    const sql = `
        SELECT r.r_id, r.rating, r.comment, r.image_url, r.created_at, u.username AS user_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.restaurant_id = ?
        ORDER BY r.created_at DESC
    `;
    const [rows] = await db.query(sql, [restaurantId]);
    return rows;
};

// 3. 내 리뷰 목록 조회 (마이페이지용 - 추가됨)
exports.findReviewsByUserId = async (userId) => {
    const sql = `
        SELECT r.r_id, r.rating, r.comment, r.image_url, r.created_at, res.name AS restaurant_name
        FROM reviews r
        JOIN restaurants res ON r.restaurant_id = res.id
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
    `;
    const [rows] = await db.query(sql, [userId]);
    return rows;
};

// 4. 리뷰 통계 및 요약 정보 조회 (추가됨)
exports.getReviewStats = async (restaurantId) => {
    const sql = `
        SELECT 
            COUNT(r_id) AS total_reviews, 
            IFNULL(ROUND(AVG(rating), 1), 0) AS average_rating
        FROM reviews
        WHERE restaurant_id = ?
    `;
    const [rows] = await db.query(sql, [restaurantId]);
    return rows[0];
};

// 5. 리뷰 ID로 단건 조회 (수정/삭제 권한 확인용)
exports.findReviewById = async (reviewId) => {
    const [rows] = await db.query("SELECT * FROM reviews WHERE r_id = ?", [reviewId]);
    return rows[0];
};

// 6. 리뷰 내용 수정
exports.updateReview = async (reviewId, rating, comment) => {
    const sql = "UPDATE reviews SET rating = ?, comment = ? WHERE r_id = ?";
    return await db.query(sql, [rating, comment, reviewId]);
};

// 7. 리뷰 삭제
exports.deleteReview = async (reviewId) => {
    return await db.query("DELETE FROM reviews WHERE r_id = ?", [reviewId]);
};
