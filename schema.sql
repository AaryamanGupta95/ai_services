-- AI-Based Local Services Delivery Platform (MySQL)
-- Database: ai_local_services
-- Note: The Spring Boot app can still run with Hibernate DDL auto-update,
-- but this schema gives you a clean, production-style baseline.

CREATE DATABASE IF NOT EXISTS ai_local_services
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE ai_local_services;

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NULL,
  role ENUM('CUSTOMER','PROVIDER','ADMIN') NOT NULL,
  city VARCHAR(255) NOT NULL,
  latitude DOUBLE NULL,
  longitude DOUBLE NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_email (email),
  KEY idx_users_role (role),
  KEY idx_users_city (city)
) ENGINE=InnoDB;

-- PROVIDER PROFILE
CREATE TABLE IF NOT EXISTS provider_profile (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  experience_years INT NULL,
  average_rating DOUBLE NULL DEFAULT 0,
  verified_status TINYINT(1) NULL DEFAULT 0,
  completed_bookings INT NULL DEFAULT 0,
  bio VARCHAR(500) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_provider_profile_user (user_id),
  CONSTRAINT fk_provider_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- SERVICE CATEGORY
CREATE TABLE IF NOT EXISTS service_category (
  id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(500) NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uk_service_category_name (name)
) ENGINE=InnoDB;

-- SERVICE (global catalog item; providers "offer" it via provider_service)
CREATE TABLE IF NOT EXISTS service (
  id BIGINT NOT NULL AUTO_INCREMENT,
  category_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(500) NULL,
  price DECIMAL(19,2) NOT NULL,
  duration_minutes INT NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_service_category (category_id),
  CONSTRAINT fk_service_category FOREIGN KEY (category_id) REFERENCES service_category(id)
) ENGINE=InnoDB;

-- PROVIDER -> SERVICE M:N
CREATE TABLE IF NOT EXISTS provider_service (
  id BIGINT NOT NULL AUTO_INCREMENT,
  provider_id BIGINT NOT NULL,
  service_id BIGINT NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uk_provider_service (provider_id, service_id),
  KEY idx_provider_service_provider (provider_id),
  KEY idx_provider_service_service (service_id),
  CONSTRAINT fk_provider_service_provider FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_provider_service_service FOREIGN KEY (service_id) REFERENCES service(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- AVAILABILITY
CREATE TABLE IF NOT EXISTS availability (
  id BIGINT NOT NULL AUTO_INCREMENT,
  provider_id BIGINT NOT NULL,
  day_of_week VARCHAR(20) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_availability_provider (provider_id),
  CONSTRAINT fk_availability_provider FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- BOOKING
CREATE TABLE IF NOT EXISTS booking (
  id BIGINT NOT NULL AUTO_INCREMENT,
  customer_id BIGINT NOT NULL,
  provider_id BIGINT NULL,
  service_id BIGINT NOT NULL,
  status ENUM('REQUESTED','ASSIGNED','REJECTED','ACCEPTED','IN_PROGRESS','COMPLETED','CANCELLED') NOT NULL,
  scheduled_time DATETIME(6) NOT NULL,
  customer_notes VARCHAR(500) NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_booking_customer (customer_id),
  KEY idx_booking_provider (provider_id),
  KEY idx_booking_service (service_id),
  KEY idx_booking_status_time (status, scheduled_time),
  CONSTRAINT fk_booking_customer FOREIGN KEY (customer_id) REFERENCES users(id),
  CONSTRAINT fk_booking_provider FOREIGN KEY (provider_id) REFERENCES users(id),
  CONSTRAINT fk_booking_service FOREIGN KEY (service_id) REFERENCES service(id)
) ENGINE=InnoDB;

-- BOOKING PROVIDER REJECTIONS (for reassign logic)
CREATE TABLE IF NOT EXISTS booking_provider_rejection (
  id BIGINT NOT NULL AUTO_INCREMENT,
  booking_id BIGINT NOT NULL,
  provider_id BIGINT NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uk_booking_provider_rejection (booking_id, provider_id),
  KEY idx_bpr_booking (booking_id),
  KEY idx_bpr_provider (provider_id),
  CONSTRAINT fk_bpr_booking FOREIGN KEY (booking_id) REFERENCES booking(id) ON DELETE CASCADE,
  CONSTRAINT fk_bpr_provider FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- REVIEW
CREATE TABLE IF NOT EXISTS review (
  id BIGINT NOT NULL AUTO_INCREMENT,
  booking_id BIGINT NOT NULL,
  customer_id BIGINT NOT NULL,
  provider_id BIGINT NOT NULL,
  rating INT NOT NULL,
  feedback VARCHAR(1000) NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uk_review_booking (booking_id),
  KEY idx_review_provider (provider_id),
  CONSTRAINT fk_review_booking FOREIGN KEY (booking_id) REFERENCES booking(id) ON DELETE CASCADE,
  CONSTRAINT fk_review_customer FOREIGN KEY (customer_id) REFERENCES users(id),
  CONSTRAINT fk_review_provider FOREIGN KEY (provider_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- NOTIFICATION
CREATE TABLE IF NOT EXISTS notification (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message VARCHAR(1000) NOT NULL,
  is_read TINYINT(1) NULL DEFAULT 0,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_notification_user (user_id, is_read, created_at),
  CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- AI RECOMMENDATION LOG
CREATE TABLE IF NOT EXISTS ai_recommendation_log (
  id BIGINT NOT NULL AUTO_INCREMENT,
  booking_id BIGINT NOT NULL,
  assigned_provider_id BIGINT NOT NULL,
  ai_score DOUBLE NOT NULL,
  raw_api_response VARCHAR(2000) NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_ai_log_booking (booking_id),
  KEY idx_ai_log_provider (assigned_provider_id),
  CONSTRAINT fk_ai_log_booking FOREIGN KEY (booking_id) REFERENCES booking(id) ON DELETE CASCADE,
  CONSTRAINT fk_ai_log_provider FOREIGN KEY (assigned_provider_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

