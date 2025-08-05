-- POS Database Setup (Cleaned and Updated)
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- Create database
CREATE SCHEMA IF NOT EXISTS `pos_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `pos_db`;

-- USERS TABLE
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `user_type` TINYINT(1) NOT NULL, -- 0 = Superadmin, 1 = Admin
  `status` VARCHAR(45) NOT NULL DEFAULT 'ACTIVE',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert default superadmin and admin with hashed passwords
INSERT INTO `users` (`id`, `username`, `password`, `email`, `user_type`, `status`)
VALUES 
(1, 'superadmin', '$2b$10$wJoHQ2bLnfNl0hAy2xXgyeI55/hrSRJz5PKspzBtM0X8XzSruFzpC', 'superadmin@example.com', 0, 'ACTIVE'),
(2, 'admin', '$2b$10$0hOUmygiVGBHTsh3iTa78OBM1nY6dLYt9QCnHEVHDPPA/7ahcEc7O', 'admin@example.com', 1, 'ACTIVE');

-- CUSTOMERS TABLE (cleaned without customerscol)
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `system_type` VARCHAR(255) NOT NULL,
  `status` VARCHAR(10) NOT NULL DEFAULT 'DELETED',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Add customer_id column and foreign key to users table
ALTER TABLE `users`
  ADD COLUMN `customer_id` BIGINT DEFAULT NULL,
  ADD CONSTRAINT `fk_users_customer_id`
    FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`)
    ON DELETE SET NULL;


-- Final SQL mode reset
SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
