const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/review.controller');
const verifyToken = require('../middleware/auth');
const validate = require('../middleware/validator');
const { reviewSchema, reviewUpdateSchema } = require('../validators/review.validator');

// S3 업로드 미들웨어 임포트
const upload = require('../middleware/upload');

// 1. 리뷰 작성 (인증 필요)
// 미들웨어 순서 중요: 토큰 검증 -> 파일 파싱(multer) -> 데이터 유효성 검사(Joi) -> 컨트롤러
router.post('/', verifyToken, upload.single('image'), validate(reviewSchema), ReviewController.postReview);

// 2. 내 리뷰 목록 조회 (인증 필요 - 파라미터 충돌 방지를 위해 먼저 선언)
router.get('/my', verifyToken, ReviewController.getMyReviews);

// 3. 특정 식당별 전체 리뷰 조회 (누구나)
router.get('/:restaurantId', ReviewController.getReviews);

// 4. 특정 식당 리뷰 요약/통계 조회 (누구나)
router.get('/summary/:restaurantId', ReviewController.getReviewSummary);

// 5. 리뷰 수정 (인증 필요)
// (참고: 추후 이미지 수정 기능까지 고도화하려면 여기에 upload.single('image')를 추가하면 됩니다.)
router.patch('/:r_id', verifyToken, validate(reviewUpdateSchema), ReviewController.patchReview);

// 6. 리뷰 삭제 (인증 필요)
router.delete('/:r_id', verifyToken, ReviewController.deleteReview);

module.exports = router;
