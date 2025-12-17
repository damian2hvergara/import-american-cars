import { CONFIG } from './config.js';
import { productosManager } from './productos.js';
import { UImanager } from './ui-manager.js';

// Inicializar la aplicación
class App {
  constructor() {
    this.initialized = false;
  }
  
  async init() {
    if (this.initialized) return;
    
    console.log('🚀 Inicializando Import American Cars...');
    
    try {
      // 1. Configurar referencias cruzadas
      productosManager.setUI(UImanager);
      
      // 2. Inicializar UI Manager
      UImanager.init();
      
      // 3. Cargar datos
      await productosManager.cargarVehiculos();
      
      // 4. Cargar Instagram feed
      this.cargarInstagramFeed();
      
      // 5. Configurar año en footer
      this.configurarAnioFooter();
      
      this.initialized = true;
      console.log('✅ Aplicación inicializada correctamente');
      
    } catch (error) {
      console.error('❌ Error inicializando aplicación:', error);
      UImanager.mostrarNotificacion('Error al inicializar. Recarga la página.', 'error');
    }
  }
  
  cargarInstagramFeed() {
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
  
  configurarAnioFooter() {
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  }
  
  // Smooth scrolling
  configurarScrollSuave() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 60,
            behavior: 'smooth'
          });
        }
      });
    });
  }
}

// Instancia global de la app
const app = new App();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM cargado, iniciando aplicación...');
  
  // Configurar scroll suave
  app.configurarScrollSuave();
  
  // Inicializar aplicación
  app.init().catch(error => {
    console.error('💥 Error fatal:', error);
  });
});

// Hacer disponible para debugging
window.app = app;
window.productosManager = productosManager;
