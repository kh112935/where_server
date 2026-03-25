const recommendService = require('../services/recommend.service');

exports.getRecommend = async (req, res) => {
    const { location, food } = req.query;
    if (!location || !food) return res.status(400).json({ status: "fail", message: "지역과 음식 정보를 모두 보내주세요." });

    try {
        const result = await recommendService.getRecommendation(location, food);
        res.json({
            status: "success",
            source: result.source,
            results: result.data.length,
            data: result.data
        });
    } catch (error) {
        console.error("❌ 추천 로직 에러:", error.message);
        res.status(500).json({ status: "error", message: "서버 내부 오류" });
    }
};

exports.getNearby = async (req, res) => {
    const { lat, lng, radius = 3 } = req.query;
    if (!lat || !lng) return res.status(400).json({ status: "fail", message: "위치 정보가 필요합니다." });

    try {
        const data = await recommendService.getNearby(lat, lng, radius);
        res.json({ status: "success", count: data.length, data });
    } catch (error) {
        res.status(500).json({ status: "error", message: "거리 계산 중 오류 발생" });
    }
};
// 평점순 조회 컨트롤러
exports.getTopRated = async (req, res) => {
    const { category } = req.query;
    try {
        // 서비스 계층에 구현된 로직 호출 (추후 서비스에 findTopRated 메서드 추가 필요)
        const data = await recommendService.getTopRated(category);
        res.json({ status: "success", count: data.length, data });
    } catch (error) {
        res.status(500).json({ status: "error", message: "랭킹 조회 중 오류 발생" });
    }
};

// 통합 검색 컨트롤러
exports.getComplexSearch = async (req, res) => {
    try {
        const data = await recommendService.getComplexSearch(req.body);
        res.json({ status: "success", count: data.length, data });
    } catch (error) {
        res.status(500).json({ status: "error", message: "통합 검색 중 서버 오류 발생" });
    }
};
