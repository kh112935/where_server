const db = require('../config/db');

class ReviewRepository {
    // 1. 새로운 리뷰 생성
    static async createReview({ userId, restaurantId, rating, comment, imageUrl }) {
        const sql = `INSERT INTO reviews (user_id, restaurant_id, rating, comment, image_url) VALUES (?, ?, ?, ?, ?)`;
        const [result] = await db.execute(sql, [userId, restaurantId, rating, comment, imageUrl]);
        return result.insertId;
    }

    // 2. 특정 식당의 전체 리뷰 조회 (작성자 이름 포함)
    static async findReviewsByRestaurantId(restaurantId) {
        const sql = `
            SELECT r.r_id, r.rating, r.comment, r.image_url, r.created_at, u.username AS user_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.restaurant_id = ?
            ORDER BY r.created_at DESC
        `;
        const [rows] = await db.execute(sql, [restaurantId]);
        return rows;
    }

    // 3. 내 리뷰 목록 조회 (마이페이지용)
    static async findReviewsByUserId(userId) {
        const sql = `
            SELECT r.r_id, r.rating, r.comment, r.image_url, r.created_at, res.name AS restaurant_name
            FROM reviews r
            JOIN restaurants res ON r.restaurant_id = res.id
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC
        `;
        const [rows] = await db.execute(sql, [userId]);
        return rows;
    }

    // 4. 리뷰 통계 및 요약 정보 조회
    static async getReviewStats(restaurantId) {
        const sql = `
            SELECT 
                COUNT(r_id) AS total_reviews, 
                IFNULL(ROUND(AVG(rating), 1), 0) AS average_rating
            FROM reviews
            WHERE restaurant_id = ?
        `;
        const [rows] = await db.execute(sql, [restaurantId]);
        return rows[0];
    }

    // 5. 리뷰 ID로 단건 조회
    static async findReviewById(reviewId) {
        const [rows] = await db.execute("SELECT * FROM reviews WHERE r_id = ?", [reviewId]);
        return rows[0];
    }

    // 6. 리뷰 내용 수정
    static async updateReview(reviewId, rating, comment) {
        const sql = "UPDATE reviews SET rating = ?, comment = ? WHERE r_id = ?";
        await db.execute(sql, [rating, comment, reviewId]);
    }

    // 7. 리뷰 삭제
    static async deleteReview(reviewId) {
        await db.execute("DELETE FROM reviews WHERE r_id = ?", [reviewId]);
    }
}

module.exports = ReviewRepository;
