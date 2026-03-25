require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const PORT = process.env.PORT || 3000;

// --- [Swagger 설정] ---
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: '어디가지 API 명세서',
            version: '1.0.0',
            description: 'AI 융합과 맛집 추천 서비스 API 문서',
        },
        servers: [{ url: `http://localhost:${PORT}` }],
        // 전역 보안 스키마 정의 (각 API yaml에서 호출하여 사용)
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
    // docs 폴더의 yaml 파일과 routes 폴더의 js 파일을 모두 스캔하도록 다중 경로 지정
    apis: [
        path.join(__dirname, 'docs', '*.yaml'),
        path.join(__dirname, 'routes', '*.js')
    ],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// --- [미들웨어 및 정적 폴더] ---
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
    console.log(`📖 API 문서: http://localhost:${PORT}/api-docs`);
    console.log(`========================================\n`);
});
