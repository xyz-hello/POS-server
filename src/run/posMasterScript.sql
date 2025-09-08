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
  `user_type` TINYINT(1) NOT NULL, -- 0 = Superadmin, 1 = Admin, 2 = Manager, 3 = Cashier
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

-- Add created_by column and foreign key to users table
ALTER TABLE `users`
  ADD COLUMN `created_by` BIGINT DEFAULT NULL,
  ADD CONSTRAINT `fk_users_created_by`
    FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
    ON DELETE SET NULL;
    
UPDATE users
SET created_by = 1
WHERE user_type = 1 AND created_by IS NULL;


-- Final SQL mode reset
SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

ALTER TABLE `users`
ADD COLUMN `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- created a tester account
-- cashier_test pw: @Test12345
-- manager_test pw: @Test12345

-- Create a test customer
INSERT INTO customers (name, system_type, status)
VALUES ('Test Dummy Customer', 'POS', 'ACTIVE');

-- Capture the auto-generated ID
SET @dummy_customer_id = LAST_INSERT_ID();

-- Hashed password for @Test12345
SET @hashed_pw = '$2b$12$bQs2LXYVjgRGyDB.ZJTjn.E7FgfIBGx2aMhKN3vqNQCEwD9LnpvCC';

-- Link existing admin to the dummy customer and update password
UPDATE users
SET customer_id = @dummy_customer_id,
    password = @hashed_pw
WHERE username = 'admin';

--  Create manager_test account (created_by = admin)
INSERT INTO users (username, password, email, user_type, status, customer_id, created_by)
VALUES (
  'manager_test',
  @hashed_pw,
  'manager_test@example.com',
  2,              -- Manager user_type
  'ACTIVE',
  @dummy_customer_id,
  2               -- created_by admin
);

-- Create cashier_test account (created_by = admin)
INSERT INTO users (username, password, email, user_type, status, customer_id, created_by)
VALUES (
  'cashier_test',
  @hashed_pw,
  'cashier_test@example.com',
  3,              -- Cashier user_type
  'ACTIVE',
  @dummy_customer_id,
  2               -- created_by admin
);
