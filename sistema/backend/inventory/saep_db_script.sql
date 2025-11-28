
CREATE DATABASE IF NOT EXISTS saep_db DEFAULT CHARACTER SET utf8;
USE saep_db;


CREATE TABLE auth_user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(150) UNIQUE NOT NULL,
    first_name VARCHAR(150),
    last_name VARCHAR(150),
    email VARCHAR(254) UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    date_joined DATETIME NOT NULL
) DEFAULT CHARSET=utf8;

CREATE TABLE products_product (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    sku VARCHAR(100) NULL, 
    description TEXT NULL, 
    quantity INTEGER NOT NULL DEFAULT 0, 
    min_quantity INTEGER NOT NULL DEFAULT 0, 
    created_at DATETIME NOT NULL
) DEFAULT CHARSET=utf8;

CREATE TABLE products_stockmovement (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    movement_type VARCHAR(3) NOT NULL,
    amount INTEGER NOT NULL,
    notes TEXT NULL,
    created_at DATETIME NOT NULL,
    performed_by_id INT NULL, 
    

    FOREIGN KEY (product_id) REFERENCES products_product(id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by_id) REFERENCES auth_user(id) ON DELETE SET NULL 
) DEFAULT CHARSET=utf8;


INSERT INTO auth_user (id, username, first_name, date_joined) VALUES
(1, 'almoxarife', 'João', NOW()),
(2, 'supervisor', 'Maria', NOW());


INSERT INTO products_product (id, name, sku, quantity, min_quantity, created_at) VALUES
(101, 'Martelo de Unha 23mm', 'MTO001', 500, 100, NOW()),
(102, 'Chave de Fenda Philips 6mm', 'CFP002', 1200, 250, NOW()),
(103, 'Alicate Universal 8 Polegadas', 'AU8003', 80, 50, NOW());


INSERT INTO products_stockmovement (product_id, movement_type, amount, performed_by_id, notes, created_at) VALUES

(101, 'IN', 500, 1, 'Carga inicial do lote 2025/A', NOW()),
(101, 'OUT', 50, 2, 'Saída para linha de montagem X', NOW()),

(102, 'IN', 1200, 1, 'Compra Fornecedor ABC', NOW()),

(103, 'IN', 80, 2, 'Carga inicial', NOW());