const ChatbotService = require('../services/chatbot.service');

class ChatbotController {
    static async getQuestions(req, res, next) {
        try {
            const questions = await ChatbotService.getChatbotQuestions();

            res.status(200).json({
                status: "success",
                count: questions.length,
                data: questions
            });
        } catch (error) {
            next(error);
        }
    }

    static async postRecommend(req, res, next) {
        try {
            // 유효성 검사(Joi)를 통과한 안전한 데이터
            const { location, tags } = req.body;

            const result = await ChatbotService.getChatbotRecommend(location, tags);

            res.status(200).json({
                status: "success",
                message: `🤖 분석 결과, [${result.bestFood}] 메뉴를 추천합니다!`,
                keyword_used: result.bestFood,
                data: result.recommendations
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ChatbotController;
