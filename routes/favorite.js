const express = require('express');
const router = express.Router();
const FavoriteController = require('../controllers/favorite.controller');
const verifyToken = require('../middleware/auth');
const validate = require('../middleware/validator');
const { favoriteSchema } = require('../validators/favorite.validator');

// 1. 맛집 찜하기 추가 (인증 + Joi 유효성 검사)
router.post('/',
    verifyToken,
    validate(favoriteSchema),
    FavoriteController.postFavorite
);

// 2. 내 찜 목록 페이징 조회 (인증 필요)
router.get('/list', verifyToken, FavoriteController.getFavorites);

// 3. 전체 찜 랭킹 (누구나 조회 가능)
router.get('/ranking', FavoriteController.getRanking);

// 4. 특정 식당 찜 여부 상태 확인 (인증 필요)
router.get('/status/:restaurantId', verifyToken, FavoriteController.getStatus);

// 5. 찜 취소 (인증 필요)
router.delete('/:f_id', verifyToken, FavoriteController.deleteFavorite);

module.exports = router;
