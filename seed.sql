-- Script de seed para ejecutar DESPUÉS de que TypeORM cree las tablas
-- Ejecutar con: docker compose exec postgres psql -U jeferson -d sportsline -f /seed.sql

-- ==================== CATEGORÍAS (5 ejemplos) ====================
INSERT INTO categories (name, description) 
VALUES 
    ('Deportes', 'Artículos y equipos deportivos'),
    ('Ropa Deportiva', 'Vestimenta para deportes'),
    ('Calzado', 'Zapatos deportivos'),
    ('Accesorios', 'Accesorios deportivos y de entrenamiento'),
    ('Nutrición', 'Suplementos y productos nutricionales deportivos')
ON CONFLICT (name) DO NOTHING;

-- ==================== USUARIOS (5 ejemplos) ====================
-- Contraseñas hasheadas (all 'password123'):
-- admin@sportsline.com / admin123
-- user@sportsline.com / user123
-- Otros / password123
INSERT INTO users (name, email, password, role) 
VALUES 
    ('Admin User', 'admin@sportsline.com', '$2b$10$1Az1DoNa4YvUjzCtio7ltOaBa.zuuRslcMtGE0hy99VJtYLMD6Aua', 'admin'),
    ('Regular User', 'user@sportsline.com', '$2b$10$FA7myPlasCV1jqiXB7Ct/OKvnkeK71XqpVhki0LGyAguf2sYqjkte', 'user'),
    ('Coach Juan', 'coach@sportsline.com', '$2b$10$FA7myPlasCV1jqiXB7Ct/OKvnkeK71XqpVhki0LGyAguf2sYqjkte', 'user'),
    ('Seller Maria', 'seller@sportsline.com', '$2b$10$FA7myPlasCV1jqiXB7Ct/OKvnkeK71XqpVhki0LGyAguf2sYqjkte', 'user'),
    ('Tester Carlos', 'tester@sportsline.com', '$2b$10$FA7myPlasCV1jqiXB7Ct/OKvnkeK71XqpVhki0LGyAguf2sYqjkte', 'user')
ON CONFLICT (email) DO NOTHING;

-- ==================== PRODUCTOS (5 ejemplos) ====================
INSERT INTO products (title, description, stock, value, "categoryId") 
SELECT 
    'Balón de fútbol profesional', 
    'Balón profesional FIFA para partidos oficiales. Peso 410-450g, circunferencia 68-70cm. Material sintético de alta durabilidad.', 
    50, 
    49.99, 
    (SELECT id FROM categories WHERE name = 'Deportes' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = 'Balón de fútbol profesional');

INSERT INTO products (title, description, stock, value, "categoryId") 
SELECT 
    'Raqueta de tenis Wilson Pro', 
    'Raqueta profesional de fibra de carbono con grip ergonómico. Peso 300g, tamaño de cabeza 100 sq in. Ideal para jugadores avanzados.', 
    30, 
    129.99, 
    (SELECT id FROM categories WHERE name = 'Deportes' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = 'Raqueta de tenis Wilson Pro');

INSERT INTO products (title, description, stock, value, "categoryId") 
SELECT 
    'Bicicleta de montaña Trek Marlin', 
    'Bicicleta 21 velocidades con suspensión frontal. Ruedas de 27.5 pulgadas. Marco de aluminio resistente para terrenos accidentados.', 
    15, 
    899.99, 
    (SELECT id FROM categories WHERE name = 'Deportes' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = 'Bicicleta de montaña Trek Marlin');

INSERT INTO products (title, description, stock, value, "categoryId") 
SELECT 
    'Camiseta deportiva transpirable', 
    'Camiseta 100% poliéster transpirable con tecnología secado rápido. Disponible en varios colores. Protección UV.', 
    100, 
    39.99, 
    (SELECT id FROM categories WHERE name = 'Ropa Deportiva' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = 'Camiseta deportiva transpirable');

INSERT INTO products (title, description, stock, value, "categoryId") 
SELECT 
    'Zapatillas running Nike Air', 
    'Zapatillas con amortiguación Air Max para correr distancias largas. Peso ligero 230g. Suela de goma resistente.', 
    80, 
    129.99, 
    (SELECT id FROM categories WHERE name = 'Calzado' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = 'Zapatillas running Nike Air');

-- ==================== ÓRDENES (5 ejemplos) ====================
INSERT INTO orders (status, total, "userId") 
SELECT 
    'pending',
    99.98,
    (SELECT id FROM users WHERE email = 'user@sportsline.com' LIMIT 1)
WHERE EXISTS (SELECT 1 FROM users WHERE email = 'user@sportsline.com')
AND NOT EXISTS (SELECT 1 FROM orders WHERE status = 'pending' AND total = 99.98);

INSERT INTO orders (status, total, "userId") 
SELECT 
    'confirmed',
    259.97,
    (SELECT id FROM users WHERE email = 'coach@sportsline.com' LIMIT 1)
WHERE EXISTS (SELECT 1 FROM users WHERE email = 'coach@sportsline.com')
AND NOT EXISTS (SELECT 1 FROM orders WHERE status = 'confirmed' AND total = 259.97);

