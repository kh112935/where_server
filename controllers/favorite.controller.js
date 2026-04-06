const FavoriteService = require('../services/favorite.service');

class FavoriteController {
    static async postFavorite(req, res, next) {
        try {
            const { restaurantId } = req.body;
            const userId = req.user.userId;

            // Validator가 있지만 만약을 대비한 2차 방어
            if (!restaurantId) {
                return res.status(400).json({ status: "fail", message: "식당 ID가 필요합니다." });
            }

            const favoriteId = await FavoriteService.addFavorite(userId, restaurantId);

            res.status(201).json({
                status: "success",
                message: "찜 목록에 추가되었습니다.",
                data: { favoriteId }
            });
        } catch (error) {
            next(error); // 전역 에러 핸들러로 위임
        }
    }

    static async getFavorites(req, res, next) {
        try {
            const page = parseInt(req.query.page, 10) || 1;
            const limit = parseInt(req.query.limit, 10) || 10;

            const result = await FavoriteService.getMyFavoriteList(req.user.userId, page, limit);

            res.status(200).json({
                status: "success",
                message: "내 찜 목록을 불러왔습니다.",
                ...result
            });
        } catch (error) {
            next(error);
        }
    }

    static async getRanking(req, res, next) {
        try {
            const data = await FavoriteService.getRanking();

            res.status(200).json({
                status: "success",
                count: data.length,
                data
            });
        } catch (error) {
            next(error);
        }
    }

    static async getStatus(req, res, next) {
        try {
            const restaurantId = req.params.restaurantId;
            const data = await FavoriteService.getFavoriteStatus(req.user.userId, restaurantId);

            res.status(200).json({
                status: "success",
                data
            });
        } catch (error) {
            next(error);
        }
    }

    static async deleteFavorite(req, res, next) {
        try {
            const f_id = req.params.f_id;
            await FavoriteService.cancelFavorite(f_id, req.user.userId);

            res.status(200).json({
                status: "success",
                message: "찜 삭제가 완료되었습니다."
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = FavoriteController;
