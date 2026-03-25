const db = require('../config/db');

// 사용자 아이디로 유저 정보 조회
exports.findUserByUsername = async (username) => {
    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
    return rows[0];
};

// 신규 사용자 등록
exports.createUser = async (username, hashedPassword) => {
    return await db.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword]);
};

// 사용자 프로필 정보 업데이트
exports.updateUserProfile = async (userId, updateData) => {
    let query = "UPDATE users SET ";
    const params = [];

    if (updateData.username) {
        query += "username = ?, ";
        params.push(updateData.username);
    }
    if (updateData.profileImageUrl) {
        query += "profile_image = ?, ";
        params.push(updateData.profileImageUrl);
    }

    query = query.replace(/, $/, "");
    query += " WHERE id = ?";
    params.push(userId);

    return await db.query(query, params);
};
