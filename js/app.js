import { CONFIG } from './config.js';
import { productosManager } from './productos.js';
import { UIManager } from './ui/ui-manager.js';

export class App {
  constructor() {
    this.initialized = false;
    this.uiManager = null;
    console.log('📱 Aplicación Import American Cars creada');
  }
  
  async init() {
    if (this.initialized) return;
    
    console.log('🚀 Inicializando aplicación...');
    
    try {
      // 1. VALIDAR CONFIGURACIÓN
      console.log('1️⃣ Validando configuración...');
      this.validateConfig();
      
      // 2. CONFIGURAR EVENTOS BÁSICOS
      console.log('2️⃣ Configurando eventos básicos...');
      this.setupBasicEvents();
      
      // 3. INICIALIZAR UI MANAGER
      console.log('3️⃣ Inicializando UI Manager...');
      this.uiManager = UIManager;
      UIManager.init();
      
      // 4. CONFIGURAR PRODUCTOS MANAGER
      console.log('4️⃣ Configurando Productos Manager...');
      productosManager.setUIManager(UIManager);
      
      // 5. CARGAR VEHÍCULOS
      console.log('5️⃣ Cargando vehículos...');
      await productosManager.cargarVehiculos();
      
      // 6. CARGAR INSTAGRAM
      console.log('6️⃣ Cargando feed de Instagram...');
      this.loadInstagramFeed();
      
      // 7. CONFIGURAR AÑO ACTUAL
      console.log('7️⃣ Configurando año actual...');
      this.setCurrentYear();
      
      // 8. CONFIGURAR EVENTOS DE FILTRO
      console.log('8️⃣ Configurando eventos de filtro...');
      this.setupFilterEvents();
      
      // 9. MARCAR COMO INICIALIZADO
      this.initialized = true;
      
      // 10. NOTIFICAR ÉXITO
      console.log('✅ ¡APLICACIÓN INICIALIZADA CORRECTAMENTE!');
      console.log('📊 Vehículos cargados:', productosManager.vehiculos.length);
      
      // 11. QUITAR CLASE DE LOADING DEL BODY
      document.body.classList.add('loaded');
      
    } catch (error) {
      console.error('❌ ERROR al inicializar:', error);
      this.showError('Error al inicializar la aplicación. Recarga la página.');
    }
  }
  
  validateConfig() {
    if (!CONFIG.supabase.url || CONFIG.supabase.url.includes("TU_PROYECTO")) {
      console.error('❌ URL de Supabase no configurada');
      this.showError(
        'Configuración incompleta. <br>' +
        'Por favor, actualiza la URL de Supabase en config.js'
      );
    }
  }
  
  setupBasicEvents() {
    // Menú móvil
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (menuToggle && mobileMenu) {
      menuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
      });
      
