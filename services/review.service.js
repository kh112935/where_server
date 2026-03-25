const reviewRepository = require('../repositories/review.repository');

// 1. 리뷰 작성
exports.writeReview = async (reviewData) => {
    // 실무 팁: 특정 식당에 대해 이미 리뷰를 남겼는지 체크하는 로직 등을 여기서 처리할 수 있습니다.
    return await reviewRepository.createReview(reviewData);
};

// 2. 식당별 전체 리뷰 조회
exports.getRestaurantReviews = async (restaurantId) => {
    return await reviewRepository.findReviewsByRestaurantId(restaurantId);
};

// 3. 내 리뷰 목록 조회 (추가된 부분)
exports.getMyReviewList = async (userId) => {
    return await reviewRepository.findReviewsByUserId(userId);
};

// 4. 리뷰 요약/통계 조회 (추가된 부분)
exports.getSummary = async (restaurantId) => {
    const stats = await reviewRepository.getReviewStats(restaurantId);
    if (!stats) {
        return { total_reviews: 0, average_rating: 0 };
    }
    return stats;
};

// 5. 리뷰 수정
exports.editReview = async (reviewId, userId, updateData) => {
    const review = await reviewRepository.findReviewById(reviewId);

    if (!review) {
        const error = new Error('존재하지 않는 리뷰입니다.');
        error.statusCode = 404;
        throw error;
    }

    if (review.user_id !== userId) {
        const error = new Error('FORBIDDEN'); // 컨트롤러에서 403으로 변환함
        throw error;
    }

    return await reviewRepository.updateReview(
        reviewId,
        updateData.rating || review.rating,
        updateData.comment || review.comment
    );
};

// 6. 리뷰 삭제
exports.removeReview = async (reviewId, userId) => {
    const review = await reviewRepository.findReviewById(reviewId);

    if (!review) {
        const error = new Error('존재하지 않는 리뷰입니다.');
        error.statusCode = 404;
        throw error;
    }

    if (review.user_id !== userId) {
        const error = new Error('FORBIDDEN');
        throw error;
    }

    return await reviewRepository.deleteReview(reviewId);
};
