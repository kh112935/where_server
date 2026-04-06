const ReviewService = require('../services/review.service');

class ReviewController {
    static async postReview(req, res, next) {
        try {
            const { restaurantId, rating, comment } = req.body;
            const userId = req.user.userId; // verifyToken에서 파싱된 유저 ID

            // 기존 로컬 경로 대신, Multer-S3가 반환한 S3 영구 링크(location)를 추출합니다.
            const imageUrl = req.file ? req.file.location : null;

            const reviewId = await ReviewService.writeReview({ userId, restaurantId, rating, comment, imageUrl });

            res.status(201).json({
                status: "success",
                message: "리뷰 등록 완료",
                data: {
                    reviewId,
                    imageUrl // 프론트엔드에서 업로드 직후 사진을 바로 띄울 수 있도록 응답에 포함
                }
            });
        } catch (error) {
            next(error);
        }
    }

    static async getReviews(req, res, next) {
        try {
            const reviews = await ReviewService.getRestaurantReviews(req.params.restaurantId);
            res.status(200).json({ status: "success", count: reviews.length, data: reviews });
        } catch (error) {
            next(error);
        }
    }

    static async getMyReviews(req, res, next) {
        try {
            const userId = req.user.userId;
            const reviews = await ReviewService.getMyReviewList(userId);
            res.status(200).json({ status: "success", count: reviews.length, data: reviews });
        } catch (error) {
            next(error);
        }
    }

    static async getReviewSummary(req, res, next) {
        try {
            const { restaurantId } = req.params;
            const summary = await ReviewService.getSummary(restaurantId);
            res.status(200).json({ status: "success", data: summary });
        } catch (error) {
            next(error);
        }
    }

    static async patchReview(req, res, next) {
        try {
            await ReviewService.editReview(req.params.r_id, req.user.userId, req.body);
            res.status(200).json({ status: "success", message: "리뷰 수정 완료" });
        } catch (error) {
            next(error);
        }
    }

    static async deleteReview(req, res, next) {
        try {
            await ReviewService.removeReview(req.params.r_id, req.user.userId);
            res.status(200).json({ status: "success", message: "리뷰 삭제 완료" });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ReviewController;
