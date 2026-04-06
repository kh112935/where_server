const ChatbotRepository = require('../repositories/chatbot.repository');
const RecommendService = require('./recommend.service'); // 클래스 기반으로 수정된 추천 서비스 임포트
const { getBestFoodKeyword } = require('../recommendEngine');

class ChatbotService {
    static async getChatbotQuestions() {
        return await ChatbotRepository.findAllQuestions();
    }

    static async getChatbotRecommend(location, tags) {
        // 1. 태그 분석을 통해 최적의 키워드 도출 (회원님의 외부 엔진 모듈)
        const bestFood = getBestFoodKeyword(tags);

        // 2. 이미 구현된 RecommendService의 정적 메서드 그대로 호출
        const recommendResult = await RecommendService.getRecommendation(location, bestFood);

        return {
            bestFood,
            recommendations: recommendResult.data
        };
    }
}

module.exports = ChatbotService;
