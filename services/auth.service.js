const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AuthRepository = require('../repositories/auth.repository');

class AuthService {
    static async signUp(username, password) {
        const existingUser = await AuthRepository.findByUsername(username);
        if (existingUser) {
            const error = new Error('이미 사용 중인 아이디입니다.');
            error.statusCode = 409;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        return await AuthRepository.createUser({ username, password: hashedPassword });
    }

    static async login(username, password) {
        const user = await AuthRepository.findByUsername(username);
        if (!user) {
            const error = new Error('가입되지 않은 아이디입니다.');
            error.statusCode = 401;
            throw error;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            const error = new Error('비밀번호가 일치하지 않습니다.');
            error.statusCode = 401;
            throw error;
        }

        // DB 컬럼에 맞춰 Payload 구성 (userId, username)
        const payload = {
            userId: user.id,
            username: user.username
        };

        return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    }

    static async updateProfile(userId, profileImageUrl) {
        return await AuthRepository.updateUserProfile(userId, profileImageUrl);
    }
}

module.exports = AuthService;
