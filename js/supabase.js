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
      const url = `${CONFIG.supabase.url}/rest/v1/iac?select=*`;
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
        console.log('Imágenes (Array):', Array.isArray(primerVehiculo.imagenes) ? `${primerVehiculo.imagenes.length} URLs` : 'No es un array de URLs');
        
        // Mostrar las URLs de las imágenes para debug
        if (Array.isArray(primerVehiculo.imagenes)) {
          primerVehiculo.imagenes.forEach((url, index) => {
            console.log(`  Imagen ${index + 1}:`, url);
          });
        }
      }
      
      return data;
      
    } catch (error) {
      console.error('❌ Error general en getVehiculos:', error);
      return [];
    }
  },
  
  // Obtener todos los Kits de Mejora (de la tabla kits_upgrade)
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
      
      if (!response.ok) {
        console.warn('⚠️ No se pudo cargar kits_upgrade, usando kits por defecto');
        return this.getDefaultKits();
      }
      
      const data = await response.json();
      console.log(`📦 Kits cargados desde Supabase: ${data.length}`);
      return data;
      
    } catch (error) {
      console.error('❌ Error al cargar los kits:', error);
      // Devuelve kits por defecto si falla la carga
      return this.getDefaultKits(); 
    }
  },

  // CORREGIDO: Obtener la imagen específica de un vehículo con un kit
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
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        
        // Si la tabla no existe (error 404 o PGRST205), no es un error crítico
        if (response.status === 404 || 
            (error.message && error.message.includes('Could not find the table'))) {
          console.log(`ℹ️ Tabla 'vehiculo_kits' no encontrada para vehículo ${vehiculoId}, kit ${kitId}`);
          return null;
        }
        
        console.warn(`⚠️ Error al buscar imagen de kit:`, error);
        return null;
      }
      
      const data = await response.json();
      
      // Devolver la primera URL encontrada o null
      return data[0]?.imagen_kit_url || null; 

    } catch (error) {
      console.warn('⚠️ Error al buscar imagen de kit (no crítico):', error.message || error);
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
  
  // Función helper para obtener el precio del vehículo
  findVehiclePrice(vehiculo) {
    const posiblesColumnas = ['precio', 'price', 'costo', 'valor'];
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
    console.log('📋 Usando kits por defecto');
    return [
      {
        id: "standar",
        nombre: "Standard",
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
console.log('🔄 Probando conexión con Supabase...');
supabaseService.getVehiculos()
  .then(data => {
    if (data.length > 0) {
      console.log('🎉 ¡CONEXIÓN EXITOSA!');
      console.log(`📊 ${data.length} vehículos cargados correctamente`);
      
      // Mostrar nombres de vehículos para verificar
      const nombres = data.map(v => v.nombre || 'Sin nombre').filter(n => n !== 'Sin nombre');
      if (nombres.length > 0) {
        console.log('Nombres de vehículos:', nombres.join(', '));
      }
    } else {
      console.log('⚠️ CONEXIÓN OK, pero no hay vehículos en la tabla "iac" o fallo la carga inicial.');
      console.log('ℹ️ Verifica que la tabla "iac" tenga datos en Supabase.');
    }
  })
  .catch(error => {
    console.error('❌ FALLO LA PRUEBA DE CONEXIÓN INICIAL:', error);
    console.error('⚠️ Verifica tu conexión a internet y las credenciales en config.js');
  });
