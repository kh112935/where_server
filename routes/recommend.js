const express = require('express');
const router = express.Router();
const recommendController = require('../controllers/recommend.controller');
const validate = require('../middleware/validator'); // 유효성 검사 미들웨어
const { recommendSchema, nearbySchema, complexSearchSchema } = require('../validators/recommend.validator');

/**
 * 1. 키워드 기반 맛집 추천 (GET /)
 * 유효성 검사: location 필수
 */
router.get('/', validate(recommendSchema), recommendController.getRecommend);

/**
 * 2. 내 위치 기반 가까운 맛집 검색 (GET /nearby)
 * 유효성 검사: 위경도 숫자 및 범위 체크
 */
router.get('/nearby', validate(nearbySchema), recommendController.getNearby);

/**
 * 3. 평점 높은 순 맛집 랭킹 조회 (GET /top-rated)
 */
router.get('/top-rated', recommendController.getTopRated);

/**
 * 4. 통합 필터 검색 (POST /search)
 * 유효성 검사: 복합 필터 구조 체크
 */
router.post('/search', validate(complexSearchSchema), recommendController.getComplexSearch);

module.exports = router;
