const db = require('../config/db');

// 특정 사용자가 특정 식당을 이미 찜했는지 확인
exports.findFavorite = async (userId, restaurantId) => {
    const [rows] = await db.query(
        "SELECT f_id FROM favorites WHERE user_id = ? AND restaurant_id = ?",
        [userId, restaurantId]
    );
    return rows[0];
};

// 찜 추가
exports.createFavorite = async (userId, restaurantId) => {
    return await db.query(
        "INSERT INTO favorites (user_id, restaurant_id) VALUES (?, ?)",
        [userId, restaurantId]
    );
};

// 내 찜 목록 페이징 조회
exports.findMyFavorites = async (userId, limit, offset) => {
    const sql = `
        SELECT f.f_id, r.id AS restaurant_id, r.name, r.address, r.category, r.phone, r.map_url, f.created_at AS favorite_date
        FROM favorites f
        JOIN restaurants r ON f.restaurant_id = r.id
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC
        LIMIT ? OFFSET ?;
    `;
    const [rows] = await db.query(sql, [userId, limit, offset]);
    return rows;
};

// 내 찜 총 개수 조회
exports.countMyFavorites = async (userId) => {
    const [result] = await db.query("SELECT COUNT(*) AS total FROM favorites WHERE user_id = ?", [userId]);
    return result[0].total;
};

// 전체 찜 랭킹 TOP 5 조회
exports.findFavoriteRanking = async () => {
    const sql = `
        SELECT r.id AS restaurant_id, r.name, r.category, r.address, COUNT(f.f_id) AS favorite_count
        FROM restaurants r
        LEFT JOIN favorites f ON r.id = f.restaurant_id
        GROUP BY r.id
        HAVING favorite_count > 0
        ORDER BY favorite_count DESC, r.name ASC
        LIMIT 5;
    `;
    const [rows] = await db.query(sql);
    return rows;
};

// 찜 ID로 데이터 조회 (권한 확인용)
exports.findFavoriteById = async (f_id) => {
    const [rows] = await db.query("SELECT * FROM favorites WHERE f_id = ?", [f_id]);
    return rows[0];
};

// 찜 삭제
exports.deleteFavorite = async (f_id) => {
    return await db.query("DELETE FROM favorites WHERE f_id = ?", [f_id]);
};
