// CONFIGURACIÓN CENTRALIZADA PARA IMPORT AMERICAN CARS
export const CONFIG = {
  // SUPABASE - BASE DE DATOS
  supabase: {
    url: "https://cflpmluvhfldewiitymh.supabase.co",
    anonKey: "sb_publishable_lvUG-G_2bzDxyVZwAF25HA_30dFAb3K"
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
    horario: "Lunes a Viernes 9:00 - 19:00"
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
    defaultImage: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    placeholderImages: [
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1580274455191-1c62238fa333?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1555212697-194d092e3b8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ]
  }
};

console.log('✅ Configuración cargada correctamente');
