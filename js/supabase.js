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
        console.log('Estado:', primerVehiculo.estado || 'No tiene estado');
        console.log('Activo:', primerVehiculo.activo || 'No tiene activo');
        console.log('Todas las columnas:', Object.keys(primerVehiculo));
        
        // Verificar columnas de imagen
        const columnasImagen = Object.keys(primerVehiculo).filter(key => 
          key.toLowerCase().includes('imagen') || 
          key.toLowerCase().includes('foto') || 
          key.toLowerCase().includes('image')
        );
        console.log('Columnas de imagen:', columnasImagen);
        if (columnasImagen.length > 0) {
          console.log('Primera imagen:', primerVehiculo[columnasImagen[0]]);
        }
      } else {
        console.log('⚠️ La tabla está vacía o no devolvió datos');
      }
      
      // Filtrar por activo si la columna existe
      return this.filtrarVehiculosActivos(data);
      
    } catch (error) {
      console.error('💥 Error fatal en getVehiculos:', error);
      console.error('Detalles:', error.message);
      return [];
    }
  },
  
  // Filtrar vehículos activos
  filtrarVehiculosActivos(vehiculos) {
    if (!vehiculos || !Array.isArray(vehiculos)) {
      return [];
    }
    
    // Si hay columna activo, filtrar por ella
    if (vehiculos.length > 0 && vehiculos[0].activo !== undefined) {
      const filtrados = vehiculos.filter(v => v.activo === true);
      console.log(`📊 Filtrados ${filtrados.length} vehículos activos de ${vehiculos.length} totales`);
      return filtrados;
    }
    
    // Si no hay columna activo, devolver todos
    console.log('ℹ️ No se encontró columna "activo", devolviendo todos los vehículos');
    return vehiculos;
  },
  
  // Obtener vehículo por ID
  async getVehiculoById(id) {
    try {
      console.log(`🔍 Buscando vehículo ID: ${id}`);
      
      const response = await fetch(`${CONFIG.supabase.url}/rest/v1/iac?id=eq.${id}`, {
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
      console.error('Error en getVehiculoById:', error);
      return null;
    }
  },
  
  // Obtener kits de un vehículo específico
  async getKitsByVehiculo(vehiculoId) {
    try {
      console.log(`🔧 Obteniendo kits para vehículo ID: ${vehiculoId}`);
      
      const vehiculo = await this.getVehiculoById(vehiculoId);
      if (!vehiculo) {
        console.log(`⚠️ Vehículo ${vehiculoId} no encontrado, usando kits por defecto`);
        return this.getDefaultKits();
      }
      
      const kits = [
        {
          id: "standar",
          nombre: "Standar",
          precio: 0,
          descripcion: "Preparación básica incluida",
          nivel: "standar"
        }
      ];
      
      // Buscar kit medium
      const mediumPrecio = this.buscarPrecioKit(vehiculo, ['kit_medium_precio', 'medium_precio', 'kit_medium_price']);
      if (mediumPrecio > 0) {
        kits.push({
          id: "medium",
          nombre: "Medium",
          precio: mediumPrecio,
          descripcion: vehiculo.kit_medium_descripcion || "Mejoras estéticas y funcionales",
          nivel: "medium"
        });
      }
      
      // Buscar kit full
      const fullPrecio = this.buscarPrecioKit(vehiculo, ['kit_full_precio', 'full_precio', 'kit_full_price']);
      if (fullPrecio > 0) {
        kits.push({
          id: "full",
          nombre: "Full",
          precio: fullPrecio,
          descripcion: vehiculo.kit_full_descripcion || "Transformación premium completa",
          nivel: "full"
        });
      }
      
      console.log(`✅ ${kits.length} kits generados`);
      return kits;
      
    } catch (error) {
      console.error('Error obteniendo kits:', error);
      return this.getDefaultKits();
    }
  },
  
  // Buscar precio de kit en diferentes columnas
  buscarPrecioKit(vehiculo, columnas) {
    for (const columna of columnas) {
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
  
  // Kits por defecto
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
      console.log('⚠️ Conexión exitosa pero la tabla está vacía');
      console.log('   Verifica que tu tabla "iac" tenga datos en Supabase');
    }
  })
  .catch(error => {
    console.error('❌ Error en prueba de conexión:', error);
  });
// En supabase.js

export const supabaseService = {
  // ... getVehiculos (asumimos que sigue igual) ...

  // 1. Obtener todos los Kits de Mejora
  async getKits() {
    console.log('🛠️ Iniciando carga de kits de mejora...');
    try {
      const url = `${CONFIG.supabase.url}/rest/v1/kits_upgrade?select=*&order=precio.asc`;
      const response = await fetch(url, { /* headers, etc. */ });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      console.log(`📦 Kits cargados: ${data.length}`);
      return data;
    } catch (error) {
      console.error('❌ Error al cargar los kits:', error);
      return []; // Devolver array vacío en caso de error
    }
  },

  // 2. Obtener la imagen específica de un vehículo con un kit
  async getKitImageForVehicle(vehiculoId, kitId) {
    console.log(`🖼️ Buscando imagen para Vehículo ${vehiculoId} con Kit ${kitId}...`);
    try {
      // Usar 'vehiculo_kits' y filtrar por los dos IDs
      const url = `${CONFIG.supabase.url}/rest/v1/vehiculo_kits?select=imagen_kit_url&vehiculo_id=eq.${vehiculoId}&kit_id=eq.${kitId}`;
      const response = await fetch(url, { /* headers, etc. */ });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();

      // Devolver la primera URL encontrada
      return data[0]?.imagen_kit_url || null; 

    } catch (error) {
      console.error('❌ Error al buscar imagen de kit:', error);
      return null;
    }
  }
};
