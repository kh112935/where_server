const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const verifyToken = require('../middleware/auth');
const validate = require('../middleware/validator'); // 유효성 검사 미들웨어
const { reviewSchema, reviewUpdateSchema } = require('../validators/review.validator'); // 규칙 임포트
const multer = require('multer');
const path = require('path');

/**
 * [파일 업로드 설정]
 * 파일 시스템 및 멀티파트 데이터 파싱은 HTTP 요청의 일부이므로 라우터 계층에서 정의합니다.
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'rev-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

/**
 * 1. 리뷰 작성 (일반 및 사진 포함 통합 처리)
 * [순서 중요] 
 * 1) verifyToken: 로그인 확인
 * 2) upload.single: 멀티파트 데이터 파싱 (이게 실행되어야 req.body가 채워짐)
 * 3) validate(reviewSchema): 파싱된 데이터가 규칙에 맞는지 검사
 * 4) postReview: 실제 DB 저장
 */
router.post('/',
    verifyToken,
    upload.single('image'),
    validate(reviewSchema),
    reviewController.postReview
);

// 2. 내 리뷰 목록 조회
router.get('/my/list', verifyToken, reviewController.getMyReviews);

// 3. 식당별 리뷰 요약 정보 조회
router.get('/summary/:restaurantId', reviewController.getReviewSummary);

// 4. 특정 식당의 전체 리뷰 조회
router.get('/:restaurantId', reviewController.getReviews);

// 5. 리뷰 수정 (권한 확인 로직은 Service에서 처리)
router.patch('/:r_id',
    verifyToken,
    validate(reviewUpdateSchema),
    reviewController.patchReview
);

// 6. 리뷰 삭제 (권한 확인 로직은 Service에서 처리)
router.delete('/:r_id', verifyToken, reviewController.deleteReview);

module.exports = router;
