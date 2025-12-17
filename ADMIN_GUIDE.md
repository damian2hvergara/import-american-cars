[file name]: ADMIN_GUIDE.md
[file content begin]
# GUÍA DE ADMINISTRACIÓN - IMPORT AMERICAN CARS

## 📋 VISIÓN GENERAL
Este documento explica cómo administrar el inventario de vehículos en Supabase.

## 🔐 ACCESO A SUPABASE

1. **URL del Panel**: https://app.supabase.com/project/cflpmluvhfldewiitymh
2. **Credenciales**:
   - Email: [TU EMAIL]
   - Contraseña: [TU CONTRASEÑA]

## 📊 ESTRUCTURA DE BASE DE DATOS

### Tablas Principales:

1. **vehiculos** - Catálogo principal
   - `nombre`: Nombre del vehículo (ej: "Ford F-150 Raptor 2023")
   - `precio`: Precio base en CLP
   - `estado`: "stock", "transit" o "reserve"
   - Especificaciones: año, color, motor, kilometraje, etc.

2. **vehiculo_imagenes** - Imágenes (6-8 por vehículo)
   - `vehiculo_id`: ID del vehículo
   - `url`: URL de la imagen (Cloudinary o hosting externo)
   - `orden`: Orden de visualización (1-8)

3. **kits_upgrade** - Kits disponibles
   - Pre-configurados: Standard, Medium, Full
   - No modificar a menos que sea necesario

4. **vehiculo_kits** - Precios específicos por vehículo
   - Relaciona vehículos con kits
   - Define precio específico por vehículo
   - Imagen específica del kit aplicado

## 🚀 PRIMEROS PASOS

### 1. Crear las tablas
1. Ir a **SQL Editor** en Supabase
2. Pegar y ejecutar el contenido de `SQL_SCHEMA.sql`
3. Verificar que se crearon 4 tablas

### 2. Insertar vehículos
1. Ir a **Table Editor** → **vehiculos**
2. Click en **Insert row**
3. Completar datos:
   ```json
   {
     "nombre": "Ford F-150 Raptor 2023",
     "descripcion": "Pickup americana full equipo, 4x4, motor V6 EcoBoost",
     "precio": 45000000,
     "estado": "stock",
     "ano": 2023,
     "color": "Negro",
     "motor": "3.5L V6 EcoBoost",
     "kilometraje": 15000,
     "transmision": "Automática 10 velocidades",
     "combustible": "Gasolina",
     "marca": "Ford",
     "modelo": "F-150 Raptor",
     "orden": 1,
     "destacado": true
   }
