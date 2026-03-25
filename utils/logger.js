const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

const logDir = 'logs'; // 로그 저장 폴더

const { combine, timestamp, printf, colorize } = winston.format;

// 로그 출력 포맷 설정
const logFormat = printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level}: ${message}`;
});

const logger = winston.createLogger({
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    transports: [
        // 1. 일반 정보 로그 (info 레벨 이상)
        new DailyRotateFile({
            level: 'info',
            datePattern: 'YYYY-MM-DD',
            dirname: path.join(logDir, 'info'),
            filename: '%DATE%.log',
            maxFiles: '14d', // 14일치 보관
            zippedArchive: true,
        }),
        // 2. 에러 로그만 따로 모으기
        new DailyRotateFile({
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            dirname: path.join(logDir, 'error'),
            filename: '%DATE%-error.log',
            maxFiles: '30d',
            zippedArchive: true,
        }),
    ],
});

// 개발 환경일 경우 터미널에도 예쁘게 출력
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: combine(
            colorize(),
            logFormat
        )
    }));
}

module.exports = logger;
