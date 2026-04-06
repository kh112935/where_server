const express = require('express');
const router = express.Router();
const RecommendController = require('../controllers/recommend.controller');
const validate = require('../middleware/validator');
const { recommendSchema, nearbySchema, complexSearchSchema } = require('../validators/recommend.validator');

// 1. 키워드 기반 맛집 추천 (GET /api/v1/recommend)
router.get('/', validate(recommendSchema), RecommendController.getRecommend);

// 2. 내 위치 기반 가까운 맛집 검색 (GET /api/v1/recommend/nearby)
router.get('/nearby', validate(nearbySchema), RecommendController.getNearby);

// 3. 평점 높은 순 맛집 랭킹 조회 (GET /api/v1/recommend/top-rated)
router.get('/top-rated', RecommendController.getTopRated);

// 4. 통합 필터 검색 (POST /api/v1/recommend/search)
router.post('/search', validate(complexSearchSchema), RecommendController.getComplexSearch);

module.exports = router;
