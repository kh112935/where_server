const trendService = require('../services/trend.service');

// 클라이언트와의 통신(Req/Res)만 전담합니다.
exports.getTrends = async (req, res) => {
    try {
        const result = await trendService.getTrendData();

        res.json({
            status: "success",
            period: result.period,
            data: result.data
        });
    } catch (error) {
        console.error("❌ 실시간 통계 조회 에러:", error.message);
        res.status(500).json({ status: "error", message: "실시간 데이터를 불러오지 못했습니다." });
    }
};
