const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const verifyToken = require('../middleware/auth');
const validate = require('../middleware/validator'); // 유효성 검사 미들웨어
const { authSchema, profileUpdateSchema } = require('../validators/auth.validator'); // 규칙들
const multer = require('multer');
const path = require('path');

/**
 * [파일 업로드 설정]
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// 회원가입 (데이터 검사 추가)
router.post('/signup', validate(authSchema), authController.signup);

// 로그인 (데이터 검사 추가)
router.post('/login', validate(authSchema), authController.login);

// 내 정보 조회 (JWT 인증 필요)
router.get('/profile', verifyToken, authController.getProfile);

// 프로필 수정 (JWT 인증 + 데이터 검사 + 이미지 업로드)
router.patch('/profile',
    verifyToken,
    upload.single('profileImage'),
    validate(profileUpdateSchema),
    authController.patchProfile
);

module.exports = router;
