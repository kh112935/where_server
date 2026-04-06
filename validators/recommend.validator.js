const Joi = require('joi');

/**
 * [추천/검색] 도메인 유효성 검사 규칙
 */

// 1. 일반 키워드 검색 (GET /api/v1/recommend)
exports.recommendSchema = Joi.object({
    location: Joi.string().required().messages({
        'any.required': '위치 정보는 필수입니다.'
    }),
    food: Joi.string().optional()
});

// 2. 주변 맛집 검색 (GET /api/v1/recommend/nearby)
exports.nearbySchema = Joi.object({
    lat: Joi.number().min(-90).max(90).required()
        .messages({
            'number.base': '위도(lat)는 숫자여야 합니다.',
            'any.required': '현재 위도 좌표가 필요합니다.'
        }),
    lng: Joi.number().min(-180).max(180).required()
        .messages({
            'number.base': '경도(lng)는 숫자여야 합니다.',
            'any.required': '현재 경도 좌표가 필요합니다.'
        }),
    radius: Joi.number().min(0.1).max(20).default(1) // 반경 0.1km ~ 20km
});

// 3. 통합 필터 복합 검색 (POST /api/v1/recommend/search)
exports.complexSearchSchema = Joi.object({
    lat: Joi.number().min(-90).max(90).required()
        .messages({
            'number.base': '위도(lat)는 숫자여야 합니다.',
            'any.required': '현재 위도 좌표가 필요합니다.'
        }),
    lng: Joi.number().min(-180).max(180).required()
        .messages({
            'number.base': '경도(lng)는 숫자여야 합니다.',
            'any.required': '현재 경도 좌표가 필요합니다.'
        }),
    categories: Joi.array().items(Joi.string()).optional(),
    minRating: Joi.number().min(0).max(5).default(0),
    radius: Joi.number().min(0.1).max(20).default(2)
});
