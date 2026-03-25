const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const verifyToken = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

/**
 * [파일 업로드 설정]
 * 파일 시스템 처리(Multer)는 HTTP 요청 파싱의 영역이므로 라우터 계층에 유지합니다.
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

// 회원가입
router.post('/signup', authController.signup);

// 로그인
router.post('/login', authController.login);

// 내 정보 조회 (JWT 인증 필요)
router.get('/profile', verifyToken, authController.getProfile);

// 프로필 수정 (JWT 인증 + 이미지 업로드 포함)
router.patch('/profile', verifyToken, upload.single('profileImage'), authController.patchProfile);

module.exports = router;
