DROP DATABASE IF EXISTS `client`;
CREATE DATABASE `client`; 
USE `client`;

SET NAMES utf8 ;
SET character_set_client = utf8mb4 ;

CREATE TABLE `user` (
-- id自动递增
  `orgid` varchar(50) NOT NULL,
  `DialogueOption` LONGTEXT NOT NULL,
  PRIMARY KEY (`orgid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
-- INSERT INTO `user` VALUES ('orgid1145','htmltext');

CREATE TABLE `dialogue` (
-- id自动递增
  `id` int NOT NULL,
  `orgid` varchar(50) NOT NULL,
  `conversation` LONGTEXT NOT NULL,
  `html` LONGTEXT NOT NULL,
  `replyID` int NOT NULL,
  `isSummary` int NOT NULL,
  `isClickNewChat` int NOT NULL,
  PRIMARY KEY (`id`,`orgid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
-- INSERT INTO `dialogue` VALUES (id,'orgid','content','html',114,514,1919);