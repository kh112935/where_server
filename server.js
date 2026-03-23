/**
 * [어디가] 백엔드 메인 서버 - 통계 및 캐싱 통합 버전
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const morgan = require('morgan');
const mysql = require('mysql2/promise');
const { getBestFoodKeyword } = require('./recommendEngine'); // 추천 엔진 모듈 불러오기

const app = express();

// --- [환경 설정] ---
const KAKAO_KEY = process.env.KAKAO_REST_API_KEY;
const PORT = process.env.PORT || 3000;

// --- [MySQL 연결 설정] ---
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: 'where_db',
    waitForConnections: true,
    connectionLimit: 10
});

// --- [미들웨어] ---
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// --- [유틸리티: 데이터 정제] ---
const refineData = (doc) => {
    const categoryParts = doc.category_name.split(' > ');
    let category = categoryParts.pop();
    if (category.includes(',')) category = category.split(',')[0];
    const address = doc.address_name.replace(/광주광역시 |광주 /g, '');
    const distance = doc.distance
        ? (parseInt(doc.distance) >= 1000 ? `${(doc.distance / 1000).toFixed(1)}km` : `${doc.distance}m`)
        : "정보 없음";

    return {
        id: doc.id,
        name: doc.place_name,
        address: address,
        category: category,
        phone: doc.phone || "번호 없음",
        distance: distance,
        mapUrl: doc.place_url
    };
};

// --- [API 엔드포인트] ---

/** 1. 맛집 추천 (캐싱 + 검색 로그 저장) */
app.get('/api/v1/recommend', async (req, res) => {
    const { location, food } = req.query;
    if (!location || !food) {
        return res.status(400).json({ status: "fail", message: "지역과 음식 정보를 모두 보내주세요." });
    }

    try {
        // [로그 저장 로직] 검색 시마다 search_logs 테이블에 기록 (Upsert 방식)
        const logSql = `
            INSERT INTO search_logs (location_keyword, food_keyword, hit_count)
            VALUES (?, ?, 1)
            ON DUPLICATE KEY UPDATE hit_count = hit_count + 1;
        `;
        await pool.query(logSql, [location, food]);

        // [STEP 1] 우리 DB에서 먼저 검색 (캐싱 확인)
        const cacheSql = `
            SELECT id, name, address, category, phone, map_url 
            FROM restaurants 
            WHERE address LIKE ? AND (category LIKE ? OR name LIKE ?)
            LIMIT 15;
        `;
        const [cachedData] = await pool.query(cacheSql, [`%${location}%`, `%${food}%`, `%${food}%`]);

        if (cachedData.length >= 5) {
            console.log(`⚡ [Cache Hit] DB에서 데이터를 가져왔습니다: ${location} ${food}`);
            return res.json({
                status: "success",
                source: "database",
                results: cachedData.length,
                data: cachedData
            });
        }

        // [STEP 2] DB에 없으면 카카오 API 호출
        console.log(`🌐 [Cache Miss] 카카오 API를 호출합니다: ${location} ${food}`);
        const response = await axios.get('https://dapi.kakao.com/v2/local/search/keyword.json', {
            params: { query: `광주 ${location} ${food}`, size: 15, sort: "accuracy" },
            headers: { 'Authorization': `KakaoAK ${KAKAO_KEY}` }
        });

        const results = response.data.documents.map(refineData);

        // [STEP 3] 카카오 데이터를 DB에 저장
        for (const item of results) {
            const saveSql = `
                INSERT INTO restaurants (id, name, address, category, phone, map_url)
                VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                name = VALUES(name), address = VALUES(address), category = VALUES(category), phone = VALUES(phone);
            `;
            await pool.query(saveSql, [item.id, item.name, item.address, item.category, item.phone, item.mapUrl]);
        }

        res.json({
            status: "success",
            source: "kakao_api",
            results: results.length,
            data: results
        });

    } catch (error) {
        console.error("❌ 추천 로직 에러:", error.message);
        res.status(500).json({ status: "error", message: "서버 내부 오류" });
    }
});

/** 2. 실시간 인기 검색어 통계 (최근 1시간 기준 TOP 5) */
app.get('/api/v1/trends', async (req, res) => {
    try {
        // [수정된 SQL] 단순히 hit_count를 보는 게 아니라, 최근 1시간 이내에 업데이트된 데이터만 필터링합니다.
        const sql = `
            SELECT location_keyword, food_keyword, hit_count 
            FROM search_logs 
            WHERE last_searched_at >= NOW() - INTERVAL 1 HOUR
            ORDER BY hit_count DESC 
            LIMIT 5;
        `;
        const [trends] = await pool.query(sql);

        res.json({
            status: "success",
            period: "last_1_hour", // 프론트엔드 팀원에게 "이건 최근 1시간 데이터야"라고 알려주는 용도
            data: trends
        });
    } catch (error) {
        console.error("❌ 실시간 통계 조회 에러:", error.message);
        res.status(500).json({ status: "error", message: "실시간 데이터를 불러오지 못했습니다." });
    }
});

