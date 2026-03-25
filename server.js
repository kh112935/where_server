require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger'); // 로거 임포트

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
    apis: [
        path.join(__dirname, 'docs', '*.yaml'),
        path.join(__dirname, 'routes', '*.js')
    ],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// --- [공통 미들웨어 및 로깅] ---
app.use(cors());
app.use(express.json());

// Morgan과 Winston 연동: 모든 HTTP 요청을 logs/info에 기록합니다.
app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) }
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- [API 라우터 연결] ---
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/recommend', require('./routes/recommend'));
app.use('/api/v1/trends', require('./routes/trends'));
app.use('/api/v1/favorite', require('./routes/favorite'));
app.use('/api/v1/chatbot', require('./routes/chatbot'));
app.use('/api/v1/review', require('./routes/review'));

// --- [404 Not Found 처리] ---
app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 라우터를 찾을 수 없습니다.`);
    error.statusCode = 404;
    next(error);
});

// --- [전역 에러 핸들링 미들웨어] ---
app.use(errorHandler);

// --- [서버 실행] ---
app.listen(PORT, () => {
    logger.info(`========================================`);
    logger.info(`✅ [어디가] 백엔드 서버 가동 중`);
    logger.info(`📖 API 문서: http://localhost:${PORT}/api-docs`);
    logger.info(`🚀 서버 포트: ${PORT}`);
    logger.info(`========================================`);
});
