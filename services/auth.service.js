const authRepository = require('../repositories/auth.repository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 회원가입 로직
exports.signUp = async (username, password) => {
    const existingUser = await authRepository.findUserByUsername(username);
    if (existingUser) throw new Error('ALREADY_EXISTS');

    const hashedPassword = await bcrypt.hash(password, 10);
    return await authRepository.createUser(username, hashedPassword);
};

// 로그인 로직 (토큰 반환)
exports.login = async (username, password) => {
    const user = await authRepository.findUserByUsername(username);
    if (!user) throw new Error('USER_NOT_FOUND');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('INVALID_PASSWORD');

    const payload = { userId: user.id, username: user.username };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// 프로필 수정 로직
exports.updateProfile = async (userId, updateData) => {
    return await authRepository.updateUserProfile(userId, updateData);
};
