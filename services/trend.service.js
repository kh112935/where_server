const TrendRepository = require('../repositories/trend.repository');

class TrendService {
    static async getTrendData() {
        const trends = await TrendRepository.getRecentTrends();

        return {
            period: "last_1_hour",
            data: trends
        };
    }
}

module.exports = TrendService;
