const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const verifyToken = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// 회원가입 API
router.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ status: "fail", message: "아이디와 비밀번호를 입력해주세요." });

    try {
        const [existing] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
        if (existing.length > 0) return res.status(400).json({ status: "fail", message: "이미 존재하는 아이디입니다." });

        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword]);

        res.json({ status: "success", message: "회원가입이 완료되었습니다." });
    } catch (error) {
        console.error("❌ 회원가입 에러:", error);
        res.status(500).json({ status: "error", message: "서버 내부 오류" });
    }
});

// 로그인 API
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ status: "fail", message: "아이디와 비밀번호를 입력해주세요." });

    try {
        const [users] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
        if (users.length === 0) return res.status(401).json({ status: "fail", message: "존재하지 않는 아이디입니다." });

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ status: "fail", message: "비밀번호가 일치하지 않습니다." });

        const payload = { userId: user.id, username: user.username };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ status: "success", message: "로그인 성공!", token: token });
    } catch (error) {
        console.error("❌ 로그인 에러:", error);
        res.status(500).json({ status: "error", message: "서버 내부 오류" });
    }
});

// 내 정보 조회 API
router.get('/profile', verifyToken, (req, res) => {
    res.json({
        status: "success",
        message: "✅ 마패 확인 완료! VIP 구역에 오신 것을 환영합니다.",
        user_info: req.user
    });
});

// 프로필 이미지 저장 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// 프로필 수정 API
router.patch('/profile', verifyToken, upload.single('profileImage'), async (req, res) => {
    const userId = req.user.userId;
    const { username } = req.body;
    const profileImageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        if (!username && !profileImageUrl) {
            return res.status(400).json({ status: "fail", message: "수정할 정보를 입력해주세요." });
        }

        let query = "UPDATE users SET ";
        let params = [];

        if (username) {
            query += "username = ?, ";
            params.push(username);
        }
        if (profileImageUrl) {
            query += "profile_image = ?, ";
            params.push(profileImageUrl);
        }

        query = query.replace(/, $/, "");
        query += " WHERE id = ?";
        params.push(userId);

        await pool.query(query, params);

        res.json({
            status: "success",
            message: "프로필이 업데이트되었습니다.",
            data: {
                username: username || null,
                profileImageUrl: profileImageUrl || null
            }
        });
    } catch (error) {
        console.error("❌ 프로필 수정 에러:", error);
        res.status(500).json({ status: "error", message: "프로필 수정 실패" });
    }
});

module.exports = router;
