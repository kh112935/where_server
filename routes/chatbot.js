const express = require('express');
const router = express.Router();
const ChatbotController = require('../controllers/chatbot.controller');
const validate = require('../middleware/validator');
const { chatbotRecommendSchema } = require('../validators/chatbot.validator');

/**
 * GET /api/v1/chatbot/questions
 * 챗봇의 단계별 질문 리스트 조회
 */
router.get('/questions', ChatbotController.getQuestions);

/**
 * POST /api/v1/chatbot/recommend
 * 사용자가 선택한 태그를 분석하여 메뉴 및 맛집 추천 (Joi 검사 포함)
 */
router.post('/recommend', validate(chatbotRecommendSchema), ChatbotController.postRecommend);

module.exports = router;
