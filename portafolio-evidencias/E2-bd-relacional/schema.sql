CREATE TABLE categorias (
    categoria_id INT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

CREATE TABLE productos (
    producto_id VARCHAR(50) PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) CHECK (precio >= 0),
    categoria_id INT REFERENCES categorias(categoria_id),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) CHECK (estado IN ('PENDIENTE', 'PUBLICADO'))
);