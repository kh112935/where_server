const db = require('../config/db');

class FavoriteRepository {
    // 1. 이미 찜했는지 확인
    static async findFavorite(userId, restaurantId) {
        const query = "SELECT f_id FROM favorites WHERE user_id = ? AND restaurant_id = ?";
        const [rows] = await db.execute(query, [userId, restaurantId]);
        return rows[0];
    }

    // 2. 찜 추가
    static async createFavorite(userId, restaurantId) {
        const query = "INSERT INTO favorites (user_id, restaurant_id) VALUES (?, ?)";
        const [result] = await db.execute(query, [userId, restaurantId]);
        return result.insertId;
    }

    // 3. 내 찜 목록 페이징 조회 (에러 수정됨)
    static async findMyFavorites(userId, limit, offset) {
        // execute()의 LIMIT/OFFSET 파라미터 바인딩 충돌을 원천 차단하기 위해
        // 템플릿 리터럴로 숫자를 직접 주입하고 query()를 사용합니다.
        const sql = `
            SELECT f.f_id, r.id AS restaurant_id, r.name, r.address, r.category, r.phone, r.map_url, f.created_at AS favorite_date
            FROM favorites f
            JOIN restaurants r ON f.restaurant_id = r.id
            WHERE f.user_id = ?
            ORDER BY f.created_at DESC
            LIMIT ${Number(limit)} OFFSET ${Number(offset)}
        `;
        const [rows] = await db.query(sql, [userId]);
        return rows;
    }

    // 4. 내 찜 총 개수 조회
    static async countMyFavorites(userId) {
        const query = "SELECT COUNT(*) AS total FROM favorites WHERE user_id = ?";
        const [result] = await db.execute(query, [userId]);
        return result[0].total;
    }

    // 5. 전체 찜 랭킹 TOP 5 조회
    static async findFavoriteRanking() {
        const query = `
            SELECT r.id AS restaurant_id, r.name, r.category, r.address, COUNT(f.f_id) AS favorite_count
            FROM restaurants r
            JOIN favorites f ON r.id = f.restaurant_id
            GROUP BY r.id
            ORDER BY favorite_count DESC, r.name ASC
            LIMIT 5
        `;
        const [rows] = await db.execute(query);
        return rows;
    }

    // 6. 단건 조회
    static async findFavoriteById(f_id) {
        const query = "SELECT * FROM favorites WHERE f_id = ?";
        const [rows] = await db.execute(query, [f_id]);
        return rows[0];
    }

    // 7. 찜 취소
    static async deleteFavorite(f_id) {
        const query = "DELETE FROM favorites WHERE f_id = ?";
        const [result] = await db.execute(query, [f_id]);
        return result.affectedRows;
    }
}

module.exports = FavoriteRepository;
