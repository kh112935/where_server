-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: where_db
-- ------------------------------------------------------
-- Server version	8.0.45-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `chatbot_questions`
--

DROP TABLE IF EXISTS `chatbot_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chatbot_questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `step` int NOT NULL COMMENT '질문 순서',
  `question_text` varchar(255) NOT NULL COMMENT '질문 내용',
  `options` json NOT NULL COMMENT '선택지 배열 (JSON 형식)',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chatbot_questions`
--

LOCK TABLES `chatbot_questions` WRITE;
/*!40000 ALTER TABLE `chatbot_questions` DISABLE KEYS */;
INSERT INTO `chatbot_questions` VALUES (1,1,'오늘 누구와 함께 드시나요?','[\"혼밥\", \"데이트\", \"친구\", \"회식\"]'),(2,2,'어떤 분위기를 원하시나요?','[\"가성비\", \"플렉스\", \"조용한\", \"시끌벅적한\"]'),(3,3,'현재 기분은 어떠신가요?','[\"스트레스해소\", \"해장\", \"든든한\", \"가볍게\"]');
/*!40000 ALTER TABLE `chatbot_questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorites` (
  `f_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '찜한 유저의 ID (users 테이블 참조)',
  `restaurant_id` int NOT NULL COMMENT '식당 ID',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`f_id`),
  UNIQUE KEY `unique_favorite` (`user_id`,`restaurant_id`),
  CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
INSERT INTO `favorites` VALUES (1,1,1282118673,'2026-03-23 06:32:04'),(2,1,14507290,'2026-03-23 06:38:42'),(4,3,1282118673,'2026-03-30 02:35:28');
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurants`
--

DROP TABLE IF EXISTS `restaurants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurants` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `map_url` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurants`
--

LOCK TABLES `restaurants` WRITE;
/*!40000 ALTER TABLE `restaurants` DISABLE KEYS */;
INSERT INTO `restaurants` VALUES ('1027417747','면식당 전남대점','북구 용봉동 160-18','면식당','062-710-7726','http://place.map.kakao.com/1027417747','2026-03-19 07:31:59',NULL,NULL),('1181915760','창평시장국밥 전대직영점','북구 용봉동 125-6','국밥','062-251-8298','http://place.map.kakao.com/1181915760','2026-03-23 01:09:08',NULL,NULL),('12267957','원조매일국밥','북구 용봉동 1387-1','국밥','062-515-3488','http://place.map.kakao.com/12267957','2026-03-23 01:09:09',NULL,NULL),('1282118673','윤가츠당 용봉본점','북구 용봉동 3','돈까스','062-266-2022','http://place.map.kakao.com/1282118673','2026-03-19 07:31:59',35.17650000,126.91000000),('13074206','원조고향국밥','북구 용봉동 700-27','국밥','062-527-3144','http://place.map.kakao.com/13074206','2026-03-23 01:09:09',NULL,NULL),('1336621036','해태초밥','북구 신안동 10-1','초밥','번호 없음','http://place.map.kakao.com/1336621036','2026-03-19 07:21:27',NULL,NULL),('14507290','필링돈까스 본점','북구 용봉동 1129-1','돈까스','062-575-3668','http://place.map.kakao.com/14507290','2026-03-19 07:31:59',NULL,NULL),('14510933','전주현대옥 광주용봉점','북구 용봉동 1387-4','전주현대옥','062-513-7536','http://place.map.kakao.com/14510933','2026-03-23 01:09:09',NULL,NULL),('15654258','생돈까스','북구 용봉동 364-1','간식','062-526-8488','http://place.map.kakao.com/15654258','2026-03-19 07:31:59',NULL,NULL),('16195787','다다 전대점','북구 중흥동 277-25','초밥','062-269-7789','http://place.map.kakao.com/16195787','2026-03-19 07:21:27',NULL,NULL),('16426670','까동','북구 용봉동 375-4','돈까스','번호 없음','http://place.map.kakao.com/16426670','2026-03-19 07:31:59',NULL,NULL),('166017208','숙성돈까스전문점백돈 광주용봉점','북구 용봉동 1255-17','돈까스','062-512-2236','http://place.map.kakao.com/166017208','2026-03-19 07:31:59',NULL,NULL),('16980164','마니마니 전대상대점','북구 용봉동 358-13','돈까스','062-434-6765','http://place.map.kakao.com/16980164','2026-03-19 07:31:59',NULL,NULL),('1767025820','정성카츠 광주전남대점','북구 용봉동 1235-2','정성카츠','010-5619-4313','http://place.map.kakao.com/1767025820','2026-03-19 07:31:59',NULL,NULL),('1785316555','정동 전대점','북구 용봉동 159-9','돈까스','번호 없음','http://place.map.kakao.com/1785316555','2026-03-19 07:31:59',NULL,NULL),('1870639222','빛고을국밥&전골전문점','북구 용봉동 1219-10','국밥','062-528-6565','http://place.map.kakao.com/1870639222','2026-03-23 01:09:09',NULL,NULL),('18766929','금모래국밥','북구 용봉동 476-1','국밥','062-264-8536','http://place.map.kakao.com/18766929','2026-03-23 01:09:08',NULL,NULL),('18961213','참진미국밥','북구 용봉동 1205-1','국밥','062-525-3006','http://place.map.kakao.com/18961213','2026-03-23 01:09:08',NULL,NULL),('1926578052','길성유부','북구 용봉동 151-77','초밥','062-266-1202','http://place.map.kakao.com/1926578052','2026-03-19 07:21:27',NULL,NULL),('194154829','상무초밥 용봉점','북구 용봉동 1385-6','초밥','062-514-2535','http://place.map.kakao.com/194154829','2026-03-19 07:21:27',NULL,NULL),('1950446513','동백카츠 광주용봉점','북구 용봉동 1375-6','동백카츠','0507-1443-7890','http://place.map.kakao.com/1950446513','2026-03-19 07:31:59',NULL,NULL),('1986102514','인생초밥','북구 운암동 936-15','초밥','062-531-5858','http://place.map.kakao.com/1986102514','2026-03-19 07:21:27',NULL,NULL),('200382','하랑은 오치점','북구 오치동 572','초밥','070-8836-5308','http://place.map.kakao.com/200382','2026-03-19 07:21:27',NULL,NULL),('20099138','홍스시 운암점','북구 운암동 93-31','초밥','062-251-3307','http://place.map.kakao.com/20099138','2026-03-19 07:21:27',NULL,NULL),('2048336778','초밥마을','북구 중흥동 360-1','초밥','062-268-3601','http://place.map.kakao.com/2048336778','2026-03-19 07:21:27',NULL,NULL),('21223583','얌얌 전대상대점','북구 용봉동 374','돈까스','062-523-7075','http://place.map.kakao.com/21223583','2026-03-19 07:31:59',NULL,NULL),('21439387','가마솥옛날국밥','북구 용봉동 375-10','국밥','062-511-0188','http://place.map.kakao.com/21439387','2026-03-23 01:09:08',NULL,NULL),('231831725','국밥연가','북구 용봉동 1223-12','국밥','062-531-0010','http://place.map.kakao.com/231831725','2026-03-23 01:09:09',NULL,NULL),('26481884','미스터초밥왕 전대점','북구 용봉동 160-6','초밥','062-431-8859','http://place.map.kakao.com/26481884','2026-03-19 07:21:27',NULL,NULL),('26841915','미스터초밥 용봉점','북구 용봉동 1256-21','초밥','062-526-8898','http://place.map.kakao.com/26841915','2026-03-19 07:21:27',NULL,NULL),('26880620','카츠앤맘','북구 용봉동 356-4','돈까스','062-514-7577','http://place.map.kakao.com/26880620','2026-03-19 07:31:59',NULL,NULL),('27559913','돈까스만드는남자 비엔날레본점','북구 용봉동 869','양식','062-511-3668','http://place.map.kakao.com/27559913','2026-03-19 07:31:59',NULL,NULL),('357089989','수제돈가스청연 용봉운암점','북구 용봉동 1047-18','돈까스','062-513-9982','http://place.map.kakao.com/357089989','2026-03-19 07:31:59',NULL,NULL),('452821444','파도소리','북구 매곡동 370-6','초밥','062-575-1514','http://place.map.kakao.com/452821444','2026-03-19 07:21:27',NULL,NULL),('545328249','임동초밥집','북구 임동 97-37','초밥','062-521-0227','http://place.map.kakao.com/545328249','2026-03-19 07:21:27',NULL,NULL),('616626742','찐한사골국밥','북구 용봉동 1244-8','국밥','062-716-6248','http://place.map.kakao.com/616626742','2026-03-23 01:09:08',NULL,NULL),('667773391','더진국 전남대점','북구 용봉동 156-3','더진국','062-269-1525','http://place.map.kakao.com/667773391','2026-03-23 01:09:08',NULL,NULL),('703648105','돈부리가게','북구 용봉동 373','돈까스','번호 없음','http://place.map.kakao.com/703648105','2026-03-19 07:31:59',NULL,NULL),('7899390','별미콩나물국밥집','북구 용봉동 1404-7','국밥','062-512-2134','http://place.map.kakao.com/7899390','2026-03-23 01:09:08',NULL,NULL),('8460928','옴팡골콩나물국밥','북구 용봉동 161-45','국밥','062-262-9885','http://place.map.kakao.com/8460928','2026-03-23 01:09:08',NULL,NULL),('868694491','육대장 용봉점','북구 용봉동 931-1','육대장','062-513-1164','http://place.map.kakao.com/868694491','2026-03-23 01:09:08',NULL,NULL),('882000346','미카도스시 광주용봉점','북구 용봉동 1389-9','미카도스시','062-461-0402','http://place.map.kakao.com/882000346','2026-03-19 07:21:27',NULL,NULL),('885101501','국밥참맛있는집 광주용봉점','북구 용봉동 1394-3','국밥참맛있는집','062-512-0120','http://place.map.kakao.com/885101501','2026-03-23 01:09:09',NULL,NULL),('900015834','문흥수초밥','북구 문흥동 952-11','초밥','062-265-3392','http://place.map.kakao.com/900015834','2026-03-19 07:21:27',NULL,NULL),('931011398','다온초밥','북구 용봉동 1062','초밥','번호 없음','http://place.map.kakao.com/931011398','2026-03-19 07:21:27',NULL,NULL);
/*!40000 ALTER TABLE `restaurants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `r_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `restaurant_id` varchar(50) NOT NULL,
  `rating` tinyint NOT NULL,
  `comment` text NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`r_id`),
  KEY `user_id` (`user_id`),
  KEY `restaurant_id` (`restaurant_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (2,1,'1282118673',5,'사진 업로드 테스트입니다. 폴더에 잘 들어가는지 확인!','/uploads/image-1774250939286-212714079.jpg','2026-03-23 07:28:59'),(3,2,'1282118673',5,'리팩토링 후 테스트입니다. 맛집 인정!',NULL,'2026-03-25 08:19:27'),(4,3,'1282118673',5,'리팩토링 후 테스트입니다. 맛집 인정!',NULL,'2026-03-30 06:39:51'),(5,3,'1282118673',5,'리팩토링 후 테스트입니다. 맛집 인정!',NULL,'2026-03-30 06:40:06'),(6,3,'1282118673',5,'리팩토링 후 테스트입니다. 맛집 인정!',NULL,'2026-03-30 06:40:06'),(7,3,'1282118673',5,'리팩토링 후 테스트입니다. 맛집 인정!',NULL,'2026-03-30 06:40:07'),(8,3,'1282118673',5,'리팩토링 후 테스트입니다. 맛집 인정!',NULL,'2026-03-30 06:40:08'),(9,3,'1282118673',5,'리팩토링 후 테스트입니다. 맛집 인정!',NULL,'2026-03-30 06:40:09'),(10,3,'1282118673',5,'리팩토링 후 테스트입니다. 맛집 인정!',NULL,'2026-03-30 06:40:10'),(11,3,'1282118673',5,'리팩토링 후 테스트입니다. 맛집 인정!',NULL,'2026-03-30 06:40:10'),(12,3,'1282118673',5,'리팩토링 후 테스트입니다. 맛집 인정!',NULL,'2026-03-30 06:40:10'),(13,3,'1282118673',5,'리팩토링 후 테스트입니다. 맛집 인정!',NULL,'2026-03-30 06:40:10'),(14,3,'1282118673',5,'리팩토링 후 S3 이미지 업로드 연동 테스트입니다. 맛집 인정!','https://where-img-bucket-hoon.s3.ap-southeast-2.amazonaws.com/reviews/1775449743208_1921.jpg','2026-04-06 04:29:04');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `search_logs`
--

DROP TABLE IF EXISTS `search_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `search_logs` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `location_keyword` varchar(100) NOT NULL,
  `food_keyword` varchar(100) NOT NULL,
  `hit_count` int DEFAULT '1',
  `last_searched_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  UNIQUE KEY `unique_search` (`location_keyword`,`food_keyword`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `search_logs`
--

LOCK TABLES `search_logs` WRITE;
/*!40000 ALTER TABLE `search_logs` DISABLE KEYS */;
INSERT INTO `search_logs` VALUES (1,'용봉동','돈까스',16,'2026-03-25 08:23:47'),(11,'용봉동','국밥',7,'2026-04-06 03:59:34');
/*!40000 ALTER TABLE `search_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL COMMENT '로그인 아이디',
  `password` varchar(255) NOT NULL COMMENT 'bcrypt로 암호화된 비밀번호',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `profile_image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'kwanhun_new','$2b$10$DYVv76MAc0AP4JKGwUGfbO0SdXxKUbidYEIZq4jkd84ETq9zOm8jy','2026-03-23 06:28:38','/uploads/profile-1774251804195-616038354.jpg'),(2,'kwanhun123','$2b$10$qIYK4m/d6Tkua/99OAYydOWLIjET/2wuf9AJ6nHFr5rMEB/Acn8IS','2026-03-25 08:03:11',NULL),(3,'kwanhun1234','$2b$10$uGhLsq82Cf5ntff1HmU/FuEY70ESNctumcPJ7mxPR8XEEvqGdGmRS','2026-03-30 02:35:03',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-08 18:58:46
