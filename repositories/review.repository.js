const db = require('../config/db');

exports.createReview = async (reviewData) => {
    const { userId, restaurantId, rating, comment, imageUrl } = reviewData;
    const sql = `INSERT INTO reviews (user_id, restaurant_id, rating, comment, image_url) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await db.query(sql, [userId, restaurantId, rating, comment, imageUrl]);
    return result.insertId;
};

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

exports.findReviewById = async (reviewId) => {
    const [rows] = await db.query("SELECT * FROM reviews WHERE r_id = ?", [reviewId]);
    return rows[0];
};

exports.updateReview = async (reviewId, rating, comment) => {
    const sql = "UPDATE reviews SET rating = ?, comment = ? WHERE r_id = ?";
    return await db.query(sql, [rating, comment, reviewId]);
};

exports.deleteReview = async (reviewId) => {
    return await db.query("DELETE FROM reviews WHERE r_id = ?", [reviewId]);
};
