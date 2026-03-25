const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favorite.controller');
const verifyToken = require('../middleware/auth');

// 찜하기 추가
router.post('/', verifyToken, favoriteController.postFavorite);

// 내 찜 목록 조회
router.get('/list', verifyToken, favoriteController.getFavorites);

// 전체 찜 랭킹
router.get('/ranking', favoriteController.getRanking);

// 찜 여부 확인
router.get('/status/:restaurantId', verifyToken, favoriteController.getStatus);

// 찜 취소
router.delete('/:f_id', verifyToken, favoriteController.deleteFavorite);

module.exports = router;
