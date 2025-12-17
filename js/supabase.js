import { CONFIG } from './config.js';

console.log('🔧 Iniciando conexión a Supabase...');

// SERVICIO PARA CONECTAR CON SUPABASE
export const supabaseService = {
  
  // OBTENER TODOS LOS VEHÍCULOS
  async getVehiculos() {
    console.log('🚗 Solicitando vehículos desde Supabase...');
    
    try {
      // Construir URL de la API
      const url = `${CONFIG.supabase.url}/rest/v1/vehiculos?select=*&order=orden.asc`;
      console.log('📡 URL:', url);
      
      // Hacer la petición a Supabase
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': CONFIG.supabase.anonKey,
          'Authorization': `Bearer ${CONFIG.supabase.anonKey}`,
          'Content-Type': 'application/json'
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
      const vehiculosProcesados = vehiculos.map(vehiculo => {
        return {
          ...vehiculo,
          // Asegurar que imagenes sea un array
          imagenes: Array.isArray(vehiculo.imagenes) ? vehiculo.imagenes : [],
          // Definir imagen principal para mostrar en cards
          imagen_principal_card: vehiculo.imagen_principal || 
            (Array.isArray(vehiculo.imagenes) && vehiculo.imagenes.length > 0 ? vehiculo.imagenes[0] : CONFIG.app.defaultImage)
        };
      });
      
      return vehiculosProcesados;
      
    } catch (error) {
      console.error('❌ Error de conexión:', error);
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
      
      // Procesar datos del vehículo
      return {
        ...vehiculo,
        imagenes: Array.isArray(vehiculo.imagenes) ? vehiculo.imagenes : [],
        imagen_principal_card: vehiculo.imagen_principal || 
          (Array.isArray(vehiculo.imagenes) && vehiculo.imagenes.length > 0 ? vehiculo.imagenes[0] : CONFIG.app.defaultImage)
      };
      
    } catch (error) {
      console.error(`❌ Error en getVehiculoById:`, error);
      return null;
    }
  },
  
  // FUNCIÓN AUXILIAR PARA OBTENER PRECIO
  findVehiclePrice(vehiculo) {
    return vehiculo.precio || 0;
  }
};

// PRUEBA AUTOMÁTICA DE CONEXIÓN AL CARGAR
console.log('🔄 Probando conexión con Supabase...');
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
