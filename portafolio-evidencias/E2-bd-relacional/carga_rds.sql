INSERT INTO categorias (categoria_id, nombre) VALUES
(1, 'Teclados'), (2, 'Pantallas'), (3, 'Ratones')
ON CONFLICT (categoria_id) DO NOTHING;

INSERT INTO productos (producto_id, codigo, nombre, descripcion, precio, categoria_id, estado) VALUES
('P001', 'COD001', 'Teclado Mecánico', 'Teclado switch blue', 50.0, 1, 'PENDIENTE'),
('P002', 'COD002', 'Teclado Membrana', 'Teclado silencioso', 20.0, 1, 'PENDIENTE'),
('P003', 'COD003', 'Teclado RGB', 'Teclado gaming', 60.0, 1, 'PENDIENTE'),
('P004', 'COD004', 'Teclado Inalámbrico', 'Bluetooth 5.0', 45.0, 1, 'PENDIENTE'),
('P005', 'COD005', 'Teclado Ergonómico', 'Diseño curvo', 70.0, 1, 'PENDIENTE'),
('P006', 'COD006', 'Ratón Gamer', 'Ratón 10k DPI', 30.0, 3, 'PENDIENTE'),
('P007', 'COD007', 'Ratón Básico', 'Ratón oficina', 10.0, 3, 'PENDIENTE'),
('P008', 'COD008', 'Ratón Inalámbrico', 'Ratón sin cable', 25.0, 3, 'PENDIENTE'),
('P009', 'COD009', 'Ratón Vertical', 'Ergonómico vertical', 35.0, 3, 'PENDIENTE'),
('P010', 'COD010', 'Ratón RGB', 'Luces configurables', 40.0, 3, 'PENDIENTE'),
('P011', 'COD011', 'Monitor 24', 'Panel IPS', 150.0, 2, 'PENDIENTE'),
('P012', 'COD012', 'Monitor 27', 'Panel VA', 200.0, 2, 'PENDIENTE'),
('P013', 'COD013', 'Monitor Curvo', 'Curvatura 1500R', 250.0, 2, 'PENDIENTE'),
('P014', 'COD014', 'Monitor 4K', 'Resolución UHD', 350.0, 2, 'PENDIENTE'),
('P015', 'COD015', 'Monitor Ultrawide', 'Formato 21:9', 400.0, 2, 'PENDIENTE'),
('P016', 'COD016', 'Monitor 144Hz', 'Alta tasa de refresco', 220.0, 2, 'PENDIENTE'),
('P017', 'COD017', 'Monitor 240Hz', 'Gaming extremo', 300.0, 2, 'PENDIENTE'),
('P018', 'COD018', 'Monitor Oficina', 'Protección visual', 120.0, 2, 'PENDIENTE'),
('P019', 'COD019', 'Monitor Portátil', 'Conexión USB-C', 180.0, 2, 'PENDIENTE'),
('P020', 'COD020', 'Monitor Táctil', 'Pantalla interactiva', 280.0, 2, 'PENDIENTE')
ON CONFLICT (producto_id) DO NOTHING;