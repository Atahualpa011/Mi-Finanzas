-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: appfinanzas
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `type` enum('expense','income') NOT NULL,
  `color` varchar(7) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_cat_name_type` (`name`,`type`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Vivienda','expense','#FF5733'),(2,'Servicios','expense','#33FFBD'),(3,'Alimentación','expense','#FFBD33'),(4,'Transporte','expense','#3380FF'),(5,'Salud','expense','#FF33A8'),(6,'Entretenimiento','expense','#8D33FF'),(7,'Educación','expense','#33FF57'),(8,'Compras','expense','#FF33D4'),(9,'Suscripciones','expense','#33FFD7'),(10,'Viajes','expense','#FF8333'),(11,'Seguros','expense','#33B5FF'),(12,'Impuestos y tasas','expense','#FF3333'),(13,'Deudas y préstamos','expense','#FF9933'),(14,'Regalos y donaciones','expense','#33FF99'),(15,'Misceláneos','expense','#999999'),(16,'Sueldo','income','#33CCFF'),(17,'Freelance','income','#FF33CC'),(18,'Ventas','income','#33FFCC'),(19,'Inversiones','income','#CCFF33'),(20,'Reembolsos','income','#FF6633'),(21,'Regalos','income','#FF3399'),(22,'Otros ingresos','income','#CCCC33'),(23,'Gasto compartido','expense','#6f42c1'),(24,'Transferencia recibida','income','#198754');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expenses`
--

DROP TABLE IF EXISTS `expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expenses` (
  `transaction_id` int NOT NULL,
  `emotion` varchar(50) DEFAULT NULL,
  `destination` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`transaction_id`),
  CONSTRAINT `expenses_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expenses`
--

