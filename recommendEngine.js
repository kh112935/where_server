/**
 * [어디가] 챗봇 추천 알고리즘 엔진
 * 역할: 프론트에서 넘어온 추상적 태그를 분석하여 최적의 음식 키워드를 반환
 */

// 1. 매핑 딕셔너리 (실무에서는 나중에 DB로 이관하지만, 초기엔 코드로 관리)
const tagDictionary = {
    "혼밥": ["국밥", "돈까스", "라멘", "햄버거", "분식", "짜장면"],
    "데이트": ["파스타", "스테이크", "초밥", "와인", "양식", "레스토랑"],
    "가성비": ["분식", "국밥", "중국집", "도시락", "제육볶음"],
    "플렉스": ["오마카세", "소고기", "참치", "파인다이닝"],
    "스트레스해소": ["마라탕", "닭발", "엽떡", "매운갈비찜"],
    "해장": ["국밥", "짬뽕", "쌀국수", "순대국"]
};

/**
 * 2. 가중치 기반 교집합 알고리즘
 * @param {Array} tags - 사용자가 선택한 태그 배열 (예: ["혼밥", "가성비"])
 * @returns {String} - 최종 선정된 음식 키워드 (예: "국밥")
 */
const getBestFoodKeyword = (tags) => {
    if (!tags || tags.length === 0) return "맛집"; // 태그가 없으면 기본값

    const scoreBoard = {}; // 과목별 점수판처럼 키워드별 점수를 기록할 객체

    // 태그 배열을 순회하며 점수 부여
    tags.forEach(tag => {
        const foods = tagDictionary[tag];
        if (foods) {
            foods.forEach(food => {
                // 키워드가 겹칠수록 점수(가중치)가 +1씩 올라감
                scoreBoard[food] = (scoreBoard[food] || 0) + 1;
            });
        }
    });

    // 점수가 가장 높은 음식 키워드 추출 (동점일 경우 임의로 하나 선택됨)
    let bestFood = "맛집";
    let maxScore = 0;

    for (const [food, score] of Object.entries(scoreBoard)) {
        if (score > maxScore) {
            maxScore = score;
            bestFood = food;
        }
    }

    // 디버깅용 로그 (서버 터미널에서 점수판 확인 가능)
    console.log(`🤖 [추천 엔진 분석] 태그: ${tags} -> 점수판:`, scoreBoard, `=> 최종 선택: ${bestFood}`);

    return bestFood;
};

// 다른 파일에서 쓸 수 있도록 내보내기
module.exports = { getBestFoodKeyword };
