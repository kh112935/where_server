require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mysql = require('mysql2/promise');
const path = require('path');
const swaggerUi = require('swagger-ui-express'); // 추가
const swaggerJsdoc = require('swagger-jsdoc'); // 추가

const app = express();
const PORT = process.env.PORT || 3000;

// server.js의 swaggerOptions 부분을 아래와 같이 업데이트하세요.
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: '어디가지 API 명세서',
            version: '1.0.0',
            description: 'AI 융합과 맛집 추천 서비스 API 문서',
        },
        servers: [{ url: `http://localhost:${PORT}` }],
        // [추가] JWT 보안 정의
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: [path.join(__dirname, 'routes', '*.js')],
};

const specs = swaggerJsdoc(swaggerOptions);
// 실제 Swagger UI를 /api-docs 경로에 연결합니다.
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// --- [미들웨어 및 정적 폴더] ---
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- [MySQL 연결 설정] ---
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: 'where_db',
    waitForConnections: true,
    connectionLimit: 10
});
module.exports.pool = pool;

// --- [API 라우터 연결] ---
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/recommend', require('./routes/recommend'));
app.use('/api/v1/trends', require('./routes/trends'));
app.use('/api/v1/favorite', require('./routes/favorite.js'));
app.use('/api/v1/chatbot', require('./routes/chatbot'));
app.use('/api/v1/review', require('./routes/review.js'));

// --- [서버 실행] ---
app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`✅ [어디가] 백엔드 서버 가동 중`);
    console.log(`📖 API 문서: http://localhost:${PORT}/api-docs`); // 주소 안내 추가
    console.log(`========================================\n`);
});
