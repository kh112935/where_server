const chatbotService = require('../services/chatbot.service');

exports.getQuestions = async (req, res) => {
    try {
        const questions = await chatbotService.getChatbotQuestions();
        res.json({ status: "success", data: questions });
    } catch (error) {
        console.error("❌ 챗봇 질문 조회 에러:", error.message);
        res.status(500).json({ status: "error", message: "질문 리스트를 불러오지 못했습니다." });
    }
};

exports.postRecommend = async (req, res) => {
    const { location, tags } = req.body;

    if (!location || !tags || !Array.isArray(tags)) {
        return res.status(400).json({ status: "fail", message: "지역과 태그 배열이 필요합니다." });
    }

    try {
        const result = await chatbotService.getChatbotRecommend(location, tags);
        res.json({
            status: "success",
            message: `🤖 분석 결과, [${result.bestFood}] 메뉴를 추천합니다!`,
            keyword_used: result.bestFood,
            data: result.recommendations
        });
    } catch (error) {
        console.error("❌ 챗봇 추천 에러:", error.message);
        res.status(500).json({ status: "error", message: "추천 엔진 가동 중 오류 발생" });
    }
};
