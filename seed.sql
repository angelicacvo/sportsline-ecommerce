-- Script de seed para ejecutar DESPUÉS de que TypeORM cree las tablas
-- Ejecutar con: docker compose exec postgres psql -U jeferson -d sportsline -f /seed.sql

-- Insertar categorías
INSERT INTO categories (name, description) 
VALUES 
    ('Deportes', 'Artículos y equipos deportivos'),
    ('Ropa Deportiva', 'Vestimenta para deportes'),
    ('Calzado', 'Zapatos deportivos')
ON CONFLICT (name) DO NOTHING;

-- Insertar usuarios con contraseñas hasheadas
-- admin@sportsline.com / admin123
-- user@sportsline.com / user123
INSERT INTO users (name, email, password, role) 
VALUES 
    ('Admin User', 'admin@sportsline.com', '$2b$10$1Az1DoNa4YvUjzCtio7ltOaBa.zuuRslcMtGE0hy99VJtYLMD6Aua', 'admin'),
    ('Regular User', 'user@sportsline.com', '$2b$10$FA7myPlasCV1jqiXB7Ct/OKvnkeK71XqpVhki0LGyAguf2sYqjkte', 'user')
ON CONFLICT (email) DO NOTHING;

-- Insertar productos
INSERT INTO products (title, description, stock, value, "categoryId") 
SELECT 
    'Balón de fútbol', 
    'Balón profesional para partidos oficiales', 
    50, 
    49900.00, 
    (SELECT id FROM categories WHERE name = 'Deportes' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = 'Balón de fútbol');

INSERT INTO products (title, description, stock, value, "categoryId") 
SELECT 
    'Raqueta de tenis', 
    'Raqueta profesional de fibra de carbono', 
    30, 
    129900.00, 
    (SELECT id FROM categories WHERE name = 'Deportes' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = 'Raqueta de tenis');

INSERT INTO products (title, description, stock, value, "categoryId") 
SELECT 
    'Bicicleta de montaña', 
    'Bicicleta 21 velocidades', 
    15, 
    899900.00, 
    (SELECT id FROM categories WHERE name = 'Deportes' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = 'Bicicleta de montaña');

SELECT 'Seed completed successfully!' AS status;
