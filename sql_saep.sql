CREATE DATABASE IF NOT EXISTS saep_db 
    DEFAULT CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;
USE saep_db;

-- TABELAS
-- Tabela: usuario
CREATE TABLE usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    papel VARCHAR(50) DEFAULT 'usuario'
);

-- Tabela: fornecedor
CREATE TABLE fornecedor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    contato VARCHAR(150),
    telefone VARCHAR(50),
    email VARCHAR(150),
    endereco VARCHAR(255)
);

-- Tabela: produto
CREATE TABLE produto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(100),
    codigo VARCHAR(50),
    preco DECIMAL(10,2) DEFAULT 0.00,
    quantidade_estoque INT DEFAULT 0,
    estoque_minimo INT DEFAULT 0,
    unidade VARCHAR(20),
    peso DECIMAL(8,3),
    tamanho VARCHAR(50),
    fornecedor_id INT NULL,
    imagem_url VARCHAR(255),
    FOREIGN KEY (fornecedor_id) REFERENCES fornecedor(id) ON DELETE SET NULL
);

-- Tabela: movimentacao
CREATE TABLE movimentacao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produto_id INT NOT NULL,
    usuario_id INT NULL,
    tipo ENUM('entrada','saida') NOT NULL,
    quantidade INT NOT NULL,
    data_mov DATETIME NOT NULL,
    motivo VARCHAR(255),
    saldo_pos_mov INT,
    FOREIGN KEY (produto_id) REFERENCES produto(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE SET NULL
);

-- INSERÇÃO DE DADOS (POPULAÇÃO)
-- Usuários
INSERT INTO usuario (nome, email, senha_hash, papel) VALUES
('Admin SAEP', 'admin@saep.local', 'changemehash', 'admin'),
('João Silva', 'joao@empresa.local', 'hash2', 'usuario'),
('Maria Souza', 'maria@empresa.local', 'hash3', 'usuario');

-- Fornecedores
INSERT INTO fornecedor (nome, contato, telefone, email, endereco) VALUES
('Fornec A', 'Carlos', '(11) 1111-1111', 'contato@forneca.com', 'Rua A, 123'),
('Fornec B', 'Ana', '(11) 2222-2222', 'contato@fornecb.com', 'Rua B, 45'),
('Fornec C', 'Pedro', '(11) 3333-3333', 'contato@fornecc.com', 'Rua C, 78');

-- Produtos
INSERT INTO produto (
    nome, descricao, categoria, codigo, preco, quantidade_estoque,
    estoque_minimo, unidade, peso, tamanho, fornecedor_id, imagem_url
) VALUES
('Martelo Standard', 'Martelo 500g com cabo de madeira', 'Ferramenta', 'M-500', 29.90, 10, 3, 'un', 0.5, 'Padrão', 1, ''),
('Chave de Fenda 6mm', 'Ponta imantada, isolamento parcial', 'Ferramenta', 'CF-006', 12.50, 15, 5, 'un', 0.12, '6mm', 2, ''),
('Alicate Universal', 'Alicate 8" para corte e crimpar', 'Ferramenta', 'AL-800', 45.00, 7, 2, 'un', 0.3, '8in', 3, '');

-- Movimentações
INSERT INTO movimentacao (
    produto_id, usuario_id, tipo, quantidade, data_mov, motivo, saldo_pos_mov
) VALUES
(1, 1, 'entrada', 5, NOW(), 'Reforço de estoque', 15),
(2, 2, 'saida', 3, NOW(), 'Uso produção', 12),
(3, 3, 'entrada', 10, NOW(), 'Compra fornecedor', 17);

