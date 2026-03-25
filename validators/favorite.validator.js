const Joi = require('joi');

// 1. 찜하기 추가 규칙
exports.favoriteSchema = Joi.object({
    restaurantId: Joi.string().required()
        .messages({ 'any.required': '식당 ID는 필수입니다.' })
});

// 2. 주변 맛집 검색 규칙 (Query String 검증)
exports.nearbySearchSchema = Joi.object({
    lat: Joi.number().min(-90).max(90).required()
        .messages({ 'number.base': '위도(lat)는 숫자여야 합니다.' }),
    lng: Joi.number().min(-180).max(180).required()
        .messages({ 'number.base': '경도(lng)는 숫자여야 합니다.' }),
    radius: Joi.number().min(0.1).max(10).default(1) // 반경 0.1km ~ 10km
});
