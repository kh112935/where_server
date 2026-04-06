const axios = require('axios');
const RecommendRepository = require('../repositories/recommend.repository');
const KAKAO_KEY = process.env.KAKAO_REST_API_KEY;

class RecommendService {
    // 카카오 데이터 정제 내부 메서드
    static #refineKakaoData(doc) {
        const categoryParts = doc.category_name.split(' > ');
        let category = categoryParts.pop();
        if (category.includes(',')) category = category.split(',')[0];

        return {
            id: doc.id,
            name: doc.place_name,
            address: doc.address_name.replace(/광주광역시 |광주 /g, ''), // 광주 컨텍스트 클렌징
            category: category,
            phone: doc.phone || "번호 없음",
            mapUrl: doc.place_url,
            lat: parseFloat(doc.y), // API의 y값이 위도
            lng: parseFloat(doc.x)  // API의 x값이 경도
        };
    }

    static async getRecommendation(location, food) {
        // 1. 검색 로그 비동기 기록 (await를 걸지 않아 응답 속도 지연 방지)
        RecommendRepository.saveSearchLog(location, food).catch(err => console.error("로그 저장 실패:", err.message));

        // 2. DB 캐시 확인
        const cachedData = await RecommendRepository.findCachedRestaurants(location, food);
        if (cachedData.length >= 5) {
            return { source: "database", data: cachedData };
        }

        // 3. 캐시 미스 시 카카오 API 호출
        if (!KAKAO_KEY) throw new Error("서버 환경 변수(KAKAO_REST_API_KEY)가 설정되지 않았습니다.");

        const response = await axios.get('https://dapi.kakao.com/v2/local/search/keyword.json', {
            params: { query: `광주 ${location} ${food}`, size: 15, sort: "accuracy" },
            headers: { 'Authorization': `KakaoAK ${KAKAO_KEY}` }
        });

        const refinedResults = response.data.documents.map(this.#refineKakaoData);

        // 4. 새로운 데이터를 DB에 비동기 저장
        if (refinedResults.length > 0) {
            RecommendRepository.upsertRestaurants(refinedResults).catch(err => console.error("DB 캐싱 에러:", err.message));
        }

        return { source: "kakao_api", data: refinedResults };
    }

    static async getNearby(lat, lng, radius) {
        return await RecommendRepository.findNearbyRestaurants(lat, lng, radius);
    }

    static async getTopRated(category) {
        return await RecommendRepository.findTopRated(category);
    }

    static async getComplexSearch(searchParams) {
        const { lat, lng, radius, categories, minRating } = searchParams;
        return await RecommendRepository.findComplexSearch(lat, lng, radius, categories, minRating);
    }
}

module.exports = RecommendService;
