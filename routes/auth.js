const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // 암호화 라이브러리
const pool = require('../server').pool; // DB 연결 객체
const verifyToken = require('../middleware/auth');

/** 1. 회원가입 API (비밀번호 암호화 저장) */
router.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ status: "fail", message: "아이디와 비밀번호를 입력해주세요." });

    try {
        // [1] 아이디 중복 검사
        const [existing] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
        if (existing.length > 0) return res.status(400).json({ status: "fail", message: "이미 존재하는 아이디입니다." });

        // [2] 비밀번호 단방향 암호화 (Salt 10라운드 적용)
        const hashedPassword = await bcrypt.hash(password, 10);

        // [3] DB에 저장 (원본 비밀번호는 절대 저장하지 않음)
        await pool.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword]);

        res.json({ status: "success", message: "회원가입이 완료되었습니다." });
    } catch (error) {
        console.error("❌ 회원가입 에러:", error);
        res.status(500).json({ status: "error", message: "서버 내부 오류" });
    }
});

/** 2. 로그인 API (DB 연동 및 암호 검증) */
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ status: "fail", message: "아이디와 비밀번호를 입력해주세요." });

    try {
        // [1] DB에서 해당 아이디를 가진 유저 조회
        const [users] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
        if (users.length === 0) return res.status(401).json({ status: "fail", message: "존재하지 않는 아이디입니다." });

        const user = users[0];

        // [2] 프론트에서 보낸 비밀번호와 DB의 암호화된 비밀번호 비교 검증
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ status: "fail", message: "비밀번호가 일치하지 않습니다." });

        // [3] 검증 완료 시 JWT 마패 발급 (DB의 id 값을 담아서 발급)
        const payload = { userId: user.id, username: user.username };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ status: "success", message: "로그인 성공!", token: token });
    } catch (error) {
        console.error("❌ 로그인 에러:", error);
        res.status(500).json({ status: "error", message: "서버 내부 오류" });
    }
});

/** 3. 내 정보 조회 (JWT 검증 미들웨어 통과 필요) */
router.get('/profile', verifyToken, (req, res) => {
    res.json({
        status: "success",
        message: "✅ 마패 확인 완료! VIP 구역에 오신 것을 환영합니다.",
        user_info: req.user
    });
});

module.exports = router;
