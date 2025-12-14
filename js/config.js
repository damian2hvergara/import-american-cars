// CONFIGURACIÓN CENTRALIZADA - CON TU NUEVA API KEY
export const CONFIG = {
  // Supabase - Credenciales PÚBLICAS
  supabase: {
    url: "https://cflpmluvhfldewiitymh.supabase.co",
    // ⚠️ USA ESTA KEY QUE ENCONTRASTE
    anonKey: "sb_publishable_lvUG-G_2bzDxyVZwAF25HA_30dFAb3K"
  },
  
  // Cloudinary - Configuración
  cloudinary: {
    cloudName: "df2gprqhp",
    folder: "vehiculos",
    apiKey: "914327863259667",
    apiSecret: "UsAsQb-Ej_Zx6LmBk-celUlTf9Q"
  },
  
  // Contacto - Datos desde un solo lugar
  contacto: {
    whatsapp: "56981458545",
    instagram: "import_american_cars",
    instagramUrl: "https://www.instagram.com/import_american_cars",
    email: "contacto@importamericancars.cl",
    ubicacion: "Zona Franca Arica, Chile",
    horario: "Lunes a Viernes 9:00 - 19:00"
  },
  
  // Comportamiento de la app
  app: {
    mostrarPrecios: true,
    moneda: "CLP",
    formatoPrecio: "CLP",
    mostrarStock: true,
    mostrarInstagram: true,
    
    // Nueva paleta de colores profesional
    colors: {
      primaryDark: "#2C3E50",
      primaryMain: "#3498DB",
      primaryLight: "#E8F4FC",
      secondaryDark: "#7F8C8D",
      secondaryMain: "#95A5A6",
      secondaryLight: "#ECF0F1",
      accent: "#1ABC9C",       // Verde elegante para botones KITS
      whatsappGreen: "#25D366", // Verde WhatsApp profesional
      whatsappHover: "#128C7E",
      success: "#27AE60",
      warning: "#F39C12",
      error: "#E74C3C"
    },
    
    // Imágenes por defecto reales (Unsplash)
    defaultImage: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    heroBackground: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    placeholderImages: [
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1580274455191-1c62238fa333?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1555212697-194d092e3b8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ]
  }
};

console.log('⚙️ Configuración cargada correctamente');
console.log('📡 Supabase URL:', CONFIG.supabase.url);
console.log('🎨 Nueva paleta de colores cargada');
