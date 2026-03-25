const db = require('../config/db'); // 분리한 DB 객체 사용

// 오직 DB에서 데이터를 꺼내오는 역할만 수행합니다.
exports.getRecentTrends = async () => {
    const sql = `
        SELECT location_keyword, food_keyword, hit_count 
        FROM search_logs 
        WHERE last_searched_at >= NOW() - INTERVAL 1 HOUR
        ORDER BY hit_count DESC 
        LIMIT 5;
    `;
    const [rows] = await db.query(sql);
    return rows;
};
