const Joi = require('joi');

/**
 * 1. 회원가입 및 로그인 검증 스키마 (authSchema)
 */
exports.authSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required()
        .messages({
            'string.base': '아이디는 문자열이어야 합니다.',
            'string.alphanum': '아이디는 영문 대소문자와 숫자만 포함할 수 있습니다.',
            'string.min': '아이디는 최소 {#limit}자 이상이어야 합니다.',
            'string.max': '아이디는 최대 {#limit}자 이하이어야 합니다.',
            'any.required': '아이디는 필수 입력 사항입니다.'
        }),
    // 정규식 수정: 영문, 숫자 및 통상적인 특수문자 모두 허용
    password: Joi.string().pattern(/^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?~\\|-]{3,30}$/).required()
        .messages({
            'string.base': '비밀번호는 문자열이어야 합니다.',
            'string.pattern.base': '비밀번호는 영문, 숫자, 특수문자를 포함하여 3~30자여야 합니다.',
            'any.required': '비밀번호는 필수 입력 사항입니다.'
        })
});

/**
 * 2. 프로필 수정 검증 스키마 (profileUpdateSchema)
 */
exports.profileUpdateSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).optional()
        .messages({
            'string.base': '수정할 아이디는 문자열이어야 합니다.',
            'string.alphanum': '수정할 아이디는 영문 대소문자와 숫자만 포함할 수 있습니다.',
            'string.min': '수정할 아이디는 최소 {#limit}자 이상이어야 합니다.',
            'string.max': '수정할 아이디는 최대 {#limit}자 이하이어야 합니다.'
        })
});
