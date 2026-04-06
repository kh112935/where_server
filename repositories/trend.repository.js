const db = require('../config/db');

class TrendRepository {
    /**
     * 최근 1시간 이내의 실시간 인기 검색어 TOP 5 조회
     */
    static async getRecentTrends() {
        const sql = `
            SELECT location_keyword, food_keyword, hit_count 
            FROM search_logs 
            WHERE last_searched_at >= NOW() - INTERVAL 1 HOUR
            ORDER BY hit_count DESC 
            LIMIT 5
        `;
        // execute가 아닌 query를 명시적으로 사용하여 엄격한 타입 검사 에러를 회피합니다.
        const [rows] = await db.query(sql);
        return rows;
    }
}

module.exports = TrendRepository;
