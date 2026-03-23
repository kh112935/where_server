# 🍽️ 어디가 (Where) - 맞춤형 맛집 추천 서비스 (Back-end)

사용자의 현재 기분과 상황(태그)을 분석하여 최적의 맛집을 추천해 주는 대화형 추천 서비스의 백엔드 서버입니다.

## 🛠️ Tech Stack
- **Language/Framework**: Node.js, Express.js
- **Database**: MySQL (WSL Ubuntu 환경)
- **External API**: Kakao Local REST API

## ✨ Core Features (핵심 기능)

1. **지능형 챗봇 추천 엔진 (`/api/v1/chatbot-recommend`)**
   - 프론트엔드에서 전달된 감성 태그("혼밥", "가성비" 등)를 자체 알고리즘을 통해 구체적인 음식 카테고리로 매핑하여 맞춤형 결과 제공.
2. **실시간 인기 급상승 검색어 (`/api/v1/trends`)**
   - 사용자의 검색 로그를 실시간으로 수집 및 분석하여, 최근 1시간 동안 가장 많이 검색된 핫플레이스 순위(TOP 5) 제공.
3. **DB 캐싱을 통한 성능 최적화 (`/api/v1/recommend`)**
   - 카카오 API 호출 전, 자체 DB(`restaurants` 테이블)를 우선 조회(Cache Hit)하여 API 호출 비용 절감 및 응답 속도 최적화.
4. **맛집 찜하기 기능 (`/api/v1/favorite`)**
   - 마음에 드는 식당을 찜하고 모아볼 수 있는 기능 (RDBMS 외래키 매핑 활용).

---

## 🚀 Getting Started (팀원 실행 가이드)

프론트엔드 및 팀원 로컬 환경에서 서버를 실행하기 위한 세팅 방법입니다.

### 1. Repository Clone & 패키지 설치
\`\`\`bash
git clone https://github.com/kh112935/where_server.git
cd where_server
npm install
\`\`\`

### 2. 환경 변수 (.env) 설정
루트 디렉토리에 `.env` 파일을 생성하고 아래 값을 입력하세요. (보안상 실제 키는 팀 메신저 확인)
\`\`\`env
PORT=3000
KAKAO_REST_API_KEY=발급받은_카카오키
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=본인DB비밀번호
\`\`\`

### 3. Database 세팅 (MySQL)
로컬 MySQL에 `where_db` 데이터베이스 및 필수 테이블(`restaurants`, `favorites`, `search_logs`)을 생성해야 합니다. (제공된 SQL 스크립트 실행)

### 4. 서버 실행
\`\`\`bash
node server.js
\`\`\`
- 정상 구동 시 터미널에 `✅ [어디가] 백엔드 서버 가동 중` 메시지가 출력됩니다.

---

## 📡 API Reference (엔드포인트 명세서)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/recommend?location=용봉동&food=돈까스` | 기본 지역/음식 기반 맛집 검색 |
| `GET` | `/api/v1/trends` | 실시간 인기 검색어 TOP 5 (최근 1시간) |
| `POST` | `/api/v1/favorite` | 식당 찜하기 |
| `GET` | `/api/v1/favorites` | 내 찜 목록 조회 |
| `DELETE` | `/api/v1/favorite/:f_id` | 찜 취소 |
| `GET` | `/api/v1/chatbot/questions` | [챗봇] 질문 리스트 조회 |
| `POST` | `/api/v1/chatbot/recommend` | [챗봇] 태그 기반 맞춤형 식당 추천 |
