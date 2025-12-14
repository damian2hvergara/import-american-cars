import { CONFIG } from './config.js';

console.log('🔧 Inicializando conexión a Supabase...');
console.log('URL:', CONFIG.supabase.url);
console.log('API Key presente:', CONFIG.supabase.anonKey ? '✅' : '❌');

// Servicio de datos usando fetch directo
export const supabaseService = {
  
  // Obtener todos los vehículos activos
  async getVehiculos() {
    console.log('🚗 Iniciando carga de vehículos desde Supabase...');
    
    try {
      // Nota: asumo que la tabla se llama 'iac' y ahora incluye la columna 'imagenes' (text[])
      const url = `${CONFIG.supabase.url}/rest/v1/iac?select=*`;
      console.log('📡 URL de consulta:', url);
      console.log('🔑 Usando API Key:', CONFIG.supabase.anonKey.substring(0, 20) + '...');
      
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
        
        // Mostrar mensaje más detallado
        if (response.status === 401) {
          console.error('⚠️ ERROR 401: La API key puede ser incorrecta o la tabla no existe');
          console.error('   Verifica:');
          console.error('   1. Que la API key en config.js sea correcta');
          console.error('   2. Que la tabla "iac" exista en Supabase');
          console.error('   3. Que tengas permisos de lectura en la tabla');
        }
        
        return [];
      }
      
      const data = await response.json();
      console.log(`✅ ${data?.length || 0} vehículos obtenidos`);
      
      // Log del primer vehículo para debug
      if (data && data.length > 0) {
        console.log('📄 Primer vehículo recibido:');
        const primerVehiculo = data[0];
        console.log('ID:', primerVehiculo.id);
        console.log('Nombre:', primerVehiculo.nombre || 'No tiene nombre');
        console.log('Precio:', primerVehiculo.precio || 'No tiene precio');
        // Nuevo log para el campo de imágenes
        console.log('Imágenes (Array):', Array.isArray(primerVehiculo.imagenes) ? `${primerVehiculo.imagenes.length} URLs` : 'No es un array de URLs');
      }
      
      return data;
      
    } catch (error) {
      console.error('❌ Error general en getVehiculos:', error);
      return [];
    }
  },
  
  // NUEVA FUNCIÓN: Obtener todos los Kits de Mejora (de la tabla kits_upgrade)
  async getKits() {
    console.log('🛠️ Iniciando carga de kits de mejora desde Supabase...');
    try {
      // La tabla debe llamarse 'kits_upgrade'
      const url = `${CONFIG.supabase.url}/rest/v1/kits_upgrade?select=*&order=precio.asc`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': CONFIG.supabase.anonKey,
          'Authorization': `Bearer ${CONFIG.supabase.anonKey}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      console.log(`📦 Kits cargados: ${data.length}`);
      return data;
    } catch (error) {
      console.error('❌ Error al cargar los kits:', error);
      // Devuelve kits por defecto si falla la carga
      return this.getDefaultKits(); 
    }
  },

  // NUEVA FUNCIÓN: Obtener la imagen específica de un vehículo con un kit
  async getKitImageForVehicle(vehiculoId, kitId) {
    console.log(`🖼️ Buscando imagen para Vehículo ${vehiculoId} con Kit ${kitId}...`);
    try {
      // La tabla debe llamarse 'vehiculo_kits'
      const url = `${CONFIG.supabase.url}/rest/v1/vehiculo_kits?select=imagen_kit_url&vehiculo_id=eq.${vehiculoId}&kit_id=eq.${kitId}`;
       const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': CONFIG.supabase.anonKey,
          'Authorization': `Bearer ${CONFIG.supabase.anonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();

      // Devolver la primera URL encontrada
      return data[0]?.imagen_kit_url || null; 

    } catch (error) {
      console.error('❌ Error al buscar imagen de kit:', error);
      return null;
    }
  },

  // Obtener vehículo por ID
  async getVehiculoById(id) {
    try {
      console.log(`🔍 Buscando vehículo ID: ${id}`);
      const response = await fetch(`${CONFIG.supabase.url}/rest/v1/iac?id=eq.${id}&select=*`, {
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
      return data[0] || null;
    } catch (error) {
      console.error(`❌ Error en getVehiculoById ${id}:`, error);
      return null;
    }
  },
  
  // Función helper para obtener el precio del vehículo (se mantiene igual)
  findVehiclePrice(vehiculo) {
    const posiblesColumnas = ['precio', 'price', 'costo'];
    for (const columna of posiblesColumnas) {
      if (vehiculo[columna] !== undefined && vehiculo[columna] !== null) {
        const precio = parseFloat(vehiculo[columna]);
        if (!isNaN(precio) && precio > 0) {
          console.log(`💰 Precio encontrado en columna ${columna}: ${precio}`);
          return precio;
        }
      }
    }
    return 0;
  },
  
  // Kits por defecto (Si fallan las tablas, al menos se muestran los que estaban en el UI anterior)
  getDefaultKits() {
    return [
      {
        id: "standar",
        nombre: "Standar",
        precio: 0,
        descripcion: "Preparación básica incluida",
        nivel: "standar"
      },
      {
        id: "medium",
        nombre: "Medium",
        precio: 1200000,
        descripcion: "Mejoras estéticas y funcionales",
        nivel: "medium"
      },
      {
        id: "full",
        nombre: "Full",
        precio: 2500000,
        descripcion: "Transformación premium completa",
        nivel: "full"
      }
    ];
  }
};

// Probar conexión inmediatamente
console.log('🔄 Probando conexión con nueva API key...');
supabaseService.getVehiculos()
  .then(data => {
    if (data.length > 0) {
      console.log('🎉 ¡CONEXIÓN EXITOSA!');
      console.log(`📊 ${data.length} vehículos cargados correctamente`);
      console.log('Nombres de vehículos:', data.map(v => v.nombre || 'Sin nombre').join(', '));
    } else {
      console.log('⚠️ CONEXIÓN OK, pero no hay vehículos en la tabla "iac" o fallo la carga inicial.');
    }
  })
  .catch(error => {
    console.error('❌ FALLO LA PRUEBA DE CONEXIÓN INICIAL:', error);
  });
