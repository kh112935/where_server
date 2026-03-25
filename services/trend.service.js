const trendRepository = require('../repositories/trend.repository');

// 데이터 가공 및 비즈니스 규칙을 적용합니다. (현재는 단순 전달이지만, 추후 필터링 로직 등이 이곳에 들어갑니다)
exports.getTrendData = async () => {
    const trends = await trendRepository.getRecentTrends();

    // Controller로 넘기기 전 데이터 구조를 조립합니다.
    return {
        period: "last_1_hour",
        data: trends
    };
};
