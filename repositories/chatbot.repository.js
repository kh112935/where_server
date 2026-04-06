const db = require('../config/db');

class ChatbotRepository {
    /**
     * 챗봇 단계별 질문 리스트 조회
     */
    static async findAllQuestions() {
        const sql = `SELECT step, question_text, options FROM chatbot_questions ORDER BY step ASC`;
        const [rows] = await db.query(sql);
        return rows;
    }
}

module.exports = ChatbotRepository;
