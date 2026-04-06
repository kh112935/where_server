const FavoriteRepository = require('../repositories/favorite.repository');
// const recommendRepository = require('../repositories/recommend.repository'); // 향후 식당 존재 여부 상세 검증 시 활용

class FavoriteService {
    static async addFavorite(userId, restaurantId) {
        // 1. 이미 찜했는지 확인
        const isExist = await FavoriteRepository.findFavorite(userId, restaurantId);
        if (isExist) {
            const error = new Error('이미 찜한 식당입니다.');
            error.statusCode = 409; // Conflict
            throw error;
        }

        // 2. 찜 추가 실행
        return await FavoriteRepository.createFavorite(userId, restaurantId);
    }

    static async getMyFavoriteList(userId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;

        // DB I/O 병렬 처리로 응답 속도 최적화
        const [favorites, totalItems] = await Promise.all([
            FavoriteRepository.findMyFavorites(userId, limit, offset),
            FavoriteRepository.countMyFavorites(userId)
        ]);

        const totalPages = Math.ceil(totalItems / limit);

        return {
            pagination: {
                current_page: page,
                total_pages: totalPages,
                total_items: totalItems,
                items_per_page: limit
            },
            data: favorites
        };
    }

    static async getRanking() {
        return await FavoriteRepository.findFavoriteRanking();
    }

    static async getFavoriteStatus(userId, restaurantId) {
        const favorite = await FavoriteRepository.findFavorite(userId, restaurantId);
        return {
            isFavorite: !!favorite,
            f_id: favorite ? favorite.f_id : null
        };
    }

    static async cancelFavorite(f_id, userId) {
        const favorite = await FavoriteRepository.findFavoriteById(f_id);

        if (!favorite) {
            const error = new Error('해당 찜 내역을 찾을 수 없습니다.');
            error.statusCode = 404; // Not Found
            throw error;
        }

        if (favorite.user_id !== userId) {
            const error = new Error('해당 찜 내역을 삭제할 권한이 없습니다.');
            error.statusCode = 403; // Forbidden
            throw error;
        }

        return await FavoriteRepository.deleteFavorite(f_id);
    }
}

module.exports = FavoriteService;
