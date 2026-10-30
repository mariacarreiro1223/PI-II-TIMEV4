CREATE DATABASE gerencia_demandas;
USE gerencia_demandas;

CREATE TABLE usuarios (
id_usuario INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
nome VARCHAR(100) NOT NULL,
cpf CHAR(11) NOT NULL UNIQUE,
telefone CHAR(11) NOT NULL,
data_nascimento DATE NOT NULL,
email VARCHAR(100) UNIQUE NOT NULL,
senha VARCHAR(70) NOT NULL,
perfil ENUM(
	'Administrador', 
    'Líder de Projeto',
    'Membro da Equipe') NOT NULL,
ativo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE projetos (
id_projeto INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
nome VARCHAR(100) NOT NULL,
descricao TEXT NULL,
ativo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE projeto_usuarios (
id_projeto INT NOT NULL,
id_usuario INT NOT NULL,

PRIMARY KEY (id_projeto, id_usuario),

FOREIGN KEY (id_projeto)
	REFERENCES projetos(id_projeto),

FOREIGN KEY (id_usuario)
	REFERENCES usuarios(id_usuario)
);

CREATE TABLE demandas (
id_demanda INT PRIMARY KEY AUTO_INCREMENT,
titulo VARCHAR(70) NOT NULL,
descricao TEXT NOT NULL,
tipo ENUM(
	'Tarefa',
    'Defeito',
    'Melhoria',
    'Documentação') NOT NULL,
prioridade ENUM(
	'Crítica',
    'Alta',
    'Média',
    'Baixa') NOT NULL,
status ENUM(
	'Aberta',
    'Em andamento',
    'Em revisão',
    'Concluída',
    'Cancelada') NOT NULL DEFAULT 'Aberta',
id_projeto INT NOT NULL,
id_responsavel INT NULL,
data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
data_atualizacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
prazo_finalizacao DATE NULL,

FOREIGN KEY (id_projeto)
	REFERENCES projetos(id_projeto),

FOREIGN KEY (id_responsavel)
    REFERENCES usuarios(id_usuario)
);

CREATE TABLE comentarios(
id_comentario INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
id_demanda INT NOT NULL,
id_usuario INT NOT NULL,
texto VARCHAR(100) NOT NULL,
data_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY (id_demanda)
    REFERENCES demandas(id_demanda),

FOREIGN KEY (id_usuario)
    REFERENCES usuarios(id_usuario)
);

CREATE TABLE historico_demandas(
id_historico INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
id_demanda INT NOT NULL,
id_usuario INT NOT NULL,
campo_alterado VARCHAR(50) NOT NULL,
valor_anterior VARCHAR(100) NULL,
valor_novo VARCHAR(100) NULL,
data_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY (id_demanda)
    REFERENCES demandas(id_demanda),

FOREIGN KEY (id_usuario)
    REFERENCES usuarios(id_usuario)
);


SHOW TABLES;



