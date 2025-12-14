import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { CONFIG } from './config.js';

// Cliente Supabase seguro - SOLO LECTURA
const supabase = createClient(
  CONFIG.supabase.url,
  CONFIG.supabase.anonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
);

// Servicio seguro de datos
export const supabaseService = {
  // Obtener todos los vehículos activos
  async getVehiculos() {
    try {
      const { data, error } = await supabase
        .from('IAC')
        .select('*')
        .eq('activo', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error obteniendo vehículos:', error);
        throw error;
      }
      
      console.log(`✅ ${data?.length || 0} vehículos cargados desde Supabase`);
      return data || [];
      
    } catch (error) {
      console.error('Error en getVehiculos:', error);
      return [];
    }
  },
  
  // Obtener vehículo por ID
  async getVehiculoById(id) {
    try {
      const { data, error } = await supabase
        .from('IAC')
        .select('*')
        .eq('id', id)
        .eq('activo', true)
        .single();

      if (error) throw error;
      return data;
      
    } catch (error) {
      console.error('Error obteniendo vehículo:', error);
      return null;
    }
  },
  
  // Obtener kits de un vehículo específico
  async getKitsByVehiculo(vehiculoId) {
    try {
      // Asumiendo que los kits están en la misma tabla IAC
      const { data, error } = await supabase
        .from('IAC')
        .select('kit_standar_incluido, kit_medium_precio, kit_full_precio, kit_medium_descripcion, kit_full_descripcion')
        .eq('id', vehiculoId)
        .single();

      if (error) throw error;
      
      // Construir array de kits desde los datos del vehículo
      const kits = [
        {
          id: "standar",
          nombre: "Standar",
          precio: 0,
          descripcion: "Preparación básica incluida",
          nivel: "standar"
        }
      ];
      
      if (data?.kit_medium_precio > 0) {
        kits.push({
          id: "medium",
          nombre: "Medium",
          precio: data.kit_medium_precio,
          descripcion: data.kit_medium_descripcion || "Mejoras estéticas y funcionales",
          nivel: "medium"
        });
      }
      
      if (data?.kit_full_precio > 0) {
        kits.push({
          id: "full",
          nombre: "Full",
          precio: data.kit_full_precio,
          descripcion: data.kit_full_descripcion || "Transformación premium completa",
          nivel: "full"
        });
      }
      
      return kits;
      
    } catch (error) {
      console.error('Error obteniendo kits:', error);
      return [];
    }
  }
};

// Verificar conexión al cargar
supabaseService.getVehiculos()
  .then(data => {
    console.log('✅ Conexión a Supabase establecida correctamente');
    console.log(`📊 Vehículos disponibles: ${data.length}`);
  })
  .catch(error => {
    console.error('❌ Error de conexión a Supabase:', error);
  });
