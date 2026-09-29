-- 1. Código duplicado
INSERT INTO productos (producto_id, codigo, nombre, precio, categoria_id, estado) VALUES ('P021', 'COD001', 'Fallo', 10.0, 1, 'PENDIENTE');

-- 2. Precio negativo
INSERT INTO productos (producto_id, codigo, nombre, precio, categoria_id, estado) VALUES ('P022', 'COD022', 'Fallo', -5.0, 1, 'PENDIENTE');

-- 3. Categoría inexistente
INSERT INTO productos (producto_id, codigo, nombre, precio, categoria_id, estado) VALUES ('P023', 'COD023', 'Fallo', 10.0, 999, 'PENDIENTE');