import { CONFIG } from './config.js';

console.log('🔧 Iniciando conexión a Supabase...');

// SERVICIO PARA CONECTAR CON SUPABASE
export const supabaseService = {
  
  // OBTENER TODOS LOS VEHÍCULOS CON SUS IMÁGENES
  async getVehiculos() {
    console.log('🚗 Solicitando vehículos desde Supabase...');
    
    try {
      // Verificar configuración
      if (!CONFIG.supabase.url || CONFIG.supabase.url.includes("TU_PROYECTO")) {
        console.error('❌ URL de Supabase no configurada');
        return [];
      }
      
      // Construir URL para obtener vehículos con imágenes
      // IMPORTANTE: Esto asume que tienes una vista o función que une las tablas
      const url = `${CONFIG.supabase.url}/rest/v1/vehiculos?select=*&order=orden.asc,created_at.desc`;
      console.log('📡 URL:', url);
      
      // Hacer la petición a Supabase
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': CONFIG.supabase.anonKey,
          'Authorization': `Bearer ${CONFIG.supabase.anonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      });
      
      console.log('📊 Estado respuesta:', response.status, response.statusText);
      
      // Verificar si hubo error
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error en la respuesta:', errorText);
        
        if (response.status === 401) {
          console.error('⚠️ ERROR 401: API Key incorrecta o expirada');
          console.error('   Verifica la API Key en config.js');
        } else if (response.status === 404) {
          console.error('⚠️ ERROR 404: Tabla "vehiculos" no encontrada');
          console.error('   Ejecuta el SQL para crear la tabla en Supabase');
        }
        
        return [];
      }
      
      // Convertir respuesta a JSON
      const vehiculos = await response.json();
      console.log(`✅ ${vehiculos.length} vehículos obtenidos`);
      
      // Procesar datos para asegurar formato correcto
      const vehiculosProcesados = await Promise.all(
        vehiculos.map(async vehiculo => {
          // Obtener imágenes para este vehículo
          const imagenes = await this.getImagenesVehiculo(vehiculo.id);
          
          return {
            ...vehiculo,
            imagenes: imagenes,
            imagen_principal: imagenes.length > 0 ? imagenes[0] : CONFIG.app.defaultImage
          };
        })
      );
      
      return vehiculosProcesados;
      
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      return [];
    }
  },
  
  // OBTENER IMÁGENES DE UN VEHÍCULO
  async getImagenesVehiculo(vehiculoId) {
    try {
      const url = `${CONFIG.supabase.url}/rest/v1/vehiculo_imagenes?vehiculo_id=eq.${vehiculoId}&select=url,orden&order=orden.asc`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': CONFIG.supabase.anonKey,
          'Authorization': `Bearer ${CONFIG.supabase.anonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error(`❌ Error obteniendo imágenes para vehículo ${vehiculoId}`);
        return [];
      }
      
      const data = await response.json();
      return data.map(img => img.url);
      
    } catch (error) {
      console.error(`❌ Error en getImagenesVehiculo:`, error);
      return [];
    }
  },
  
  // OBTENER UN VEHÍCULO POR SU ID
  async getVehiculoById(id) {
    try {
      console.log(`🔍 Buscando vehículo ID: ${id}`);
      
      const url = `${CONFIG.supabase.url}/rest/v1/vehiculos?id=eq.${id}&select=*`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': CONFIG.supabase.anonKey,
          'Authorization': `Bearer ${CONFIG.supabase.anonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error(`❌ Error obteniendo vehículo ${id}:`, response.status);
        return null;
      }
      
      const data = await response.json();
      const vehiculo = data[0];
      
      if (!vehiculo) {
        return null;
      }
      
      // Obtener imágenes del vehículo
      const imagenes = await this.getImagenesVehiculo(id);
      
      // Procesar datos del vehículo
      return {
        ...vehiculo,
        imagenes: imagenes,
        imagen_principal: imagenes.length > 0 ? imagenes[0] : CONFIG.app.defaultImage
      };
      
    } catch (error) {
      console.error(`❌ Error en getVehiculoById:`, error);
      return null;
    }
  },
  
  // OBTENER KITS PARA UN VEHÍCULO
  async getKitsVehiculo(vehiculoId) {
    try {
      const url = `${CONFIG.supabase.url}/rest/v1/vehiculo_kits?vehiculo_id=eq.${vehiculoId}&select=*,kits_upgrade(*)`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': CONFIG.supabase.anonKey,
          'Authorization': `Bearer ${CONFIG.supabase.anonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error(`❌ Error obteniendo kits para vehículo ${vehiculoId}`);
        return [];
      }
      
      return await response.json();
      
    } catch (error) {
      console.error(`❌ Error en getKitsVehiculo:`, error);
      return [];
    }
  },
  
  // FUNCIÓN AUXILIAR PARA OBTENER PRECIO
  findVehiclePrice(vehiculo) {
    return vehiculo.precio || 0;
  }
};

// PRUEBA AUTOMÁTICA DE CONEXIÓN AL CARGAR
console.log('🔄 Probando conexión con Supabase...');

// Solo probar si la URL está configurada
if (CONFIG.supabase.url && !CONFIG.supabase.url.includes("TU_PROYECTO")) {
  supabaseService.getVehiculos()
    .then(data => {
      if (data.length > 0) {
        console.log('🎉 ¡CONEXIÓN EXITOSA!');
        console.log(`📊 ${data.length} vehículos cargados`);
      } else {
        console.log('ℹ️ Conexión exitosa, pero no hay vehículos en la tabla');
        console.log('   Verifica que hayas insertado datos en Supabase');
      }
    })
    .catch(error => {
      console.error('❌ FALLO LA CONEXIÓN:', error);
    });
} else {
  console.log('⚠️  URL de Supabase no configurada. Ve a config.js para corregir.');
}
