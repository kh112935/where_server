const reviewService = require('../services/review.service');

// 1. 리뷰 등록
exports.postReview = async (req, res, next) => {
    const { restaurantId, rating, comment } = req.body;
    const userId = req.user.userId;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const reviewId = await reviewService.writeReview({ userId, restaurantId, rating, comment, imageUrl });
        res.status(201).json({ status: "success", message: "리뷰 등록 완료", data: { reviewId } });
    } catch (error) {
        next(error); // 전역 에러 핸들러로 전달
    }
};

// 2. 식당별 전체 리뷰 조회
exports.getReviews = async (req, res, next) => {
    try {
        const reviews = await reviewService.getRestaurantReviews(req.params.restaurantId);
        res.json({ status: "success", count: reviews.length, data: reviews });
    } catch (error) {
        next(error);
    }
};

// 3. 내 리뷰 목록 조회 (추가된 부분)
exports.getMyReviews = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const reviews = await reviewService.getMyReviewList(userId);
        res.json({ status: "success", count: reviews.length, data: reviews });
    } catch (error) {
        next(error);
    }
};

// 4. 리뷰 요약 정보 조회 (추가된 부분)
exports.getReviewSummary = async (req, res, next) => {
    try {
        const { restaurantId } = req.params;
        const summary = await reviewService.getSummary(restaurantId);
        res.json({ status: "success", data: summary });
    } catch (error) {
        next(error);
    }
};

// 5. 리뷰 수정
exports.patchReview = async (req, res, next) => {
    try {
        await reviewService.editReview(req.params.r_id, req.user.userId, req.body);
        res.json({ status: "success", message: "리뷰 수정 완료" });
    } catch (error) {
        if (error.message === 'FORBIDDEN') {
            error.statusCode = 403; // 에러 핸들러에서 처리할 수 있게 상태 코드 주입
        }
        next(error);
    }
};

// 6. 리뷰 삭제
exports.deleteReview = async (req, res, next) => {
    try {
        await reviewService.removeReview(req.params.r_id, req.user.userId);
        res.json({ status: "success", message: "리뷰 삭제 완료" });
    } catch (error) {
        if (error.message === 'FORBIDDEN') {
            error.statusCode = 403;
        }
        next(error);
    }
};
