const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
    // body, query, params 중 데이터가 있는 곳을 검사합니다.
    const data = Object.keys(req.body).length > 0 ? req.body : req.query;
    const { error } = schema.validate(data, { abortEarly: false });

    if (error) {
        const errorMessage = error.details.map(detail => detail.message).join(', ');
        const err = new Error(errorMessage);
        err.statusCode = 400; // 잘못된 요청
        return next(err);
    }
    next();
};

module.exports = validate;
