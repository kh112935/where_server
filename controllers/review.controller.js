const reviewService = require('../services/review.service');

exports.postReview = async (req, res) => {
    const { restaurantId, rating, comment } = req.body;
    const userId = req.user.userId;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const reviewId = await reviewService.writeReview({ userId, restaurantId, rating, comment, imageUrl });
        res.status(201).json({ status: "success", message: "리뷰 등록 완료", data: { reviewId } });
    } catch (error) {
        res.status(500).json({ status: "error", message: "리뷰 등록 실패" });
    }
};

exports.getReviews = async (req, res) => {
    try {
        const reviews = await reviewService.getRestaurantReviews(req.params.restaurantId);
        res.json({ status: "success", count: reviews.length, data: reviews });
    } catch (error) {
        res.status(500).json({ status: "error", message: "조회 오류" });
    }
};

exports.patchReview = async (req, res) => {
    try {
        await reviewService.editReview(req.params.r_id, req.user.userId, req.body);
        res.json({ status: "success", message: "리뷰 수정 완료" });
    } catch (error) {
        if (error.message === 'FORBIDDEN') return res.status(403).json({ status: "fail", message: "권한 없음" });
        res.status(500).json({ status: "error", message: "수정 실패" });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        await reviewService.removeReview(req.params.r_id, req.user.userId);
        res.json({ status: "success", message: "리뷰 삭제 완료" });
    } catch (error) {
        if (error.message === 'FORBIDDEN') return res.status(403).json({ status: "fail", message: "권한 없음" });
        res.status(500).json({ status: "error", message: "삭제 실패" });
    }
};
