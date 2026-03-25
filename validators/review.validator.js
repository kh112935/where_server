const Joi = require('joi');

// 1. 리뷰 작성 규칙
exports.reviewSchema = Joi.object({
    restaurantId: Joi.string().required()
        .messages({ 'any.required': '식당 ID는 필수입니다.' }),
    rating: Joi.number().integer().min(1).max(5).required()
        .messages({
            'number.min': '별점은 최소 1점 이상이어야 합니다.',
            'number.max': '별점은 최대 5점까지 가능합니다.',
            'any.required': '별점을 입력해주세요.'
        }),
    comment: Joi.string().min(5).max(300).required()
        .messages({
            'string.min': '리뷰는 최소 5자 이상 작성해주세요.',
            'string.max': '리뷰는 300자 이내로 작성해주세요.',
            'any.required': '리뷰 내용을 입력해주세요.'
        })
});

// 2. 리뷰 수정 규칙 (선택적 입력)
exports.reviewUpdateSchema = Joi.object({
    rating: Joi.number().integer().min(1).max(5).optional(),
    comment: Joi.string().min(5).max(300).optional()
});
