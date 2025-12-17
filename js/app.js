import { CONFIG } from './config.js';
import { productosManager } from './productos.js';
import { UI } from './ui.js';

// CLASE PRINCIPAL DE LA APLICACIÓN
class App {
  constructor() {
    this.initialized = false;
    console.log('📱 Aplicación Import American Cars creada');
  }
  
  // INICIALIZAR LA APLICACIÓN
  async init() {
    if (this.initialized) {
      console.log('🔄 Aplicación ya inicializada');
      return;
    }
    
    console.log('🚀 Inicializando aplicación Import American Cars...');
    
    try {
      // 1. INICIALIZAR INTERFAZ DE USUARIO
      console.log('1️⃣ Inicializando UI...');
      UI.init();
      
      // 2. VERIFICAR CONFIGURACIÓN
      console.log('2️⃣ Verificando configuración...');
      this.verifyConfig();
      
      // 3. CARGAR VEHÍCULOS DESDE SUPABASE
      console.log('3️⃣ Cargando vehículos...');
      await productosManager.cargarVehiculos();
      
      // 4. CARGAR FEED DE INSTAGRAM (SIMULADO)
      console.log('4️⃣ Cargando feed de Instagram...');
      this.loadInstagramFeed();
      
      // 5. MARCAR COMO INICIALIZADO
      this.initialized = true;
      
      console.log('✅ ¡APLICACIÓN INICIALIZADA CORRECTAMENTE!');
      console.log('👉 Los vehículos deberían estar visibles en la página');
      
    } catch (error) {
      console.error('❌ ERROR CRÍTICO al inicializar la aplicación:', error);
      UI.showError('Error al inicializar la aplicación. Por favor, recarga la página.');
    }
  }
  
  // VERIFICAR CONFIGURACIÓN ESENCIAL
  verifyConfig() {
    const configErrors = [];
    
    // Verificar Supabase
    if (!CONFIG.supabase.url) {
      configErrors.push('URL de Supabase no configurada');
    }
    if (!CONFIG.supabase.anonKey) {
      configErrors.push('API Key de Supabase no configurada');
    }
    
    // Verificar Contacto
    if (!CONFIG.contacto.whatsapp) {
      configErrors.push('Número de WhatsApp no configurado');
    }
    
    if (configErrors.length > 0) {
      console.warn('⚠️ ADVERTENCIA: Configuración incompleta');
      configErrors.forEach(error => console.warn('   -', error));
      UI.showNotification('Configuración incompleta. Verifica las credenciales.', 'warning');
    } else {
      console.log('✅ Configuración verificada correctamente');
    }
  }
  
  // CARGAR FEED DE INSTAGRAM (SIMULADO)
  loadInstagramFeed() {
    const feedContainer = document.getElementById('instagramFeed');
    if (!feedContainer || !CONFIG.app.mostrarInstagram) {
      console.log('ℹ️ Feed de Instagram no configurado o desactivado');
      return;
    }
    
    console.log('📸 Cargando feed de Instagram...');
    
    // Posts de ejemplo (en producción se conectaría a la API de Instagram)
    const posts = [
      {
        image: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        caption: 'Chevrolet Silverado 2021 lista para entrega en Arica. Kit Full Upgrade instalado.',
        likes: 142,
        comments: 23,
        url: CONFIG.contacto.instagramUrl
      },
      {
        image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        caption: 'Proceso de instalación Kit Medium en Ford F-150. Transformación completa en nuestro taller.',
        likes: 189,
        comments: 31,
        url: CONFIG.contacto.instagramUrl
      },
      {
        image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        caption: 'Nuevo lote de vehículos llegando desde USA. Variedad de modelos disponibles.',
        likes: 203,
        comments: 42,
        url: CONFIG.contacto.instagramUrl
      }
    ];
    
    // Generar HTML para el feed
    feedContainer.innerHTML = posts.map(post => `
      <div class="instagram-post" onclick="window.open('${post.url}', '_blank')">
        <img src="${post.image}" alt="Instagram post" class="instagram-image"
             onerror="this.src='${CONFIG.app.defaultImage}'">
        <div class="instagram-info">
          <div class="instagram-stats">
            <span><i class="fas fa-heart"></i> ${post.likes}</span>
            <span><i class="fas fa-comment"></i> ${post.comments}</span>
          </div>
          <div class="instagram-caption">${post.caption}</div>
          <a href="${post.url}" target="_blank" class="instagram-link">
            <i class="fab fa-instagram"></i> Ver en Instagram
          </a>
        </div>
      </div>
    `).join('');
    
    console.log(`✅ ${posts.length} posts de Instagram cargados`);
  }
  
  // FUNCIÓN PARA RECARGAR DATOS
  async reloadData() {
    console.log('🔄 Recargando datos desde Supabase...');
    UI.showLoading();
    await productosManager.cargarVehiculos();
    UI.showNotification('Datos actualizados correctamente', 'success');
    console.log('✅ Datos recargados');
  }
}

// CREAR INSTANCIA GLOBAL DE LA APLICACIÓN
const app = new App();

// INICIALIZAR CUANDO EL DOM ESTÉ LISTO
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM cargado, iniciando aplicación...');
  app.init().catch(error => {
    console.error('💥 Error fatal al inicializar:', error);
  });
});

// HACER DISPONIBLE GLOBALMENTE PARA DEBUG
window.app = app;
window.productosManager = productosManager;
window.UI = UI;

console.log('🔧 Módulo app.js cargado correctamente');
