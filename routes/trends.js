const express = require('express');
const router = express.Router();
const trendController = require('../controllers/trend.controller');

// GET /api/v1/trends 요청을 trendController의 getTrends 메서드로 연결합니다.
router.get('/', trendController.getTrends);

module.exports = router;
