const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
const path = require('path');

// 1. AWS S3 클라이언트 인스턴스 생성 (SDK v3 방식)
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

// 2. 이미지 파일 검증 필터 (웹셸 업로드 해킹 방어)
const fileFilter = (req, file, cb) => {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('이미지 파일(jpg, jpeg, png, gif, webp)만 업로드 가능합니다.'));
    }
};

// 3. Multer-S3 미들웨어 설정
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE, // 브라우저가 이미지를 다운로드하지 않고 화면에 바로 띄우도록 Content-Type 자동 지정
        key: (req, file, cb) => {
            // S3에 저장될 파일명 생성 (예: reviews/1678239123_4912.jpg)
            const ext = path.extname(file.originalname);
            const filename = `reviews/${Date.now()}_${Math.floor(Math.random() * 10000)}${ext}`;
            cb(null, filename);
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
    fileFilter: fileFilter
});

module.exports = upload;
