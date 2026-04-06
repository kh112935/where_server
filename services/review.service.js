const ReviewRepository = require('../repositories/review.repository');

class ReviewService {
    static async writeReview(reviewData) {
        return await ReviewRepository.createReview(reviewData);
    }

    static async getRestaurantReviews(restaurantId) {
        return await ReviewRepository.findReviewsByRestaurantId(restaurantId);
    }

    static async getMyReviewList(userId) {
        return await ReviewRepository.findReviewsByUserId(userId);
    }

    static async getSummary(restaurantId) {
        const stats = await ReviewRepository.getReviewStats(restaurantId);
        if (!stats) {
            return { total_reviews: 0, average_rating: 0 };
        }
        return stats;
    }

    static async editReview(reviewId, userId, updateData) {
        const review = await ReviewRepository.findReviewById(reviewId);

        if (!review) {
            const error = new Error('존재하지 않는 리뷰입니다.');
            error.statusCode = 404;
            throw error;
        }

        if (review.user_id !== userId) {
            const error = new Error('해당 리뷰를 수정할 권한이 없습니다.');
            error.statusCode = 403; // Forbidden
            throw error;
        }

        return await ReviewRepository.updateReview(
            reviewId,
            updateData.rating || review.rating,
            updateData.comment || review.comment
        );
    }

    static async removeReview(reviewId, userId) {
        const review = await ReviewRepository.findReviewById(reviewId);

        if (!review) {
            const error = new Error('존재하지 않는 리뷰입니다.');
            error.statusCode = 404;
            throw error;
        }

        if (review.user_id !== userId) {
            const error = new Error('해당 리뷰를 삭제할 권한이 없습니다.');
            error.statusCode = 403;
            throw error;
        }

        return await ReviewRepository.deleteReview(reviewId);
    }
}

module.exports = ReviewService;
