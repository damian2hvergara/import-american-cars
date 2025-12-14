import { CONFIG } from './config.js';

console.log('🔧 Inicializando conexión a Supabase...');
console.log('URL:', CONFIG.supabase.url);
console.log('API Key presente:', CONFIG.supabase.anonKey ? '✅' : '❌');

// Servicio seguro de datos usando fetch directo (más confiable)
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
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      });
      
      console.log('📊 Respuesta HTTP:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error HTTP:', errorText);
        
        // Intentar sin prefer header
        console.log('🔄 Intentando sin header Prefer...');
        const response2 = await fetch(url, {
          method: 'GET',
          headers: {
            'apikey': CONFIG.supabase.anonKey,
            'Authorization': `Bearer ${CONFIG.supabase.anonKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response2.ok) {
          const errorText2 = await response2.text();
          console.error('❌ Error HTTP (segundo intento):', errorText2);
          return [];
        }
        
        const data2 = await response2.json();
        console.log(`✅ ${data2?.length || 0} vehículos obtenidos (segundo intento)`);
        return this.filtrarVehiculosActivos(data2);
      }
      
      const data = await response.json();
      console.log(`✅ ${data?.length || 0} vehículos obtenidos`);
      
      // Log del primer vehículo para debug
      if (data && data.length > 0) {
        console.log('📄 Primer vehículo recibido:', {
          id: data[0].id,
          nombre: data[0].nombre,
          precio: data[0].precio,
          estado: data[0].estado,
          activo: data[0].activo,
          columnas: Object.keys(data[0])
        });
      }
      
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
      
      // Primero obtener el vehículo
      const vehiculo = await this.getVehiculoById(vehiculoId);
      if (!vehiculo) {
        console.log(`⚠️ Vehículo ${vehiculoId} no encontrado, usando kits por defecto`);
        return this.getDefaultKits();
      }
      
      console.log('📋 Vehículo encontrado, buscando datos de kits...');
      
      // Kits base
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
      
      console.log(`✅ ${kits.length} kits generados para vehículo ${vehiculoId}`);
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

// Probar conexión al cargar
console.log('🔄 Realizando prueba de conexión inicial...');
supabaseService.getVehiculos()
  .then(data => {
    console.log('🎉 Prueba de conexión exitosa!');
    console.log(`📊 Total de vehículos: ${data.length}`);
  })
  .catch(error => {
    console.error('❌ Error en prueba de conexión:', error);
  });
