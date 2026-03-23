/**
 * [어디가] 백엔드 메인 서버 (모듈 분리형 아키텍처)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

// --- [MySQL 연결 설정] ---
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: 'where_db',
    waitForConnections: true,
    connectionLimit: 10
});

// [중요] 분리된 파일(라우터)들에서 DB 풀을 사용할 수 있도록 내보내기
module.exports.pool = pool;

// --- [미들웨어] ---
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// --- [API 라우터 연결 (미들웨어)] ---
// 클라이언트의 요청 주소에 따라 각각의 전담 파일로 보냅니다.
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/recommend', require('./routes/recommend'));
app.use('/api/v1/trends', require('./routes/trends'));
app.use('/api/v1', require('./routes/favorite.js')); // 찜하기 관련 통합 (/favorite, /favorites)
app.use('/api/v1/chatbot', require('./routes/chatbot')); // 챗봇 관련 통합

// --- [서버 실행] ---
app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`✅ [어디가] 백엔드 서버 가동 중 (Router 분리 완료)`);
    console.log(`📍 접속 주소: http://localhost:${PORT}`);
    console.log(`🔐 DB: where_db (연결 완료)`);
    console.log(`========================================\n`);
});
