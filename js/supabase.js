[file name]: supabase.js
[file content begin]
import { CONFIG } from './config.js';

console.log('🔧 Inicializando conexión a Supabase...');
console.log('URL:', CONFIG.supabase.url);
console.log('API Key presente:', CONFIG.supabase.anonKey ? '✅' : '❌');

// Servicio de datos usando fetch directo
export const supabaseService = {
  
  // ============================================
  // VEHÍCULOS - FUNCIONES PRINCIPALES
  // ============================================
  
  // Obtener todos los vehículos activos con sus imágenes
  async getVehiculos() {
    console.log('🚗 Iniciando carga de vehículos desde Supabase...');
    
    try {
      const url = `${CONFIG.supabase.url}/rest/v1/vehiculos?select=*&order=orden.asc`;
      console.log('📡 URL de consulta:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': CONFIG.supabase.anonKey,
          'Authorization': `Bearer ${CONFIG.supabase.anonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📊 Respuesta HTTP:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error HTTP:', errorText);
        
        // Verificar si la tabla existe
        if (response.status === 404 || errorText.includes('Could not find the table')) {
          console.error('⚠️ La tabla "vehiculos" no existe en Supabase');
          console.error('💡 Ejecuta este SQL en el editor de Supabase:');
          console.error(`
            CREATE TABLE vehiculos (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              nombre VARCHAR(255) NOT NULL,
              descripcion TEXT,
              precio INTEGER DEFAULT 0,
              estado VARCHAR(50) DEFAULT 'reserve',
              ano INTEGER,
              color VARCHAR(100),
              motor VARCHAR(100),
              transmision VARCHAR(50),
              combustible VARCHAR(50),
              kilometraje INTEGER,
              marca VARCHAR(100),
              modelo VARCHAR(100),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              destacado BOOLEAN DEFAULT FALSE,
              orden INTEGER DEFAULT 0
            );
          `);
        }
        
        return [];
      }
      
      const vehiculos = await response.json();
      console.log(`✅ ${vehiculos?.length || 0} vehículos obtenidos`);
      
      // Para cada vehículo, obtener sus imágenes
      const vehiculosCompletos = await Promise.all(
        vehiculos.map(async (vehiculo) => {
          const imagenes = await this.getImagenesVehiculo(vehiculo.id);
          const kits = await this.getKitsVehiculo(vehiculo.id);
          
          return {
            ...vehiculo,
            imagenes: imagenes.map(img => img.url),
            kits: kits
          };
        })
      );
      
      // Log del primer vehículo para debug
      if (vehiculosCompletos.length > 0) {
        const primerVehiculo = vehiculosCompletos[0];
        console.log('📄 Primer vehículo completo:');
        console.log('ID:', primerVehiculo.id);
        console.log('Nombre:', primerVehiculo.nombre);
        console.log('Precio:', primerVehiculo.precio);
        console.log('Imágenes:', primerVehiculo.imagenes?.length || 0);
        console.log('Kits:', primerVehiculo.kits?.length || 0);
      }
      
      return vehiculosCompletos;
      
    } catch (error) {
      console.error('❌ Error general en getVehiculos:', error);
      return [];
    }
  },
  
  // Obtener imágenes específicas de un vehículo
  async getImagenesVehiculo(vehiculoId) {
    try {
      const url = `${CONFIG.supabase.url}/rest/v1/vehiculo_imagenes?vehiculo_id=eq.${vehiculoId}&select=*&order=orden.asc`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': CONFIG.supabase.anonKey,
          'Authorization': `Bearer ${CONFIG.supabase.anonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.warn(`⚠️ No se pudieron cargar imágenes para vehículo ${vehiculoId}`);
        return [];
      }
      
      const imagenes = await response.json();
      return imagenes;
      
    } catch (error) {
      console.error(`❌ Error obteniendo imágenes para ${vehiculoId}:`, error);
      return [];
    }
  },
  
  // Obtener vehículo por ID con imágenes y kits
  async getVehiculoById(id) {
    try {
      console.log(`🔍 Buscando vehículo completo ID: ${id}`);
      
      // Obtener vehículo
      const urlVehiculo = `${CONFIG.supabase.url}/rest/v1/vehiculos?id=eq.${id}&select=*`;
      const responseVehiculo = await fetch(urlVehiculo, {
        method: 'GET',
        headers: {
          'apikey': CONFIG.supabase.anonKey,
          'Authorization': `Bearer ${CONFIG.supabase.anonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!responseVehiculo.ok) {
        console.error(`❌ Error obteniendo vehículo ${id}:`, responseVehiculo.status);
        return null;
      }
      
      const vehiculoData = await responseVehiculo.json();
      const vehiculo = vehiculoData[0];
      
      if (!vehiculo) {
        return null;
      }
      
      // Obtener imágenes y kits
      const imagenes = await this.getImagenesVehiculo(id);
      const kits = await this.getKitsVehiculo(id);
      
      return {
        ...vehiculo,
        imagenes: imagenes.map(img => img.url),
        kits: kits
      };
      
    } catch (error) {
      console.error(`❌ Error en getVehiculoById ${id}:`, error);
      return null;
    }
  },
  
  // ============================================
  // KITS DE MEJORA - FUNCIONES
  // ============================================
  
  // Obtener kits específicos para un vehículo
  async getKitsVehiculo(vehiculoId) {
    try {
      // Primero obtener todos los kits base
      const urlKitsBase = `${CONFIG.supabase.url}/rest/v1/kits_upgrade?select=*&order=orden.asc&activo=eq.true`;
      const responseKitsBase = await fetch(urlKitsBase, {
        method: 'GET',
        headers: {
          'apikey': CONFIG.supabase.anonKey,
          'Authorization': `Bearer ${CONFIG.supabase.anonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!responseKitsBase.ok) {
        console.warn('⚠️ No se pudieron cargar kits base, usando por defecto');
        return this.getDefaultKits();
      }
      
      const kitsBase = await responseKitsBase.json();
      
      // Obtener precios específicos para este vehículo
      const urlPreciosEspecificos = `${CONFIG.supabase.url}/rest/v1/vehiculo_kits?vehiculo_id=eq.${vehiculoId}&select=*`;
      const responsePrecios = await fetch(urlPreciosEspecificos, {
        method: 'GET',
        headers: {
          'apikey': CONFIG.supabase.anonKey,
          'Authorization': `Bearer ${CONFIG.supabase.anonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      const preciosEspecificos = responsePrecios.ok ? await responsePrecios.json() : [];
      
      // Combinar kits base con precios específicos
      const kitsCompletos = kitsBase.map(kitBase => {
        // Buscar precio específico para este vehículo
        const precioEspecifico = preciosEspecificos.find(p => p.kit_id === kitBase.id);
        
        // Obtener imagen del kit para este vehículo
        const imagenKit = preciosEspecificos.find(p => p.kit_id === kitBase.id)?.imagen_kit_url;
        
        return {
          ...kitBase,
          precio: precioEspecifico?.precio_vehiculo || kitBase.precio_base,
          imagen_kit: imagenKit || null,
          includes: this.getDefaultIncludesForKit(kitBase.nivel)
        };
      });
      
      return kitsCompletos;
      
    } catch (error) {
      console.error(`❌ Error obteniendo kits para vehículo ${vehiculoId}:`, error);
      return this.getDefaultKits();
    }
  },
  
  // Obtener imagen específica de un kit para un vehículo
  async getKitImageForVehicle(vehiculoId, kitId) {
    try {
      const url = `${CONFIG.supabase.url}/rest/v1/vehiculo_kits?select=imagen_kit_url&vehiculo_id=eq.${vehiculoId}&kit_id=eq.${kitId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': CONFIG.supabase.anonKey,
          'Authorization': `Bearer ${CONFIG.supabase.anonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) return null;
      
      const data = await response.json();
      return data[0]?.imagen_kit_url || null;
      
    } catch (error) {
      console.warn('⚠️ Error al buscar imagen de kit:', error);
      return null;
    }
  },
  
  // ============================================
  // FUNCIONES HELPER
  // ============================================
  
  // Función helper para obtener el precio del vehículo
  findVehiclePrice(vehiculo) {
    return vehiculo.precio || 0;
  },
  
  // Kits por defecto (fallback)
  getDefaultKits() {
    console.log('📋 Usando kits por defecto');
    return [
      {
        id: "standar",
        nombre: "Standard",
        precio: 0,
        precio_base: 0,
        descripcion: "Preparación básica incluida con cada vehículo",
        nivel: "standar",
        includes: [
          "Limpieza completa exterior e interior",
          "Revisión mecánica general",
          "Documentación en regla Zona Franca",
          "Cambio de aceite y filtros básicos"
        ]
      },
      {
        id: "medium",
        nombre: "Medium",
        precio: 1200000,
        precio_base: 1200000,
        descripcion: "Mejoras estéticas y funcionales avanzadas",
        nivel: "medium",
        includes: [
          "Todo lo del Kit Standard",
          "Llantas deportivas 20\" nuevas",
          "Tinte de ventanas premium",
          "Step bar laterales cromados",
          "Protector de caja truck bed"
        ]
      },
      {
        id: "full",
        nombre: "Full",
        precio: 2500000,
        precio_base: 2500000,
        descripcion: "Transformación premium completa",
        nivel: "full",
        includes: [
          "Todo lo del Kit Medium",
          "Suspensión deportiva nivelada 2\"",
          "Rines Fuel Off-Road 22\"",
          "Neumáticos todo terreno 35\"",
          "Kit de carrocería completo",
          "Sistema de escape deportivo"
        ]
      }
    ];
  },
  
  // Obtener includes por defecto para cada kit
  getDefaultIncludesForKit(nivel) {
    const includesMap = {
      'standar': [
        "Limpieza completa exterior e interior",
        "Revisión mecánica general",
        "Documentación en regla Zona Franca",
        "Cambio de aceite y filtros básicos"
      ],
      'medium': [
        "Todo lo del Kit Standard",
        "Llantas deportivas 20\" nuevas",
        "Tinte de ventanas premium",
        "Step bar laterales cromados",
        "Protector de caja truck bed"
      ],
      'full': [
        "Todo lo del Kit Medium",
        "Suspensión deportiva nivelada 2\"",
        "Rines Fuel Off-Road 22\"",
        "Neumáticos todo terreno 35\"",
        "Kit de carrocería completo",
        "Sistema de escape deportivo"
      ]
    };
    
    return includesMap[nivel] || includesMap['standar'];
  }
};

// Probar conexión inmediatamente
console.log('🔄 Probando conexión con Supabase...');
supabaseService.getVehiculos()
  .then(data => {
    if (data.length > 0) {
      console.log('🎉 ¡CONEXIÓN EXITOSA!');
      console.log(`📊 ${data.length} vehículos cargados correctamente`);
      console.log('✅ Base de datos configurada correctamente');
    } else {
      console.log('⚠️ CONEXIÓN OK, pero no hay vehículos en la tabla.');
      console.log('ℹ️ Accede a Supabase y crea las tablas necesarias.');
    }
  })
  .catch(error => {
    console.error('❌ FALLO LA PRUEBA DE CONEXIÓN INICIAL:', error);
  });
[file content end]
