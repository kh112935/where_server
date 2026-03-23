// middleware/auth.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // 1. 프론트엔드가 헤더(Header)에 담아 보낸 토큰 추출
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer [토큰]" 형태에서 토큰만 분리

    if (!token) {
        return res.status(401).json({ status: "fail", message: "접근 권한이 없습니다. (토큰 없음)" });
    }

    // 2. 토큰 위조 여부 검사
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // 검증된 유저 정보(예: 회원ID)를 req 객체에 담아서 다음으로 넘김
        next(); // 검문 통과! 다음 로직(API) 실행해라
    } catch (error) {
        return res.status(403).json({ status: "fail", message: "유효하지 않거나 만료된 토큰입니다." });
    }
};

module.exports = verifyToken;
