[file name]: supabase.js
[file content begin]
import { CONFIG } from './config.js';

export const supabaseService = {
  
  // Obtener todos los vehículos activos
  async getVehiculos() {
    console.log('🚗 Cargando vehículos desde Supabase...');
    
    try {
      const url = `${CONFIG.supabase.url}/rest/v1/vehiculos?select=*&order=orden.asc`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': CONFIG.supabase.anonKey,
          'Authorization': `Bearer ${CONFIG.supabase.anonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error('❌ Error cargando vehículos:', response.status);
        return [];
      }
      
      const vehiculos = await response.json();
      console.log(`✅ ${vehiculos.length} vehículos obtenidos`);
      
      // Procesar imágenes (convertir array a lista si es necesario)
      return vehiculos.map(vehiculo => {
        return {
          ...vehiculo,
          // Asegurar que imagenes sea un array
          imagenes: Array.isArray(vehiculo.imagenes) ? vehiculo.imagenes : [],
          imagen_principal_card: vehiculo.imagen_principal || 
                               (Array.isArray(vehiculo.imagenes) && vehiculo.imagenes.length > 0 ? vehiculo.imagenes[0] : CONFIG.app.defaultImage)
        };
      });
      
    } catch (error) {
      console.error('❌ Error en getVehiculos:', error);
      return [];
    }
  },
  
  // Obtener vehículo por ID
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
        // Procesar datos
        return {
          ...vehiculo,
          imagenes: Array.isArray(vehiculo.imagenes) ? vehiculo.imagenes : [],
          imagen_principal_card: vehiculo.imagen_principal || 
                               (Array.isArray(vehiculo.imagenes) && vehiculo.imagenes.length > 0 ? vehiculo.imagenes[0] : CONFIG.app.defaultImage)
        };
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ Error en getVehiculoById:', error);
      return null;
    }
  },
  
  // Función helper para obtener el precio del vehículo
  findVehiclePrice(vehiculo) {
    return vehiculo.precio || 0;
  },
  
  // Obtener kits (ahora están en la misma tabla)
  getKitsForVehicle(vehiculo) {
    return [
      {
        id: "standar",
        nombre: "Standard",
        precio: vehiculo.kit_standar_precio || 0,
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
        precio: vehiculo.kit_medium_precio || 1200000,
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
        precio: vehiculo.kit_full_precio || 2500000,
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
  
  // Obtener imagen del kit (opcional)
  async getKitImageForVehicle(vehiculoId, kitId) {
    // Opcional: si tienes imágenes específicas de kits
    // Por ahora usar la imagen principal del vehículo
    const vehiculo = await this.getVehiculoById(vehiculoId);
    return vehiculo?.imagen_principal || null;
  }
};
[file content end]
