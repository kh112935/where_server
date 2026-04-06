const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
    // 1. HTTP 메서드에 따라 검증 타겟 분리 (실무 표준 방식)
    // GET, DELETE 요청은 URL 파라미터(req.query)를 검사하고,
    // POST, PUT, PATCH 요청은 데이터 본문(req.body)을 검사합니다.
    let target;

    if (req.method === 'GET' || req.method === 'DELETE') {
        target = req.query || {};
    } else {
        // req.body가 undefined일 경우를 대비한 안전 장치(Fallback)
        target = req.body || {};
    }

    // 2. Joi 스키마 검증 (abortEarly: false로 모든 에러를 한 번에 수집)
    const { error } = schema.validate(target, { abortEarly: false });

    // 3. 검증 실패 시 전역 에러 핸들러로 위임
    if (error) {
        const errorMessage = error.details.map(detail => detail.message).join(', ');
        const err = new Error(errorMessage);
        err.statusCode = 400; // Bad Request
        return next(err);
    }

    next();
};

module.exports = validate;
