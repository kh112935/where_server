const favoriteRepository = require('../repositories/favorite.repository');
const recommendRepository = require('../repositories/recommend.repository'); // 식당 존재 여부 확인용

exports.addFavorite = async (userId, restaurantId) => {
    // 1. 이미 찜했는지 확인
    const isExist = await favoriteRepository.findFavorite(userId, restaurantId);
    if (isExist) throw new Error('ALREADY_FAVORITE');

    // 2. 찜 추가 실행 (에러 핸들링은 Repository나 Controller에서 처리)
    return await favoriteRepository.createFavorite(userId, restaurantId);
};

exports.getMyFavoriteList = async (userId, page, limit) => {
    const offset = (page - 1) * limit;
    const totalItems = await favoriteRepository.countMyFavorites(userId);
    const totalPages = Math.ceil(totalItems / limit);
    const favorites = await favoriteRepository.findMyFavorites(userId, limit, offset);

    return {
        pagination: { current_page: page, total_pages: totalPages, total_items: totalItems, items_per_page: limit },
        data: favorites
    };
};

exports.getRanking = async () => {
    return await favoriteRepository.findFavoriteRanking();
};

exports.getFavoriteStatus = async (userId, restaurantId) => {
    const favorite = await favoriteRepository.findFavorite(userId, restaurantId);
    return { isFavorite: !!favorite, f_id: favorite ? favorite.f_id : null };
};

exports.cancelFavorite = async (f_id, userId) => {
    const favorite = await favoriteRepository.findFavoriteById(f_id);
    if (!favorite) throw new Error('NOT_FOUND');
    if (favorite.user_id !== userId) throw new Error('FORBIDDEN');

    return await favoriteRepository.deleteFavorite(f_id);
};