/** 3. 맛집 찜하기 (POST) */
app.post('/api/v1/favorite', async (req, res) => {
    const { restaurantId } = req.body;
    if (!restaurantId) {
        return res.status(400).json({ status: "fail", message: "식당 ID가 필요합니다." });
    }

    try {
        const [existing] = await pool.query("SELECT * FROM favorites WHERE restaurant_id = ?", [restaurantId]);
        if (existing.length > 0) return res.status(400).json({ status: "fail", message: "이미 찜한 식당입니다." });

        const [resExists] = await pool.query("SELECT id FROM restaurants WHERE id = ?", [restaurantId]);
        if (resExists.length === 0) return res.status(400).json({ status: "fail", message: "존재하지 않는 식당입니다." });

        await pool.query("INSERT INTO favorites (restaurant_id) VALUES (?)", [restaurantId]);
        res.json({ status: "success", message: "찜 목록에 추가되었습니다." });
    } catch (error) {
        res.status(500).json({ status: "error", message: "찜하기 오류" });
    }
});

/** 4. 찜 목록 조회 (GET) */
app.get('/api/v1/favorites', async (req, res) => {
    try {
        const sql = `
            SELECT f.f_id, r.id AS restaurant_id, r.name, r.address, r.category, r.phone, r.map_url, f.created_at AS favorite_date
            FROM favorites f
            JOIN restaurants r ON f.restaurant_id = r.id
            ORDER BY f.created_at DESC;
        `;
        const [rows] = await pool.query(sql);
        res.json({ status: "success", results: rows.length, data: rows });
    } catch (error) {
        res.status(500).json({ status: "error", message: "조회 오류" });
    }
});

/** 5. 찜 취소하기 (DELETE) */
app.delete('/api/v1/favorite/:f_id', async (req, res) => {
    const { f_id } = req.params;
    try {
        const [target] = await pool.query("SELECT * FROM favorites WHERE f_id = ?", [f_id]);
        if (target.length === 0) return res.status(404).json({ status: "fail", message: "내역 없음" });
        await pool.query("DELETE FROM favorites WHERE f_id = ?", [f_id]);
        res.json({ status: "success", message: "삭제 완료" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "삭제 오류" });
    }
});

/** 6. 챗봇 맞춤형 추천 (POST) */
app.post('/api/v1/chatbot-recommend', async (req, res) => {
    // 프론트에서 { "location": "용봉동", "tags": ["혼밥", "가성비"] } 형태로 보냄
    const { location, tags } = req.body;

    if (!location || !tags || !Array.isArray(tags)) {
        return res.status(400).json({ status: "fail", message: "지역(location)과 태그 배열(tags)이 필요합니다." });
    }

    try {
        // [1단계] 추천 엔진을 돌려서 최적의 음식 단어를 뽑아냄 (예: "국밥")
        const bestFood = getBestFoodKeyword(tags);

        // [2단계] 뽑아낸 단어로 기존의 DB 캐싱 및 카카오 API 로직을 그대로 재활용하여 검색!
        // (주의: 실무에서는 로직 중복을 피하기 위해 검색 함수를 따로 빼지만, 현재는 빠른 연동을 위해 axios 직접 호출)
        const response = await axios.get(`http://localhost:${PORT}/api/v1/recommend`, {
            params: { location: location, food: bestFood } // 우리가 만든 추천 API를 내부에서 다시 호출!
        });

        // [3단계] 최종 결과 프론트로 전달
        res.json({
            status: "success",
            message: `🤖 분석 결과, [${bestFood}] 메뉴를 추천합니다!`,
            keyword_used: bestFood,
            data: response.data.data
        });

    } catch (error) {
        console.error("❌ 챗봇 추천 에러:", error.message);
        res.status(500).json({ status: "error", message: "추천 엔진 가동 중 오류 발생" });
    }
});

// --- [서버 실행] ---
app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`✅ [어디가] 백엔드 서버 가동 중`);
    console.log(`📍 접속 주소: http://localhost:${PORT}`);
    console.log(`🔐 DB: where_db (연결 완료)`);
    console.log(`========================================\n`);
});
