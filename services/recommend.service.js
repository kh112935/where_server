const axios = require('axios');
const recommendRepository = require('../repositories/recommend.repository');
const KAKAO_KEY = process.env.KAKAO_REST_API_KEY;

// 카카오 데이터 정제 유틸리티
const refineKakaoData = (doc) => {
    const categoryParts = doc.category_name.split(' > ');
    let category = categoryParts.pop();
    if (category.includes(',')) category = category.split(',')[0];

    return {
        id: doc.id,
        name: doc.place_name,
        address: doc.address_name.replace(/광주광역시 |광주 /g, ''),
        category: category,
        phone: doc.phone || "번호 없음",
        mapUrl: doc.place_url
    };
};

exports.getRecommendation = async (location, food) => {
    // 1. 검색 로그 기록
    await recommendRepository.saveSearchLog(location, food);

    // 2. DB 캐시 확인
    const cachedData = await recommendRepository.findCachedRestaurants(location, food);
    if (cachedData.length >= 5) {
        return { source: "database", data: cachedData };
    }

    // 3. 캐시 미스 시 카카오 API 호출
    const response = await axios.get('https://dapi.kakao.com/v2/local/search/keyword.json', {
        params: { query: `광주 ${location} ${food}`, size: 15, sort: "accuracy" },
        headers: { 'Authorization': `KakaoAK ${KAKAO_KEY}` }
    });

    const refinedResults = response.data.documents.map(refineKakaoData);

    // 4. 새로운 데이터 DB에 저장 (백그라운드 처리 권장되지만 여기선 동기 처리)
    await recommendRepository.upsertRestaurants(refinedResults);

    return { source: "kakao_api", data: refinedResults };
};

exports.getNearby = async (lat, lng, radius) => {
    return await recommendRepository.findNearbyRestaurants(lat, lng, radius);
};
