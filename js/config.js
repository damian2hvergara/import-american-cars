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
    ubicacion: "Arica, Chile",
    horario: "Lunes a Viernes 9:00 - 19:00"
  },
  
  // Comportamiento de la app
  app: {
    mostrarPrecios: true,
    moneda: "CLP",
    formatoPrecio: "CLP",
    mostrarStock: true,
    mostrarInstagram: true,
    defaultImage: "https://images.unsplash.com/photo-1580274455191-1c62238fa333?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  }
};
