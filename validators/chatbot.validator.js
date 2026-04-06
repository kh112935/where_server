const Joi = require('joi');

exports.chatbotRecommendSchema = Joi.object({
    location: Joi.string().required().messages({
        'any.required': '지역 정보(location)는 필수입니다.'
    }),
    tags: Joi.array().items(Joi.string()).min(1).required().messages({
        'array.base': '태그(tags)는 배열 형태여야 합니다.',
        'array.min': '최소 1개 이상의 태그를 선택해야 합니다.',
        'any.required': '태그 배열은 필수입니다.'
    })
});
