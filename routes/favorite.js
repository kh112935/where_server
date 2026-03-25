const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favorite.controller');
const verifyToken = require('../middleware/auth');
const validate = require('../middleware/validator'); // 유효성 검사 미들웨어
const { favoriteSchema } = require('../validators/favorite.validator'); // 규칙 임포트

// 1. 맛집 찜하기 추가 (인증 + 유효성 검사)
router.post('/',
    verifyToken,
    validate(favoriteSchema),
    favoriteController.postFavorite
);

// 2. 내 찜 목록 조회 (인증 필요)
router.get('/list', verifyToken, favoriteController.getFavorites);

// 3. 전체 찜 랭킹 (누구나 조회 가능)
router.get('/ranking', favoriteController.getRanking);

// 4. 특정 식당 찜 여부 확인 (인증 필요)
router.get('/status/:restaurantId', verifyToken, favoriteController.getStatus);

// 5. 찜 취소 (인증 필요)
router.delete('/:f_id', verifyToken, favoriteController.deleteFavorite);

module.exports = router;
