const TrendService = require('../services/trend.service');

class TrendController {
    static async getTrends(req, res, next) {
        try {
            const result = await TrendService.getTrendData();

            res.status(200).json({
                status: "success",
                period: result.period,
                count: result.data.length,
                data: result.data
            });
        } catch (error) {
            // 콘솔 출력이나 res.status(500) 하드코딩 대신 전역 미들웨어로 넘깁니다.
            next(error);
        }
    }
}

module.exports = TrendController;
