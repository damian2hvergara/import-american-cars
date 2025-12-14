// Archivo principal - Inicialización de la aplicación
import { CONFIG } from './config.js';
import { productosManager } from './productos.js';
import { UI } from './ui.js';

// Inicializar la aplicación
class App {
  constructor() {
    this.initialized = false;
  }
  
  async init() {
    if (this.initialized) return;
    
    console.log('🚀 Import American Cars - Inicializando aplicación...');
    
    try {
      // 1. Inicializar interfaz
      UI.init();
      
      // 2. Verificar configuración
      this.verifyConfig();
      
      // 3. Cargar vehículos
      await productosManager.cargarVehiculos();
      
      // 4. Cargar feed de Instagram
      this.loadInstagramFeed();
      
      // 5. Marcar como inicializado
      this.initialized = true;
      
      console.log('✅ Aplicación inicializada correctamente');
      
    } catch (error) {
      console.error('❌ Error inicializando aplicación:', error);
      UI.showError('Error al inicializar la aplicación. Por favor, recarga la página.');
    }
  }
  
  // Verificar configuración
  verifyConfig() {
    const required = [
      'supabase.url',
      'supabase.anonKey',
      'contacto.whatsapp',
      'contacto.instagramUrl'
    ];
    
    const missing = [];
    
    required.forEach(path => {
      const keys = path.split('.');
      let value = CONFIG;
      
      keys.forEach(key => {
        value = value?.[key];
      });
      
      if (!value) {
        missing.push(path);
      }
    });
    
    if (missing.length > 0) {
      console.warn('⚠️ Configuración incompleta. Campos faltantes:', missing);
      UI.showNotification('Configuración incompleta. Verifica las credenciales.', 'warning');
    }
  }
  
  // Cargar feed de Instagram (simulado)
  loadInstagramFeed() {
    const feedContainer = document.getElementById('instagramFeed');
    if (!feedContainer || !CONFIG.app.mostrarInstagram) return;
    
    const posts = [
      {
        image: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        caption: 'Chevrolet Silverado 2021 lista para entrega en Arica. Kit Full Upgrade instalado.',
        likes: 142,
        comments: 23,
        url: `${CONFIG.contacto.instagramUrl}?utm_source=web`,
        timestamp: '2024-03-10'
      },
      {
        image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        caption: 'Proceso de instalación Kit Medium en Ford F-150. Transformación completa en nuestro taller.',
        likes: 189,
        comments: 31,
        url: `${CONFIG.contacto.instagramUrl}?utm_source=web`,
        timestamp: '2024-03-09'
      },
      {
        image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        caption: 'Nuevo lote de vehículos llegando desde USA. Variedad de modelos disponibles.',
        likes: 203,
        comments: 42,
        url: `${CONFIG.contacto.instagramUrl}?utm_source=web`,
        timestamp: '2024-03-08'
      },
      {
        image: 'https://images.unsplash.com/photo-1555212697-194d092e3b8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        caption: 'Comparación antes/después del Kit Full en RAM 1500. La diferencia es impresionante.',
        likes: 256,
        comments: 38,
        url: `${CONFIG.contacto.instagramUrl}?utm_source=web`,
        timestamp: '2024-03-07'
      }
    ];
    
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
  }
  
  // Función para recargar datos
  async reloadData() {
    console.log('🔄 Recargando datos...');
    UI.showLoading();
    await productosManager.cargarVehiculos();
    UI.showNotification('Datos actualizados correctamente', 'success');
  }
}

// Instancia global de la aplicación
const app = new App();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  app.init().catch(error => {
    console.error('Error fatal al inicializar:', error);
  });
});

// Exportar para acceso global (opcional)
window.app = app;
window.productosManager = productosManager;
window.UI = UI;