LOCK TABLES `expenses` WRITE;
/*!40000 ALTER TABLE `expenses` DISABLE KEYS */;
INSERT INTO `expenses` VALUES (10,NULL,NULL),(34,'Indiferencia','Shell'),(36,'Alivio',NULL),(37,'Culpa',NULL),(40,'Alivio','Expensas');
/*!40000 ALTER TABLE `expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `friends`
--

DROP TABLE IF EXISTS `friends`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `friends` (
  `user_id` int NOT NULL,
  `friend_id` int NOT NULL,
  `since` date NOT NULL,
  `amount_exp` decimal(10,2) DEFAULT '0.00',
  `total_spent` decimal(10,2) DEFAULT '0.00',
  `status` enum('pending','accepted','rejected') DEFAULT 'pending',
  `blocked` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`user_id`,`friend_id`),
  KEY `friend_id` (`friend_id`),
  CONSTRAINT `friends_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `friends_ibfk_2` FOREIGN KEY (`friend_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `friends`
--

LOCK TABLES `friends` WRITE;
/*!40000 ALTER TABLE `friends` DISABLE KEYS */;
INSERT INTO `friends` VALUES (7,8,'2025-07-01',4480000.00,0.00,'accepted',0),(8,7,'2025-07-01',-4480000.00,0.00,'accepted',0);
/*!40000 ALTER TABLE `friends` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group_expense_shares`
--

DROP TABLE IF EXISTS `group_expense_shares`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_expense_shares` (
  `id` int NOT NULL AUTO_INCREMENT,
  `expense_id` int NOT NULL,
  `member_id` int NOT NULL,
  `share` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `expense_id` (`expense_id`),
  KEY `member_id` (`member_id`),
  CONSTRAINT `group_expense_shares_ibfk_1` FOREIGN KEY (`expense_id`) REFERENCES `group_expenses` (`id`),
  CONSTRAINT `group_expense_shares_ibfk_2` FOREIGN KEY (`member_id`) REFERENCES `group_members` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_expense_shares`
--

LOCK TABLES `group_expense_shares` WRITE;
/*!40000 ALTER TABLE `group_expense_shares` DISABLE KEYS */;
INSERT INTO `group_expense_shares` VALUES (7,3,9,2500.00),(8,3,10,2500.00),(9,3,11,2500.00),(10,4,9,1666.66),(11,4,10,1666.66),(12,4,11,1666.68),(13,5,9,1333.33),(14,5,10,1333.33),(15,5,11,1333.34),(16,6,9,1000.00),(17,6,10,300.00),(18,6,11,700.00),(19,7,14,5000.00),(20,7,15,5000.00),(21,8,14,5000.00),(22,8,15,5000.00),(23,9,9,3333.33),(24,9,10,3333.33),(25,9,11,3333.34),(26,10,9,33333.33),(27,10,10,33333.33),(28,10,11,33333.34),(29,11,9,4104.66),(30,11,10,4104.66),(31,11,11,4104.68);
/*!40000 ALTER TABLE `group_expense_shares` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group_expenses`
--

DROP TABLE IF EXISTS `group_expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_expenses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `paid_by_member_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `time` time DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `group_id` (`group_id`),
  KEY `paid_by_member_id` (`paid_by_member_id`),
  CONSTRAINT `group_expenses_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `groups_` (`id`),
  CONSTRAINT `group_expenses_ibfk_2` FOREIGN KEY (`paid_by_member_id`) REFERENCES `group_members` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_expenses`
--

LOCK TABLES `group_expenses` WRITE;
/*!40000 ALTER TABLE `group_expenses` DISABLE KEYS */;
INSERT INTO `group_expenses` VALUES (3,8,9,7500.00,'Gasto1','2025-07-18','14:45:15'),(4,8,10,5000.00,'Gasto2','2025-07-18','14:45:40'),(5,8,11,4000.00,'Gasto3','2025-07-22','14:35:30'),(6,8,9,2000.00,'Gasto4','2025-07-22','14:52:01'),(7,10,14,10000.00,'GastoPruebaAmigos','2025-08-01','13:57:56'),(8,10,14,10000.00,'GastoPruebaAmigos','2025-08-01','13:59:12'),(9,8,9,10000.00,'Gasto1','2025-08-01','18:50:07'),(10,8,9,100000.00,'Gast','2025-08-01','19:01:11'),(11,8,9,12314.00,'asdf','2025-08-01','19:01:15');
/*!40000 ALTER TABLE `group_expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group_invitations`
--

DROP TABLE IF EXISTS `group_invitations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_invitations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `member_id` int NOT NULL,
  `invited_user_id` int NOT NULL,
  `invited_by_user_id` int NOT NULL,
  `status` enum('pending','accepted','rejected') DEFAULT 'pending',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_invitations`
--

LOCK TABLES `group_invitations` WRITE;
/*!40000 ALTER TABLE `group_invitations` DISABLE KEYS */;
INSERT INTO `group_invitations` VALUES (1,10,15,8,7,'accepted','2025-07-23 16:46:40'),(2,13,20,8,7,'accepted','2025-07-25 14:23:18'),(3,14,22,8,7,'accepted','2025-07-25 14:24:08'),(4,10,15,8,7,'accepted','2025-07-25 14:24:41'),(5,8,10,8,7,'accepted','2025-08-01 18:51:42');
/*!40000 ALTER TABLE `group_invitations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group_members`
--

DROP TABLE IF EXISTS `group_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `added_by` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `group_id` (`group_id`),
  CONSTRAINT `group_members_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `groups_` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_members`
--

LOCK TABLES `group_members` WRITE;
/*!40000 ALTER TABLE `group_members` DISABLE KEYS */;
INSERT INTO `group_members` VALUES (9,8,7,'Atahualpa11','atahualpamontivero@gmail.com',7),(10,8,8,'Miembro2',NULL,7),(11,8,NULL,'Miembro 3',NULL,7),(13,9,NULL,'Santi',NULL,7),(14,10,7,'Atahualpa11','atahualpamontivero@gmail.com',7),(15,10,8,'Miembro',NULL,7);
/*!40000 ALTER TABLE `group_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group_settlements`
--

DROP TABLE IF EXISTS `group_settlements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_settlements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `from_member_id` int NOT NULL,
  `to_member_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `date` date DEFAULT NULL,
  `time` time DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `group_id` (`group_id`),
  KEY `from_member_id` (`from_member_id`),
  KEY `to_member_id` (`to_member_id`),
  CONSTRAINT `group_settlements_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `groups_` (`id`),
  CONSTRAINT `group_settlements_ibfk_2` FOREIGN KEY (`from_member_id`) REFERENCES `group_members` (`id`),
  CONSTRAINT `group_settlements_ibfk_3` FOREIGN KEY (`to_member_id`) REFERENCES `group_members` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_settlements`
--

LOCK TABLES `group_settlements` WRITE;
/*!40000 ALTER TABLE `group_settlements` DISABLE KEYS */;
INSERT INTO `group_settlements` VALUES (1,8,10,9,799.99,'2025-07-22','15:00:21'),(2,8,11,9,2200.02,'2025-07-22','15:00:38'),(3,10,15,14,10000.00,'2025-08-01','14:16:09'),(4,8,10,9,3333.33,'2025-08-01','18:52:05');
/*!40000 ALTER TABLE `group_settlements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `groups_`
--

DROP TABLE IF EXISTS `groups_`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `groups_` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `groups_`
--

LOCK TABLES `groups_` WRITE;
/*!40000 ALTER TABLE `groups_` DISABLE KEYS */;
INSERT INTO `groups_` VALUES (3,'GrupoPrueba','',7,'2025-07-18 13:55:39'),(4,'GrupoPrueba','prueba',7,'2025-07-18 13:55:43'),(5,'GrupoPrueba','asd',7,'2025-07-18 13:55:52'),(6,'GrupoPrueba','asd',7,'2025-07-18 14:15:10'),(7,'Nombre','asd',7,'2025-07-18 14:20:20'),(8,'GrupoPrueba','asd',7,'2025-07-18 14:21:31'),(9,'GrupoPruebaAmigos','Grupo para probar invitar amigos',7,'2025-07-23 16:25:01'),(10,'GrupoPruebaAmigos',NULL,7,'2025-07-23 16:38:01');
/*!40000 ALTER TABLE `groups_` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `incomes`
--

DROP TABLE IF EXISTS `incomes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `incomes` (
  `transaction_id` int NOT NULL,
  `source` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`transaction_id`),
  CONSTRAINT `incomes_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incomes`
--

LOCK TABLES `incomes` WRITE;
/*!40000 ALTER TABLE `incomes` DISABLE KEYS */;
INSERT INTO `incomes` VALUES (9,'Trabajo'),(38,'Marketplace'),(50,'Trabajo');
/*!40000 ALTER TABLE `incomes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suggested_transactions`
--

DROP TABLE IF EXISTS `suggested_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suggested_transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `group_id` int DEFAULT NULL,
  `type` enum('expense','income') NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `related_user_id` int DEFAULT NULL,
  `group_expense_id` int DEFAULT NULL,
  `status` enum('pending','accepted','rejected') DEFAULT 'pending',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `suggested_transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suggested_transactions`
--

LOCK TABLES `suggested_transactions` WRITE;
/*!40000 ALTER TABLE `suggested_transactions` DISABLE KEYS */;
INSERT INTO `suggested_transactions` VALUES (1,7,10,'expense',10000.00,'GastoPruebaAmigos',NULL,7,'accepted','2025-08-01 13:57:56'),(2,7,10,'expense',10000.00,'GastoPruebaAmigos',NULL,8,'accepted','2025-08-01 13:59:12'),(3,7,10,'income',10000.00,'Recibiste $10000 de un miembro del grupo',8,NULL,'accepted','2025-08-01 14:16:09'),(4,8,10,'expense',10000.00,'Pagaste $10000 a un miembro del grupo',7,NULL,'accepted','2025-08-01 14:16:09'),(5,7,8,'expense',10000.00,'Gasto1',NULL,9,'accepted','2025-08-01 18:50:07'),(6,7,8,'income',3333.33,'Recibiste $3333.33 de un miembro del grupo',8,NULL,'accepted','2025-08-01 18:52:05'),(7,8,8,'expense',3333.33,'Pagaste $3333.33 a un miembro del grupo',7,NULL,'accepted','2025-08-01 18:52:05'),(8,7,8,'expense',100000.00,'Gast',NULL,10,'accepted','2025-08-01 19:01:11'),(9,7,8,'expense',12314.00,'asdf',NULL,11,'accepted','2025-08-01 19:01:15');
/*!40000 ALTER TABLE `suggested_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `type` enum('expense','income') NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `category_id` int DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES (9,7,'income','2025-07-01','15:48:00',1000000.00,16,NULL),(10,7,'expense','2025-07-01','15:48:00',250000.00,8,NULL),(34,7,'expense','2025-07-07','17:05:00',20000.00,4,'Nafta'),(36,7,'expense','2025-07-17','15:11:00',120000.00,1,'Alquiler'),(37,7,'expense','2025-07-23','15:50:00',500000.00,13,NULL),(38,7,'income','2025-07-30','14:47:00',150000.00,18,'PC vieja'),(40,7,'expense','2025-08-01','01:19:00',140000.00,2,'Agua, luz, etc'),(41,7,'expense','2025-08-01','14:10:38',10000.00,23,'GastoPruebaAmigos'),(42,7,'expense','2025-08-01','14:10:40',10000.00,23,'GastoPruebaAmigos'),(43,8,'expense','2025-08-01','14:16:19',10000.00,23,'Pagaste $10000 a un miembro del grupo'),(44,7,'income','2025-08-01','14:16:30',10000.00,23,'Recibiste $10000 de un miembro del grupo'),(45,7,'expense','2025-08-01','18:50:40',10000.00,23,'Gasto1'),(46,8,'expense','2025-08-01','18:52:11',3333.33,23,'Pagaste $3333.33 a un miembro del grupo'),(47,7,'income','2025-08-01','18:52:20',3333.33,23,'Recibiste $3333.33 de un miembro del grupo'),(48,7,'expense','2025-08-04','21:33:02',12314.00,23,'asdf'),(49,7,'expense','2025-08-04','21:33:03',100000.00,23,'Gast'),(50,7,'income','2025-08-04','21:33:00',1000000.00,16,NULL);
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transfers`
--

DROP TABLE IF EXISTS `transfers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transfers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `from_user_id` int NOT NULL,
  `to_user_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `date` datetime DEFAULT CURRENT_TIMESTAMP,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `from_user_id` (`from_user_id`),
  KEY `to_user_id` (`to_user_id`),
  CONSTRAINT `transfers_ibfk_1` FOREIGN KEY (`from_user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `transfers_ibfk_2` FOREIGN KEY (`to_user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transfers`
--

LOCK TABLES `transfers` WRITE;
/*!40000 ALTER TABLE `transfers` DISABLE KEYS */;
/*!40000 ALTER TABLE `transfers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (7,'atahualpamontivero@gmail.com','$2b$10$ukFb3Dz5EsAALpYW57HIXOpRwjTHDsGCoa1rv.J4KnzARRsnI4ZhK','2025-05-27 07:06:03'),(8,'atahualpamontivero@hotmail.com','$2b$10$LoD7zr0cd0yUAVxbvOkP1uH/Ve7yYt8dc3SxfPEBb.KPcLv5P7//y','2025-06-28 21:51:15');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_data`
--

DROP TABLE IF EXISTS `users_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_data` (
  `user_id` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `country` varchar(100) NOT NULL,
  UNIQUE KEY `username` (`username`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `users_data_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_data`
--

LOCK TABLES `users_data` WRITE;
/*!40000 ALTER TABLE `users_data` DISABLE KEYS */;
INSERT INTO `users_data` VALUES (7,'Atahualpa11','Atahualpa Montivero','Argentina'),(8,'Santiago22','Santiago Campos','España');
/*!40000 ALTER TABLE `users_data` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-20 15:16:02
