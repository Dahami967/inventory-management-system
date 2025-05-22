-- Create the database
CREATE DATABASE IF NOT EXISTS inventory_system;
USE inventory_system;

-- Drop tables if they exist to avoid errors
DROP TABLE IF EXISTS stock_history;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS users;

-- Create items table
CREATE TABLE items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    itemName VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    unitPrice DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    minimumStock INT NOT NULL DEFAULT 0,
    supplier VARCHAR(255) NOT NULL,
    purchaseDate DATE NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_supplier (supplier)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create stock_history table
CREATE TABLE stock_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    itemId INT NOT NULL,
    quantity INT NOT NULL,
    type ENUM('in', 'out') NOT NULL,
    reason TEXT,
    updatedBy INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (updatedBy) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_itemId (itemId),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
