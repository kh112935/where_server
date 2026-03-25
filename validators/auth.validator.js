const Joi = require('joi');

/**
 * 1. 회원가입 및 로그인 규칙 (authSchema)
 * 라우터에서 이 이름을 사용하므로 이름을 맞췄습니다.
 */
exports.authSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required()
        .messages({
            'string.min': '아이디는 최소 3자 이상이어야 합니다.',
            'any.required': '아이디는 필수 입력 사항입니다.'
        }),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required()
        .messages({
            'string.pattern.base': '비밀번호는 영문과 숫자 조합으로 3~30자여야 합니다.',
            'any.required': '비밀번호는 필수 입력 사항입니다.'
        })
});

/**
 * 2. 프로필 수정 규칙 (profileUpdateSchema)
 */
exports.profileUpdateSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).optional()
        .messages({
            'string.min': '수정할 아이디는 최소 3자 이상이어야 합니다.'
        })
});
