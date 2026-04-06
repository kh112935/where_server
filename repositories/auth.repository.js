const db = require('../config/db');

class AuthRepository {
    static async findByUsername(username) {
        const query = `SELECT * FROM users WHERE username = ?`;
        const [rows] = await db.execute(query, [username]);
        return rows[0];
    }

    static async createUser({ username, password }) {
        const query = `INSERT INTO users (username, password) VALUES (?, ?)`;
        const [result] = await db.execute(query, [username, password]);
        return result.insertId;
    }

    static async updateUserProfile(userId, profileImageUrl) {
        const query = `UPDATE users SET profile_image = ? WHERE id = ?`;
        await db.execute(query, [profileImageUrl, userId]);
    }
}

module.exports = AuthRepository;