INSERT INTO orders (status, total, "userId") 
SELECT 
    'shipped',
    189.98,
    (SELECT id FROM users WHERE email = 'seller@sportsline.com' LIMIT 1)
WHERE EXISTS (SELECT 1 FROM users WHERE email = 'seller@sportsline.com')
AND NOT EXISTS (SELECT 1 FROM orders WHERE status = 'shipped' AND total = 189.98);

INSERT INTO orders (status, total, "userId") 
SELECT 
    'delivered',
    49.99,
    (SELECT id FROM users WHERE email = 'tester@sportsline.com' LIMIT 1)
WHERE EXISTS (SELECT 1 FROM users WHERE email = 'tester@sportsline.com')
AND NOT EXISTS (SELECT 1 FROM orders WHERE status = 'delivered' AND total = 49.99);

INSERT INTO orders (status, total, "userId") 
SELECT 
    'pending',
    379.97,
    (SELECT id FROM users WHERE email = 'admin@sportsline.com' LIMIT 1)
WHERE EXISTS (SELECT 1 FROM users WHERE email = 'admin@sportsline.com')
AND NOT EXISTS (SELECT 1 FROM orders WHERE status = 'pending' AND total = 379.97);

-- ==================== ITEMS DE ORDEN (5 ejemplos) ====================
INSERT INTO order_items (quantity, price, "orderId", "productId") 
SELECT 
    2,
    49.99,
    (SELECT id FROM orders WHERE status = 'pending' AND total = 99.98 LIMIT 1),
    (SELECT id FROM products WHERE title = 'Balón de fútbol profesional' LIMIT 1)
WHERE EXISTS (SELECT 1 FROM orders WHERE status = 'pending' AND total = 99.98)
AND EXISTS (SELECT 1 FROM products WHERE title = 'Balón de fútbol profesional')
AND NOT EXISTS (SELECT 1 FROM order_items WHERE quantity = 2 AND price = 49.99);

INSERT INTO order_items (quantity, price, "orderId", "productId") 
SELECT 
    2,
    129.99,
    (SELECT id FROM orders WHERE status = 'confirmed' AND total = 259.97 LIMIT 1),
    (SELECT id FROM products WHERE title = 'Raqueta de tenis Wilson Pro' LIMIT 1)
WHERE EXISTS (SELECT 1 FROM orders WHERE status = 'confirmed' AND total = 259.97)
AND EXISTS (SELECT 1 FROM products WHERE title = 'Raqueta de tenis Wilson Pro')
AND NOT EXISTS (SELECT 1 FROM order_items WHERE quantity = 2 AND price = 129.99);

INSERT INTO order_items (quantity, price, "orderId", "productId") 
SELECT 
    3,
    39.99,
    (SELECT id FROM orders WHERE status = 'shipped' AND total = 189.98 LIMIT 1),
    (SELECT id FROM products WHERE title = 'Camiseta deportiva transpirable' LIMIT 1)
WHERE EXISTS (SELECT 1 FROM orders WHERE status = 'shipped' AND total = 189.98)
AND EXISTS (SELECT 1 FROM products WHERE title = 'Camiseta deportiva transpirable')
AND NOT EXISTS (SELECT 1 FROM order_items WHERE quantity = 3 AND price = 39.99);

INSERT INTO order_items (quantity, price, "orderId", "productId") 
SELECT 
    1,
    49.99,
    (SELECT id FROM orders WHERE status = 'delivered' AND total = 49.99 LIMIT 1),
    (SELECT id FROM products WHERE title = 'Balón de fútbol profesional' LIMIT 1)
WHERE EXISTS (SELECT 1 FROM orders WHERE status = 'delivered' AND total = 49.99)
AND EXISTS (SELECT 1 FROM products WHERE title = 'Balón de fútbol profesional')
AND NOT EXISTS (SELECT 1 FROM order_items WHERE quantity = 1 AND price = 49.99 AND "orderId" IN (SELECT id FROM orders WHERE status = 'delivered'));

INSERT INTO order_items (quantity, price, "orderId", "productId") 
SELECT 
    3,
    129.99,
    (SELECT id FROM orders WHERE status = 'pending' AND total = 379.97 LIMIT 1),
    (SELECT id FROM products WHERE title = 'Zapatillas running Nike Air' LIMIT 1)
WHERE EXISTS (SELECT 1 FROM orders WHERE status = 'pending' AND total = 379.97)
AND EXISTS (SELECT 1 FROM products WHERE title = 'Zapatillas running Nike Air')
AND NOT EXISTS (SELECT 1 FROM order_items WHERE quantity = 3 AND price = 129.99);

SELECT 'Seed completed successfully!' AS status;
SELECT '====== DATOS SEMBRADOS ======' AS resultado;
SELECT count(*) as "Categorías" FROM categories;
SELECT count(*) as "Usuarios" FROM users;
SELECT count(*) as "Productos" FROM products;
SELECT count(*) as "Órdenes" FROM orders;
SELECT count(*) as "Items de Orden" FROM order_items;
SELECT count(*) as "API Keys" FROM api_keys;
