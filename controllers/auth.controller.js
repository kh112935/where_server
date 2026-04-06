const AuthService = require('../services/auth.service');

class AuthController {
    static async signup(req, res, next) {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ status: "fail", message: "아이디와 비밀번호를 모두 입력해주세요." });
        }

        try {
            await AuthService.signUp(username, password);
            res.status(201).json({ status: "success", message: "회원가입이 완료되었습니다." });
        } catch (error) {
            next(error);
        }
    }

    static async login(req, res, next) {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ status: "fail", message: "아이디와 비밀번호를 입력해주세요." });
        }

        try {
            const token = await AuthService.login(username, password);
            res.status(200).json({ status: "success", message: "로그인 성공!", token });
        } catch (error) {
            next(error);
        }
    }

    static getProfile(req, res) {
        // 미들웨어에서 해석한 JWT Payload (req.user) 반환
        res.status(200).json({ status: "success", message: "프로필 확인 완료", user_info: req.user });
    }

    static async patchProfile(req, res, next) {
        // JWT Payload에 담긴 userId 사용
        const userId = req.user.userId;
        const profileImageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        if (!profileImageUrl) {
            return res.status(400).json({ status: "fail", message: "업로드할 이미지가 없습니다." });
        }

        try {
            await AuthService.updateProfile(userId, profileImageUrl);
            res.status(200).json({ status: "success", message: "프로필 이미지가 업데이트되었습니다." });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AuthController;
