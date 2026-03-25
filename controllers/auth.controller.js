const authService = require('../services/auth.service');

exports.signup = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ status: "fail", message: "아이디와 비밀번호를 입력해주세요." });

    try {
        await authService.signUp(username, password);
        res.json({ status: "success", message: "회원가입이 완료되었습니다." });
    } catch (error) {
        if (error.message === 'ALREADY_EXISTS') return res.status(400).json({ status: "fail", message: "이미 존재하는 아이디입니다." });
        res.status(500).json({ status: "error", message: "서버 내부 오류" });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const token = await authService.login(username, password);
        res.json({ status: "success", message: "로그인 성공!", token });
    } catch (error) {
        if (error.message === 'USER_NOT_FOUND' || error.message === 'INVALID_PASSWORD') {
            return res.status(401).json({ status: "fail", message: "아이디 또는 비밀번호가 일치하지 않습니다." });
        }
        res.status(500).json({ status: "error", message: "서버 내부 오류" });
    }
};

exports.getProfile = (req, res) => {
    res.json({ status: "success", message: "✅ 마패 확인 완료!", user_info: req.user });
};

exports.patchProfile = async (req, res) => {
    const userId = req.user.userId;
    const { username } = req.body;
    const profileImageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!username && !profileImageUrl) return res.status(400).json({ status: "fail", message: "수정할 정보를 입력해주세요." });

    try {
        await authService.updateProfile(userId, { username, profileImageUrl });
        res.json({ status: "success", message: "프로필이 업데이트되었습니다." });
    } catch (error) {
        res.status(500).json({ status: "error", message: "프로필 수정 실패" });
    }
};
