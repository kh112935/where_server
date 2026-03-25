const express = require('express');
const router = express.Router();
const recommendController = require('../controllers/recommend.controller');

/**
 * GET /api/v1/recommend
 * 키워드 기반 맛집 추천 (DB 캐시 및 카카오 API 연동)
 */
router.get('/', recommendController.getRecommend);

/**
 * GET /api/v1/recommend/nearby
 * 내 위치 기반 가까운 맛집 검색 (거리순)
 */
router.get('/nearby', recommendController.getNearby);

/**
 * GET /api/v1/recommend/top-rated
 * 평점 높은 순 맛집 랭킹 조회
 */
router.get('/top-rated', recommendController.getTopRated);

/**
 * POST /api/v1/recommend/search
 * 통합 필터 검색 (거리 + 평점 + 카테고리 복합 필터)
 */
router.post('/search', recommendController.getComplexSearch);

module.exports = router;
