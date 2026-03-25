const favoriteService = require('../services/favorite.service');

exports.postFavorite = async (req, res) => {
    const { restaurantId } = req.body;
    const userId = req.user.userId;
    if (!restaurantId) return res.status(400).json({ status: "fail", message: "식당 ID가 필요합니다." });

    try {
        await favoriteService.addFavorite(userId, restaurantId);
        res.json({ status: "success", message: "찜 목록에 추가되었습니다." });
    } catch (error) {
        if (error.message === 'ALREADY_FAVORITE') return res.status(400).json({ status: "fail", message: "이미 찜한 식당입니다." });
        res.status(500).json({ status: "error", message: "찜하기 실패" });
    }
};

exports.getFavorites = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    try {
        const result = await favoriteService.getMyFavoriteList(req.user.userId, page, limit);
        res.json({ status: "success", ...result });
    } catch (error) {
        res.status(500).json({ status: "error", message: "조회 실패" });
    }
};

exports.getRanking = async (req, res) => {
    try {
        const data = await favoriteService.getRanking();
        res.json({ status: "success", count: data.length, data });
    } catch (error) {
        res.status(500).json({ status: "error", message: "랭킹 조회 실패" });
    }
};

exports.getStatus = async (req, res) => {
    try {
        const data = await favoriteService.getFavoriteStatus(req.user.userId, req.params.restaurantId);
        res.json({ status: "success", data });
    } catch (error) {
        res.status(500).json({ status: "error", message: "상태 확인 실패" });
    }
};

exports.deleteFavorite = async (req, res) => {
    try {
        await favoriteService.cancelFavorite(req.params.f_id, req.user.userId);
        res.json({ status: "success", message: "삭제 완료" });
    } catch (error) {
        if (error.message === 'FORBIDDEN') return res.status(403).json({ status: "fail", message: "권한 없음" });
        res.status(500).json({ status: "error", message: "삭제 실패" });
    }
};
