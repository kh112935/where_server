const chatbotRepository = require('../repositories/chatbot.repository');
const recommendService = require('./recommend.service'); // 기존 추천 서비스 재활용
const { getBestFoodKeyword } = require('../recommendEngine');

exports.getChatbotQuestions = async () => {
    return await chatbotRepository.findAllQuestions();
};

exports.getChatbotRecommend = async (location, tags) => {
    // 1. 태그 분석을 통해 최적의 키워드 도출
    const bestFood = getBestFoodKeyword(tags);

    // 2. 이미 구현된 RecommendService의 로직을 그대로 호출 (코드 재사용)
    const recommendResult = await recommendService.getRecommendation(location, bestFood);

    return {
        bestFood,
        recommendations: recommendResult.data
    };
};
