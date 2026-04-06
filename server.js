require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// [추가] DB 커넥션 풀 로드 및 최초 연결 테스트 실행
const dbPool = require('./config/db');

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
// 🛡️ 실무형 CORS 화이트리스트 보안 설정
const whitelist = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://localhost:5500'
    // 추후 플러터 웹(Web) 배포 도메인이나 실제 서비스 도메인을 여기에 추가합니다.
];

const corsOptions = {
    origin: function (origin, callback) {
        // origin이 없다는 것은 모바일 앱(Flutter 네이티브), Postman, 서버 간 통신을 의미합니다 (허용)
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('CORS 정책에 의해 차단된 접근입니다.'));
        }
    },
    credentials: true, // 프론트엔드에서 인증 헤더(JWT 토큰)를 보낼 때 필수
    optionsSuccessStatus: 200 // 구형 브라우저 호환성 유지
};

app.use(cors(corsOptions));

// JSON 페이로드 파싱
app.use(express.json());

// x-www-form-urlencoded 형태의 폼 데이터 파싱을 위한 미들웨어
app.use(express.urlencoded({ extended: true }));

// Morgan과 Winston 연동: 모든 HTTP 요청을 logs/info에 기록
app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) }
}));

// 정적 파일 제공 라우트
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- [Health Check 및 기본 엔드포인트] ---
// 서버 상태 모니터링 및 루트 경로 접근 시 응답
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: '✅ 어디가 API 서버가 정상적으로 실행 중입니다.',
        docs: '/api-docs'
    });
});

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
const server = app.listen(PORT, () => {
    logger.info(`========================================`);
    logger.info(`✅ [어디가] 백엔드 서버 가동 중`);
    logger.info(`📖 API 문서: http://localhost:${PORT}/api-docs`);
    logger.info(`🚀 서버 포트: ${PORT}`);
    logger.info(`========================================`);
});

// --- [안전한 서버 종료 (Graceful Shutdown)] ---
const gracefulShutdown = () => {
    logger.info('⚠️ 서버 종료 신호 수신. 안전한 종료를 시작합니다...');
    server.close(async () => {
        logger.info('✅ HTTP 서버가 종료되었습니다.');
        try {
            if (dbPool) {
                await dbPool.end();
                logger.info('✅ DB 커넥션 풀이 안전하게 반환되었습니다.');
            }
            process.exit(0);
        } catch (err) {
            logger.error('❌ DB 커넥션 풀 종료 중 에러 발생:', err.message);
            process.exit(1);
        }
    });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
