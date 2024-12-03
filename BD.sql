-- Crear base de datos
CREATE DATABASE EventosUmss;
\c EventosUmss

-- Crear tabla usuario
CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    rol VARCHAR(10) NOT NULL CHECK (rol IN ('estudiante', 'admin'))
);

-- Crear tabla evento
CREATE TABLE evento (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    image VARCHAR(100),
    category VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(100) NOT NULL,
    description TEXT,
    usuario_id INT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);

-- Crear tabla favorito
CREATE TABLE favorito (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    evento_id INT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id),
    FOREIGN KEY (evento_id) REFERENCES evento(id)
);
