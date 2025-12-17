import { CONFIG } from './config.js';

console.log('🔧 Conectando a Supabase...');

export const supabaseService = {
  
  async getVehiculos() {
    console.log('🚗 Solicitando vehículos...');
    
    try {
      const url = `${CONFIG.supabase.url}/rest/v1/vehiculos?select=*&order=orden.asc`;
      
      console.log('📡 Llamando a:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': CONFIG.supabase.anonKey,
          'Authorization': `Bearer ${CONFIG.supabase.anonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📊 Respuesta:', response.status);
      
      if (!response.ok) {
        console.error('❌ Error HTTP:', response.status);
        return [];
      }
      
      const vehiculos = await response.json();
      console.log(`✅ ${vehiculos.length} vehículos recibidos`);
      
      return vehiculos.map(v => ({
        ...v,
        imagenes: Array.isArray(v.imagenes) ? v.imagenes : [],
        imagen_principal_card: v.imagen_principal || 
                              (Array.isArray(v.imagenes) && v.imagenes.length > 0 ? v.imagenes[0] : CONFIG.app.defaultImage)
      }));
      
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      return [];
    }
  },
  
  async getVehiculoById(id) {
    try {
      const url = `${CONFIG.supabase.url}/rest/v1/vehiculos?id=eq.${id}&select=*`;
      
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
      const vehiculo = data[0];
      
      if (vehiculo) {
        return {
          ...vehiculo,
          imagenes: Array.isArray(vehiculo.imagenes) ? vehiculo.imagenes : [],
          imagen_principal_card: vehiculo.imagen_principal || vehiculo.imagenes?.[0] || CONFIG.app.defaultImage
        };
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ Error:', error);
      return null;
    }
  }
};

// Probar conexión
supabaseService.getVehiculos()
  .then(data => {
    if (data.length > 0) {
      console.log('🎉 ¡CONEXIÓN EXITOSA!');
    } else {
      console.log('⚠️ Conexión OK, pero tabla vacía');
    }
  })
  .catch(error => {
    console.error('❌ FALLO LA CONEXIÓN:', error);
  });
