const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const verifyToken = require('../middleware/auth');
const validate = require('../middleware/validator');
const { authSchema, profileUpdateSchema } = require('../validators/auth.validator');
const multer = require('multer');
const path = require('path');

// [파일 업로드 설정]
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

// 라우터 매핑
router.post('/signup', validate(authSchema), authController.signup);
router.post('/login', validate(authSchema), authController.login);
router.get('/profile', verifyToken, authController.getProfile);
router.patch('/profile',
    verifyToken,
    upload.single('profileImage'),
    validate(profileUpdateSchema),
    authController.patchProfile
);

module.exports = router;
