-- POS Database Setup (Generated via MySQL Workbench)
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- Create database if it doesn't exist
CREATE SCHEMA IF NOT EXISTS `pos_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `pos_db`;

-- Create users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB
  AUTO_INCREMENT = 4
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

-- Insert sample users
INSERT INTO `users` (`username`, `password`) VALUES ('admin', '1234');
INSERT INTO `users` (`username`, `password`) VALUES ('cashier', '5678');

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

--Addtional
ALTER TABLE `pos_db`.`users` 
ADD COLUMN `email` VARCHAR(255) NOT NULL AFTER `password`,
ADD COLUMN `salt` VARCHAR(255) NOT NULL AFTER `email`,
ADD COLUMN `user_type` TINYINT(1) NOT NULL AFTER `salt`,
ADD COLUMN `status` VARCHAR(45) NOT NULL AFTER `user_type`,
CHANGE COLUMN `id` `id` BIGINT NOT NULL AUTO_INCREMENT ,
CHANGE COLUMN `username` `username` VARCHAR(255) NOT NULL ,
CHANGE COLUMN `password` `password` VARCHAR(255) NOT NULL ;

--CUSTOMERS TABLE
CREATE TABLE `pos_db`.`customers` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `status` VARCHAR(10) NOT NULL DEFAULT 'DELETED',
  PRIMARY KEY (`id`));

--added system type 
ALTER TABLE `pos_db`.`customers` 
ADD COLUMN `System type` VARCHAR(255) NOT NULL AFTER `name`,
ADD COLUMN `customerscol` VARCHAR(45) NOT NULL AFTER `status`,
DROP PRIMARY KEY,
ADD PRIMARY KEY (`id`, `customerscol`);
;

ALTER TABLE `pos_db`.`customers` 
CHANGE COLUMN `System type` `SystemType` VARCHAR(255) NOT NULL ;

ALTER TABLE `pos_db`.`customers` 
CHANGE COLUMN `SystemType` `system_type` VARCHAR(255) NOT NULL ;


