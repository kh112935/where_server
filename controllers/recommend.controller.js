const RecommendService = require('../services/recommend.service');

class RecommendController {
    static async getRecommend(req, res, next) {
        try {
            const { location, food } = req.query;

            if (!location) {
                return res.status(400).json({ status: "fail", message: "지역 정보를 보내주세요." });
            }

            const result = await RecommendService.getRecommendation(location, food || '');

            res.status(200).json({
                status: "success",
                source: result.source,
                count: result.data.length,
                data: result.data
            });
        } catch (error) {
            next(error);
        }
    }

    static async getNearby(req, res, next) {
        try {
            const { lat, lng, radius } = req.query;

            const data = await RecommendService.getNearby(parseFloat(lat), parseFloat(lng), parseFloat(radius));

            res.status(200).json({ status: "success", count: data.length, data });
        } catch (error) {
            next(error);
        }
    }

    static async getTopRated(req, res, next) {
        try {
            const { category } = req.query;
            const data = await RecommendService.getTopRated(category);

            res.status(200).json({ status: "success", count: data.length, data });
        } catch (error) {
            next(error);
        }
    }

    static async getComplexSearch(req, res, next) {
        try {
            const data = await RecommendService.getComplexSearch(req.body);
            res.status(200).json({ status: "success", count: data.length, data });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = RecommendController;
