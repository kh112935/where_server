const mysql = require('mysql2/promise');

// DB 커넥션 풀 생성 (실무 표준 설정 적용)
const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
    queueLimit: 0,
    timezone: '+09:00', // KST (한국 시간) 설정: DB와 Node.js 서버 간의 시간 동기화
    dateStrings: true   // DATETIME 값을 문자열 그대로 가져와 시간대 변형 방지
});

// 최초 1회 DB 연결 테스트 및 로깅
pool.getConnection()
    .then(connection => {
        console.log(`✅ [DB] MySQL 데이터베이스(${process.env.DB_NAME}) 연결 성공`);
        connection.release(); // 정상 연결 확인 후 커넥션을 반드시 풀에 반환
    })
    .catch(err => {
        console.error('❌ [DB] MySQL 데이터베이스 연결 실패:', err.message);
    });

module.exports = pool;
