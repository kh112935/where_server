const reviewRepository = require('../repositories/review.repository');

exports.writeReview = async (reviewData) => {
    // 추가적인 비즈니스 로직 (예: 하루에 한 식당에 리뷰 1개 제한 등)을 여기서 처리 가능
    return await reviewRepository.createReview(reviewData);
};

exports.getRestaurantReviews = async (restaurantId) => {
    return await reviewRepository.findReviewsByRestaurantId(restaurantId);
};

exports.editReview = async (reviewId, userId, updateData) => {
    const review = await reviewRepository.findReviewById(reviewId);
    if (!review) throw new Error('NOT_FOUND');
    if (review.user_id !== userId) throw new Error('FORBIDDEN');

    return await reviewRepository.updateReview(
        reviewId,
        updateData.rating || review.rating,
        updateData.comment || review.comment
    );
};

exports.removeReview = async (reviewId, userId) => {
    const review = await reviewRepository.findReviewById(reviewId);
    if (!review) throw new Error('NOT_FOUND');
    if (review.user_id !== userId) throw new Error('FORBIDDEN');

    return await reviewRepository.deleteReview(reviewId);
};