      // Cerrar menú al hacer click en un enlace
      mobileMenu.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
          mobileMenu.classList.remove('active');
        });
      });
    }
    
    // Smooth scrolling para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        const targetElement = document.querySelector(href);
        if (targetElement) {
          e.preventDefault();
          const headerHeight = document.querySelector('.header').offsetHeight || 60;
          const targetPosition = targetElement.offsetTop - headerHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
    
    // Eventos para los indicadores de stock
    document.querySelectorAll('.indicator').forEach(indicator => {
      indicator.addEventListener('click', () => {
        const filter = indicator.dataset.filter;
        if (filter && productosManager) {
          productosManager.filtrarVehiculos(filter);
          
          // Scroll a la sección de vehículos
          const vehiclesSection = document.getElementById('vehicles');
          if (vehiclesSection) {
            const headerHeight = document.querySelector('.header').offsetHeight || 60;
            const targetPosition = vehiclesSection.offsetTop - headerHeight;
            
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
          }
        }
      });
    });
    
    // Botón "Ver Kits por Vehículo"
    const showAllKitsBtn = document.getElementById('showAllKits');
    if (showAllKitsBtn) {
      showAllKitsBtn.addEventListener('click', () => {
        // Scroll a la sección de kits
        const kitsSection = document.getElementById('customize');
        if (kitsSection) {
          const headerHeight = document.querySelector('.header').offsetHeight || 60;
          const targetPosition = kitsSection.offsetTop - headerHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    }
  }
  
  setupFilterEvents() {
    const filterButtons = document.querySelectorAll('.filter-button');
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const filter = button.dataset.filter;
        if (filter && productosManager) {
          productosManager.filtrarVehiculos(filter);
        }
      });
    });
  }
  
  loadInstagramFeed() {
    const feedContainer = document.getElementById('instagramFeed');
    if (!feedContainer || !CONFIG.app.mostrarInstagram) return;
    
    // Datos de ejemplo - en producción, usarías la API de Instagram
    const posts = [
      {
        image: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        caption: 'Chevrolet Silverado 2021 lista para entrega en Arica. Full equipo, motor V8, 4x4.',
        likes: 142,
        comments: 23,
        url: CONFIG.contacto.instagramUrl
      },
      {
        image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        caption: 'Proceso de instalación Kit Medium en Ford F-150. Llantas deportivas y suspensión.',
        likes: 189,
        comments: 31,
        url: CONFIG.contacto.instagramUrl
      },
      {
        image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        caption: 'Nuevo lote de vehículos llegando desde USA. Próximamente disponibles en stock.',
        likes: 203,
        comments: 42,
        url: CONFIG.contacto.instagramUrl
      }
    ];
    
    feedContainer.innerHTML = posts.map(post => `
      <div class="instagram-post" onclick="window.open('${post.url}', '_blank')">
        <img src="${post.image}" alt="Instagram post" class="instagram-image"
             onerror="this.src='${CONFIG.app.defaultImage}'"
             loading="lazy">
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
  
  showError(message) {
    // Crear elemento de error
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--error);
      color: white;
      padding: 16px 24px;
      border-radius: var(--radius);
      z-index: 9999;
      max-width: 90%;
      text-align: center;
      box-shadow: var(--shadow);
    `;
    errorDiv.innerHTML = message;
    
    document.body.appendChild(errorDiv);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
      errorDiv.style.opacity = '0';
      errorDiv.style.transition = 'opacity 0.3s';
      setTimeout(() => errorDiv.remove(), 300);
    }, 5000);
  }
}

// HACER DISPONIBLE PARA DEBUG
window.App = App;
// Efecto parallax suave para el hero
function setupHeroParallax() {
    const hero = document.querySelector('.hero');
    
    if (!hero) return;
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.3;
        
        hero.style.backgroundPosition = `50% ${rate}px`;
    });
    
    // Precargar imagen para evitar flicker
    const img = new Image();
    img.src = 'https://res.cloudinary.com/df2gprqhp/image/upload/v1765988412/CHEVROLET_yjwbxt.jpg';
    img.onload = () => {
        document.body.classList.add('hero-loaded');
    };
}

// Efecto de brillo al pasar mouse sobre indicadores
function setupIndicatorEffects() {
    const indicators = document.querySelectorAll('.indicator');
    
    indicators.forEach(indicator => {
        indicator.addEventListener('mouseenter', (e) => {
            const rect = indicator.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            indicator.style.setProperty('--mouse-x', `${x}px`);
            indicator.style.setProperty('--mouse-y', `${y}px`);
        });
        
        // Click para filtrar
        indicator.addEventListener('click', () => {
            const filter = indicator.dataset.filter;
            if (filter && window.productosManager) {
                window.productosManager.filtrarVehiculos(filter);
                
                // Scroll suave a vehículos
                const vehiclesSection = document.getElementById('vehicles');
                if (vehiclesSection) {
                    vehiclesSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// Inicializar en app.js
// En tu función setupBasicEvents() o init(), añade:
setupHeroParallax();
setupIndicatorEffects();
