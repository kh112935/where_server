const logger = require('../utils/logger');

/**
 * 전역 에러 핸들링 미들웨어
 */
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "서버 내부 오류가 발생했습니다.";

    // [로깅] winston을 사용하여 에러 기록
    // 개발 환경일 때는 스택 트레이스까지 포함하여 기록
    if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
        logger.error(`[${req.method}] ${req.url} - Message: ${message} - Stack: ${err.stack}`);
    } else {
        logger.error(`[${req.method}] ${req.url} - Status: ${statusCode} - Message: ${message}`);
    }

    res.status(statusCode).json({
        status: "error",
        statusCode: statusCode,
        message: message
    });
};

module.exports = errorHandler;
