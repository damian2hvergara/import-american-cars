// CONFIGURACIÓN CENTRALIZADA PARA IMPORT AMERICAN CARS
// IMPORTANTE: Actualiza la URL de Supabase con tu proyecto real

export const CONFIG = {
  // SUPABASE - BASE DE DATOS
  // OBTENER EN: https://app.supabase.com → Project Settings → API
  supabase: {
    url: "https://cflpmluvhfldewiitymh.supabase.co", // ← REEMPLAZA CON TU URL
    anonKey: "sb_publishable_lvUG-G_2bzDxyVZwAF25HA_30dFAb3K" // ← Esta key parece correcta
  },
  
  // CLOUDINARY - ALMACENAMIENTO DE IMÁGENES
  cloudinary: {
    cloudName: "df2gprqhp",
    folder: "vehiculos",
    apiKey: "914327863259667",
    apiSecret: "UsAsQb-Ej_Zx6LmBk-celUlTf9Q"
  },
  
  // CONTACTO - DATOS EMPRESA
  contacto: {
    whatsapp: "56981458545",
    instagram: "import_american_cars",
    instagramUrl: "https://www.instagram.com/import_american_cars",
    email: "contacto@importamericancars.cl",
    ubicacion: "Zona Franca Arica, Chile",
    horario: "Lunes a Viernes 9:00 - 19:00",
    telefono: "+56 9 8145 8545"
  },
  
  // CONFIGURACIÓN DE LA APLICACIÓN
  app: {
    mostrarPrecios: true,
    moneda: "CLP",
    formatoPrecio: "CLP",
    mostrarStock: true,
    mostrarInstagram: true,
    maxImagenesVehículo: 8,
    mostrarPuntosImagenes: true,
    comparadorActivo: true,
    
    // Imágenes por defecto
    defaultImage: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    
    // Estados posibles (deben coincidir con la base de datos)
    estados: {
      stock: "stock",
      transit: "transit",
      reserved: "reserved" // Nota: 'reserved' no 'reserve'
    },
    
    // Textos para estados
    textosEstado: {
      stock: "En Stock Arica",
      transit: "En Tránsito",
      reserved: "Para Reservar"
    },
    
    // Colores para estados
    coloresEstado: {
      stock: "#34C759", // success
      transit: "#FF9500", // warning
      reserved: "#0066cc" // blue
    }
  }
};

// Validación de configuración
(function validateConfig() {
  console.log('🔧 Validando configuración...');
  
  if (!CONFIG.supabase.url || CONFIG.supabase.url.includes("TU_PROYECTO")) {
    console.error('❌ ERROR: URL de Supabase no configurada');
    console.log('   Ve a https://app.supabase.com → Project Settings → API');
    console.log('   Copia "Project URL" y reemplaza en config.js');
  }
  
  if (!CONFIG.supabase.anonKey) {
    console.error('❌ ERROR: API Key de Supabase no configurada');
  }
  
  console.log('✅ Configuración cargada');
})();
