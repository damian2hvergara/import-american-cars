import { CONFIG } from './config.js';
import { productosManager } from './productos.js';
import { UIManager } from './ui/ui-manager.js';

class App {
  constructor() {
    this.initialized = false;
    console.log('📱 Aplicación Import American Cars creada');
  }
  
  async init() {
    if (this.initialized) return;
    
    console.log('🚀 Inicializando aplicación...');
    
    try {
      // 1. INICIALIZAR UI MANAGER
      console.log('1️⃣ Inicializando UI Manager...');
      UIManager.init();
      
      // 2. CONFIGURAR PRODUCTOS MANAGER
      console.log('2️⃣ Configurando Productos Manager...');
      // No necesitas setUI si usamos window.UIManager
      
      // 3. CARGAR VEHÍCULOS
      console.log('3️⃣ Cargando vehículos...');
      await productosManager.cargarVehiculos();
      
      // 4. CARGAR INSTAGRAM
      console.log('4️⃣ Cargando feed de Instagram...');
      this.loadInstagramFeed();
      
      // 5. AÑO ACTUAL
      console.log('5️⃣ Configurando año actual...');
      this.setCurrentYear();
      
      this.initialized = true;
      console.log('✅ ¡APLICACIÓN INICIALIZADA!');
      
    } catch (error) {
      console.error('❌ ERROR al inicializar:', error);
      UIManager.showError('Error al inicializar. Recarga la página.');
    }
  }
  
  loadInstagramFeed() {
    const feedContainer = document.getElementById('instagramFeed');
    if (!feedContainer || !CONFIG.app.mostrarInstagram) return;
    
    const posts = [
      {
        image: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        caption: 'Chevrolet Silverado 2021 lista para entrega en Arica.',
        likes: 142,
        comments: 23,
        url: CONFIG.contacto.instagramUrl
      },
      {
        image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        caption: 'Proceso de instalación Kit Medium en Ford F-150.',
        likes: 189,
        comments: 31,
        url: CONFIG.contacto.instagramUrl
      },
      {
        image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        caption: 'Nuevo lote de vehículos llegando desde USA.',
        likes: 203,
        comments: 42,
        url: CONFIG.contacto.instagramUrl
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
  
  setCurrentYear() {
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  }
}

// INSTANCIA GLOBAL
const app = new App();

// INICIAR CUANDO EL DOM ESTÉ LISTO
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM cargado, iniciando aplicación...');
  app.init().catch(error => {
    console.error('💥 Error fatal:', error);
  });
});

// HACER DISPONIBLE PARA DEBUG
window.app = app;
