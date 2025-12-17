[file name]: SQL_SCHEMA.sql
[file content begin]
-- ============================================
-- ESQUEMA COMPLETO PARA IMPORT AMERICAN CARS
-- Ejecutar en el Editor SQL de Supabase
-- ============================================

-- Tabla principal de vehículos
CREATE TABLE IF NOT EXISTS vehiculos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio INTEGER DEFAULT 0,
  estado VARCHAR(50) DEFAULT 'reserve' CHECK (estado IN ('stock', 'transit', 'reserve')),
  
  -- Especificaciones técnicas
  ano INTEGER,
  color VARCHAR(100),
  motor VARCHAR(100),
  transmision VARCHAR(50),
  combustible VARCHAR(50),
  kilometraje INTEGER,
  marca VARCHAR(100),
  modelo VARCHAR(100),
  
  -- Fechas
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadatos
  destacado BOOLEAN DEFAULT FALSE,
  orden INTEGER DEFAULT 0
);

-- Tabla de imágenes por vehículo (6-8 imágenes por vehículo)
CREATE TABLE IF NOT EXISTS vehiculo_imagenes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehiculo_id UUID REFERENCES vehiculos(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  orden INTEGER DEFAULT 0,
  tipo VARCHAR(50) DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de kits de mejora (precios base por nivel)
CREATE TABLE IF NOT EXISTS kits_upgrade (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  precio_base INTEGER DEFAULT 0,
  nivel VARCHAR(50) NOT NULL CHECK (nivel IN ('standar', 'medium', 'full')),
  icono VARCHAR(100),
  color VARCHAR(50),
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de relación vehículo-kit (precios específicos por vehículo)
CREATE TABLE IF NOT EXISTS vehiculo_kits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehiculo_id UUID REFERENCES vehiculos(id) ON DELETE CASCADE,
  kit_id UUID REFERENCES kits_upgrade(id) ON DELETE CASCADE,
  precio_vehiculo INTEGER NOT NULL,
  imagen_kit_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(vehiculo_id, kit_id)
);

-- ============================================
-- INSERTAR DATOS INICIALES DE KITS
-- ============================================

-- Insertar kits base
INSERT INTO kits_upgrade (nombre, descripcion, precio_base, nivel, icono, color, orden) VALUES
  ('Standard', 'Preparación básica incluida con cada vehículo', 0, 'standar', 'fa-star', '#CD7F32', 1),
  ('Medium', 'Mejoras estéticas y funcionales avanzadas', 1200000, 'medium', 'fa-medal', '#C0C0C0', 2),
  ('Full', 'Transformación premium completa', 2500000, 'full', 'fa-crown', '#FFD700', 3)
ON CONFLICT DO NOTHING;

-- ============================================
-- CREAR ÍNDICES PARA MEJOR RENDIMIENTO
-- ============================================

CREATE INDEX IF NOT EXISTS idx_vehiculos_estado ON vehiculos(estado);
CREATE INDEX IF NOT EXISTS idx_vehiculos_orden ON vehiculos(orden);
CREATE INDEX IF NOT EXISTS idx_vehiculos_destacado ON vehiculos(destacado);

CREATE INDEX IF NOT EXISTS idx_vehiculo_imagenes_vehiculo ON vehiculo_imagenes(vehiculo_id);
CREATE INDEX IF NOT EXISTS idx_vehiculo_imagenes_orden ON vehiculo_imagenes(orden);

CREATE INDEX IF NOT EXISTS idx_kits_upgrade_nivel ON kits_upgrade(nivel);
CREATE INDEX IF NOT EXISTS idx_kits_upgrade_activo ON kits_upgrade(activo);

CREATE INDEX IF NOT EXISTS idx_vehiculo_kits_vehiculo ON vehiculo_kits(vehiculo_id);
CREATE INDEX IF NOT EXISTS idx_vehiculo_kits_kit ON vehiculo_kits(kit_id);

-- ============================================
-- POLÍTICAS DE SEGURIDAD (RLS - Row Level Security)
-- ============================================

-- Activar RLS en todas las tablas
ALTER TABLE vehiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehiculo_imagenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE kits_upgrade ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehiculo_kits ENABLE ROW LEVEL SECURITY;

-- Políticas para lectura pública (usuarios solo ven)
CREATE POLICY "Permitir lectura pública de vehículos" 
ON vehiculos FOR SELECT USING (true);

CREATE POLICY "Permitir lectura pública de imágenes" 
ON vehiculo_imagenes FOR SELECT USING (true);

CREATE POLICY "Permitir lectura pública de kits" 
ON kits_upgrade FOR SELECT USING (true);

CREATE POLICY "Permitir lectura pública de precios específicos" 
ON vehiculo_kits FOR SELECT USING (true);

-- Políticas para escritura (solo administradores desde el panel de Supabase)
CREATE POLICY "Permitir escritura solo desde panel admin" 
ON vehiculos FOR ALL USING (false);

CREATE POLICY "Permitir escritura solo desde panel admin" 
ON vehiculo_imagenes FOR ALL USING (false);

CREATE POLICY "Permitir escritura solo desde panel admin" 
ON kits_upgrade FOR ALL USING (false);

CREATE POLICY "Permitir escritura solo desde panel admin" 
ON vehiculo_kits FOR ALL USING (false);

-- ============================================
-- FUNCIONES ÚTILES
-- ============================================

-- Función para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_vehiculos_updated_at 
    BEFORE UPDATE ON vehiculos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CONFIGURACIÓN DE API
-- ============================================

-- Comentarios para documentación
COMMENT ON TABLE vehiculos IS 'Catálogo principal de vehículos importados';
COMMENT ON TABLE vehiculo_imagenes IS 'Imágenes asociadas a cada vehículo (6-8 imágenes máximo)';
COMMENT ON TABLE kits_upgrade IS 'Kits de mejora disponibles (Standard, Medium, Full)';
COMMENT ON TABLE vehiculo_kits IS 'Precios específicos de kits para cada vehículo';

-- ============================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- ============================================

/*
-- Ejemplo de inserción de un vehículo
INSERT INTO vehiculos (nombre, descripcion, precio, estado, ano, color, motor, kilometraje) VALUES
  ('Ford F-150 Raptor 2023', 'Pickup americana full equipo, 4x4, motor V6 EcoBoost', 45000000, 'stock', 2023, 'Negro', '3.5L V6 EcoBoost', 15000);

-- Obtener ID del vehículo insertado
SELECT id FROM vehiculos WHERE nombre = 'Ford F-150 Raptor 2023';

-- Insertar imágenes para el vehículo (reemplazar [VEHICULO_ID] con el ID real)
INSERT INTO vehiculo_imagenes (vehiculo_id, url, orden) VALUES
  ('[VEHICULO_ID]', 'https://ejemplo.com/ford1.jpg', 1),
  ('[VEHICULO_ID]', 'https://ejemplo.com/ford2.jpg', 2),
  ('[VEHICULO_ID]', 'https://ejemplo.com/ford3.jpg', 3),
  ('[VEHICULO_ID]', 'https://ejemplo.com/ford4.jpg', 4),
  ('[VEHICULO_ID]', 'https://ejemplo.com/ford5.jpg', 5),
  ('[VEHICULO_ID]', 'https://ejemplo.com/ford6.jpg', 6);

-- Asignar precios específicos de kits para este vehículo
INSERT INTO vehiculo_kits (vehiculo_id, kit_id, precio_vehiculo, imagen_kit_url) VALUES
  ('[VEHICULO_ID]', (SELECT id FROM kits_upgrade WHERE nivel = 'standar'), 0, 'https://ejemplo.com/ford_standar.jpg'),
  ('[VEHICULO_ID]', (SELECT id FROM kits_upgrade WHERE nivel = 'medium'), 1500000, 'https://ejemplo.com/ford_medium.jpg'),
  ('[VEHICULO_ID]', (SELECT id FROM kits_upgrade WHERE nivel = 'full'), 3000000, 'https://ejemplo.com/ford_full.jpg');
*/

-- ============================================
-- CONSULTAS ÚTILES PARA EL PANEL ADMIN
-- ============================================

/*
-- Ver todos los vehículos con sus imágenes
SELECT v.*, 
       array_agg(vi.url ORDER BY vi.orden) as imagenes,
       COUNT(vi.id) as total_imagenes
FROM vehiculos v
LEFT JOIN vehiculo_imagenes vi ON v.id = vi.vehiculo_id
GROUP BY v.id
ORDER BY v.orden, v.created_at DESC;

-- Ver vehículos con sus kits y precios
SELECT v.nombre, v.estado, v.precio as precio_base,
       k.nombre as kit, vk.precio_vehiculo as precio_kit,
       (v.precio + vk.precio_vehiculo) as precio_total
FROM vehiculos v
JOIN vehiculo_kits vk ON v.id = vk.vehiculo_id
JOIN kits_upgrade k ON vk.kit_id = k.id
ORDER BY v.nombre, k.orden;
*/
[file content end]
