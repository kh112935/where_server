const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbot.controller');

/**
 * GET /api/v1/chatbot/questions
 * 챗봇의 단계별 질문 리스트 조회
 */
router.get('/questions', chatbotController.getQuestions);

/**
 * POST /api/v1/chatbot/recommend
 * 사용자가 선택한 태그를 분석하여 메뉴 및 맛집 추천
 */
router.post('/recommend', chatbotController.postRecommend);

module.exports = router;
