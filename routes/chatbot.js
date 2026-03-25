const express = require('express');
const router = express.Router();
const axios = require('axios');
const pool = require('../config/db');
const { getBestFoodKeyword } = require('../recommendEngine');

const PORT = process.env.PORT || 3000;

router.get('/questions', async (req, res) => {
    try {
        const sql = `SELECT step, question_text, options FROM chatbot_questions ORDER BY step ASC`;
        const [questions] = await pool.query(sql);

        res.json({
            status: "success",
            data: questions
        });
    } catch (error) {
        console.error("❌ 챗봇 질문 조회 에러:", error.message);
        res.status(500).json({ status: "error", message: "질문 리스트를 불러오지 못했습니다." });
    }
});

router.post('/recommend', async (req, res) => {
    const { location, tags } = req.body;

    if (!location || !tags || !Array.isArray(tags)) {
        return res.status(400).json({ status: "fail", message: "지역(location)과 태그 배열(tags)이 필요합니다." });
    }

    try {
        const bestFood = getBestFoodKeyword(tags);

        const response = await axios.get(`http://localhost:${PORT}/api/v1/recommend`, {
            params: { location: location, food: bestFood }
        });

        res.json({
            status: "success",
            message: `🤖 분석 결과, [${bestFood}] 메뉴를 추천합니다!`,
            keyword_used: bestFood,
            data: response.data.data
        });

    } catch (error) {
        console.error("❌ 챗봇 추천 에러:", error.message);
        res.status(500).json({ status: "error", message: "추천 엔진 가동 중 오류 발생" });
    }
});

module.exports = router;
