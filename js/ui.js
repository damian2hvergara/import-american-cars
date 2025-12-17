import { CONFIG } from './config.js';
import { productosManager } from './productos.js';

export class UI {
  
  // ============================================
  // VARIABLES GLOBALES
  // ============================================
  static currentSlide = 0;
  static sliderInstance = null;
  
  // ============================================
  // INICIALIZACIÓN
  // ============================================
  
  static init() {
    console.log('🎨 Inicializando interfaz de usuario...');
    this.initEventListeners();
    this.initMobileMenu();
    this.initModalCloseEvents();
  }
  
  // ============================================
  // CONFIGURACIÓN DE EVENTOS
  // ============================================
  
  static initEventListeners() {
    console.log('🔗 Configurando eventos...');
    
    // FILTROS DE VEHÍCULOS
    document.querySelectorAll('.filter-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const filter = e.target.dataset.filter;
        if (filter) {
          console.log(`🔘 Filtro seleccionado: ${filter}`);
          productosManager.filtrarVehiculos(filter);
        }
      });
    });
    
    // INDICADORES DE STOCK (en la sección hero)
    document.querySelectorAll('.indicator').forEach(indicator => {
      indicator.addEventListener('click', (e) => {
        const filter = e.currentTarget.dataset.filter;
        if (filter) {
          console.log(`📊 Filtrando por: ${filter}`);
          productosManager.filtrarVehiculos(filter);
          window.scrollTo({ 
            top: document.getElementById('vehicles').offsetTop - 80, 
            behavior: 'smooth' 
          });
        }
      });
    });
    
    // BOTÓN PARA VER TODOS LOS KITS
    const showAllKitsBtn = document.getElementById('showAllKits');
    if (showAllKitsBtn) {
      showAllKitsBtn.addEventListener('click', () => {
        console.log('🛠️ Mostrando todos los kits...');
        this.showAllVehiclesForCustomization();
      });
    }
    
    console.log('✅ Eventos configurados correctamente');
  }
  
  static initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
      menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        console.log('📱 Menú móvil toggled');
      });
    }
  }
  
  static initModalCloseEvents() {
    // CERRAR MODAL DE VEHÍCULO
    const closeVehicleModalBtn = document.getElementById('closeVehicleModal');
    if (closeVehicleModalBtn) {
      closeVehicleModalBtn.addEventListener('click', () => {
        this.closeModal('vehicleModal');
      });
    }
    
    // CERRAR MODAL AL HACER CLICK FUERA
    document.addEventListener('click', (e) => {
      if (e.target === document.getElementById('vehicleModal')) {
        this.closeModal('vehicleModal');
      }
      if (e.target === document.getElementById('customizationModal')) {
        this.closeModal('customizationModal');
      }
    });
    
    // CERRAR CON TECLA ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal('vehicleModal');
        this.closeModal('customizationModal');
      }
    });
    
    // CERRAR MODAL DE PERSONALIZACIÓN
    const closeCustomizationModalBtn = document.getElementById('closeCustomizationModal');
    if (closeCustomizationModalBtn) {
      closeCustomizationModalBtn.addEventListener('click', () => {
        this.closeModal('customizationModal');
      });
    }
  }
  
  // ============================================
  // FUNCIONES DE INTERFAZ
  // ============================================
  
  static showLoading() {
    const container = document.getElementById('vehiclesContainer');
    if (container) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
          <div style="font-size: 32px; margin-bottom: 16px; color: #86868b;">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
          <p style="color: #86868b;">Cargando vehículos desde la base de datos...</p>
        </div>
      `;
    }
  }
  
  static hideLoading() {
    // Se maneja automáticamente
  }
  
  static showNotification(message, type = 'success') {
    const container = document.getElementById('notificationContainer');
    if (!container) {
      // Crear contenedor si no existe
      const newContainer = document.createElement('div');
      newContainer.id = 'notificationContainer';
      newContainer.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999;';
      document.body.appendChild(newContainer);
      container = newContainer;
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
      background: ${type === 'success' ? '#34C759' : type === 'error' ? '#FF3B30' : type === 'warning' ? '#FF9500' : '#007AFF'};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      margin-bottom: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideInRight 0.3s ease-out;
    `;
    
    const icons = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    };
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <i class="fas ${icons[type]}" style="font-size: 18px;"></i>
        <span style="flex: 1; font-size: 14px;">${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; cursor: pointer; padding: 0; margin-left: 8px;">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    
    container.appendChild(notification);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);
    
    console.log(`📢 Notificación: ${message} (${type})`);
  }
  
  static showError(message) {
    this.showNotification(message, 'error');
  }
  
  static showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
      console.error(`❌ Modal ${modalId} no encontrado`);
      return;
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    console.log(`📋 Modal ${modalId} abierto`);
  }
  
  static closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
    console.log(`📋 Modal ${modalId} cerrado`);
  }
  
  static updateCounter(elementId, count) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = count;
      console.log(`🔢 Contador ${elementId}: ${count}`);
    }
  }
  
  static updateFilterButtons(activeFilter) {
    document.querySelectorAll('.filter-button').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.filter === activeFilter) {
        btn.classList.add('active');
      }
    });
  }
  
  // ============================================
  // RENDERIZAR GRID DE VEHÍCULOS
  // ============================================
  
  static renderVehiculosGrid(vehiculos) {
    const container = document.getElementById('vehiclesContainer');
    if (!container) {
      console.error('❌ No se encontró el contenedor de vehículos');
      return;
    }
    
    console.log(`🎨 Renderizando ${vehiculos.length} vehículos...`);
    
    if (!vehiculos || vehiculos.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
          <div style="font-size: 48px; margin-bottom: 20px; color: #86868b;">
            <i class="fas fa-car"></i>
          </div>
          <h3 style="font-size: 21px; font-weight: 600; margin-bottom: 12px; color: var(--black);">
            No hay vehículos disponibles
          </h3>
          <p style="color: #86868b; margin-bottom: 20px;">
            No hay vehículos que coincidan con el filtro seleccionado.
          </p>
          <button class="button" data-filter="all" style="width: auto; padding: 10px 20px;">
            Ver todos los vehículos
          </button>
        </div>
      `;
      
      container.querySelector('.button[data-filter="all"]')?.addEventListener('click', (e) => {
        productosManager.filtrarVehiculos('all');
      });
      
      return;
    }
    
    container.innerHTML = vehiculos.map(vehiculo => {
      const primeraImagen = vehiculo.imagenes && vehiculo.imagenes.length > 0 
        ? vehiculo.imagenes[0] 
        : CONFIG.app.defaultImage;
      
      const totalImagenes = vehiculo.imagenes?.length || 0;
      
      return `
        <div class="vehicle-card fade-in" data-id="${vehiculo.id}">
          <div style="position: relative; height: 200px; overflow: hidden; border-radius: 12px 12px 0 0;">
            <img src="${primeraImagen}" 
                 alt="${vehiculo.nombre}" 
                 class="vehicle-image"
                 onerror="this.src='${CONFIG.app.defaultImage}'"
                 loading="lazy"
                 style="width: 100%; height: 100%; object-fit: cover;">
            
            ${totalImagenes > 1 && CONFIG.app.mostrarPuntosImagenes ? `
              <div style="position: absolute; bottom: 12px; left: 0; right: 0; display: flex; justify-content: center; gap: 6px; z-index: 2;">
                ${Array.from({length: Math.min(totalImagenes, 8)}).map((_, i) => `
                  <div style="width: 6px; height: 6px; border-radius: 50%; background: ${i === 0 ? 'white' : 'rgba(255,255,255,0.3)'}; transition: background 0.3s;"></div>
                `).join('')}
              </div>
            ` : ''}
            
            <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 60px; background: linear-gradient(to top, rgba(0,0,0,0.3), transparent);"></div>
            
            <div style="position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 500;">
              ${totalImagenes} ${totalImagenes === 1 ? 'imagen' : 'imágenes'}
            </div>
          </div>
          
          <div class="vehicle-info">
            <div class="vehicle-status">
              ${vehiculo.estado === 'stock' ? 'En Stock Arica' : 
                vehiculo.estado === 'transit' ? 'En Tránsito' : 
                'Para Reservar'}
            </div>
            <h3 class="vehicle-title">${vehiculo.nombre || 'Vehículo sin nombre'}</h3>
            <div class="vehicle-price">${productosManager.formatPrice(vehiculo.precio)}</div>
            <p style="color: #86868b; font-size: 14px; margin-bottom: 16px; min-height: 60px; line-height: 1.4;">
              ${vehiculo.descripcion ? (vehiculo.descripcion.substring(0, 100) + (vehiculo.descripcion.length > 100 ? '...' : '')) : 'Sin descripción disponible.'}
            </p>
            <div style="display: flex; gap: 8px;">
              <button class="button" data-action="consultar" data-id="${vehiculo.id}" style="flex: 1;">
                <i class="fab fa-whatsapp"></i> Consultar
              </button>
              <button class="button button-outline" data-action="verDetalles" data-id="${vehiculo.id}" style="flex: 1;">
                <i class="fas fa-eye"></i> Ver Detalles
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    // ASIGNAR EVENTOS A LAS TARJETAS
    console.log('🔗 Asignando eventos a tarjetas...');
    
    // Botón "Consultar" (WhatsApp)
    container.querySelectorAll('button[data-action="consultar"]').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = button.dataset.id;
        console.log(`💬 Consultando vehículo: ${id}`);
        this.contactVehicle(id);
      });
    });
    
    // Botón "Ver Detalles"
    container.querySelectorAll('button[data-action="verDetalles"]').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = button.dataset.id;
        console.log(`📄 Abriendo detalles del vehículo: ${id}`);
        this.showVehicleDetails(id);
      });
    });
    
    // Click en toda la tarjeta (excepto botones)
    container.querySelectorAll('.vehicle-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
          const id = card.dataset.id;
          console.log(`📄 Click en tarjeta, abriendo detalles: ${id}`);
          this.showVehicleDetails(id);
        }
      });
    });
    
    console.log('✅ Grid de vehículos renderizado');
  }
  
  // ============================================
  // MODAL DE DETALLES DEL VEHÍCULO
  // ============================================
  
  static showVehicleDetails(vehicleId) {
    console.log(`🔍 Mostrando detalles del vehículo ${vehicleId}...`);
    
    const vehiculo = productosManager.getVehiculoById(vehicleId);
    if (!vehiculo) {
      this.showError("Vehículo no encontrado");
      return;
    }
    
    const modalContent = document.getElementById('vehicleModalContent');
    
    // Asegurar imágenes (6-8 máximo)
    const imagenes = vehiculo.imagenes && vehiculo.imagenes.length > 0 
      ? vehiculo.imagenes.slice(0, CONFIG.app.maxImagenesVehículo || 8)
      : [CONFIG.app.defaultImage];
    
    const totalImagenes = imagenes.length;
    
    // HTML del modal con SLIDER
    modalContent.innerHTML = `
      <div class="vehicle-details">
        <!-- SLIDER DE IMÁGENES -->
        <div class="slider-container" id="vehicleImageSlider">
          <div class="slider-wrapper">
            ${imagenes.map((url, index) => `
              <div class="slider-slide" data-index="${index}">
                <img src="${url}" 
                     alt="Imagen ${index + 1} de ${vehiculo.nombre}" 
                     loading="lazy" 
                     onerror="this.src='${CONFIG.app.defaultImage}'"
                     style="width: 100%; height: 400px; object-fit: contain; padding: 20px;">
              </div>
            `).join('')}
          </div>
          
          ${totalImagenes > 1 ? `
            <!-- BOTONES DE NAVEGACIÓN -->
            <button class="slider-button-prev" onclick="UI.sliderPrev()">
              <i class="fas fa-chevron-left"></i>
            </button>
            <button class="slider-button-next" onclick="UI.sliderNext()">
              <i class="fas fa-chevron-right"></i>
            </button>
            
            <!-- CONTADOR DE IMÁGENES -->
            <div style="position: absolute; top: 16px; right: 16px; background: rgba(0,0,0,0.7); color: white; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; z-index: 10;">
              <span id="currentImageIndex">1</span> / ${totalImagenes}
            </div>
            
            <!-- PUNTOS DE NAVEGACIÓN -->
            <div class="slider-dots">
              ${imagenes.map((_, index) => `
                <button class="slider-dot ${index === 0 ? 'active' : ''}" 
                        onclick="UI.goToSlide(${index})"
                        data-index="${index}"></button>
              `).join('')}
            </div>
          ` : ''}
        </div>
        
        <!-- CONTENIDO DEL VEHÍCULO -->
        <div class="details-content">
          <div class="vehicle-status">
            ${vehiculo.estado === 'stock' ? 'En Stock Arica' : 
              vehiculo.estado === 'transit' ? 'En Tránsito' : 
              'Para Reservar'}
          </div>
          
          <h2 class="detail-title">${vehiculo.nombre || 'Vehículo'}</h2>
          <div class="detail-price">${productosManager.formatPrice(vehiculo.precio)}</div>
          
          <p class="detail-description">${vehiculo.descripcion || 'Sin descripción disponible.'}</p>
          
          <!-- ESPECIFICACIONES TÉCNICAS -->
          <div class="detail-features">
            ${vehiculo.ano ? `<div><i class="fas fa-calendar"></i> <strong>Año:</strong> ${vehiculo.ano}</div>` : ''}
            ${vehiculo.color ? `<div><i class="fas fa-palette"></i> <strong>Color:</strong> ${vehiculo.color}</div>` : ''}
            ${vehiculo.motor ? `<div><i class="fas fa-cogs"></i> <strong>Motor:</strong> ${vehiculo.motor}</div>` : ''}
            ${vehiculo.kilometraje ? `<div><i class="fas fa-road"></i> <strong>Kilometraje:</strong> ${vehiculo.kilometraje.toLocaleString()} km</div>` : ''}
            ${vehiculo.transmision ? `<div><i class="fas fa-exchange-alt"></i> <strong>Transmisión:</strong> ${vehiculo.transmision}</div>` : ''}
            ${vehiculo.combustible ? `<div><i class="fas fa-gas-pump"></i> <strong>Combustible:</strong> ${vehiculo.combustible}</div>` : ''}
            ${vehiculo.marca ? `<div><i class="fas fa-tag"></i> <strong>Marca:</strong> ${vehiculo.marca}</div>` : ''}
            ${vehiculo.modelo ? `<div><i class="fas fa-car"></i> <strong>Modelo:</strong> ${vehiculo.modelo}</div>` : ''}
          </div>
          
          <!-- MINIATURAS DE IMÁGENES -->
          ${totalImagenes > 1 ? `
            <div style="margin: 32px 0; padding: 20px; background: var(--gray-50); border-radius: var(--radius); border: var(--border);">
              <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 12px; color: var(--black);">
                <i class="fas fa-images"></i> Galería de Imágenes (${totalImagenes})
              </h4>
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 10px; margin-top: 16px;">
                ${imagenes.map((url, index) => `
                  <img src="${url}" 
                       alt="Miniatura ${index + 1}" 
                       style="width: 100%; height: 80px; object-fit: cover; border-radius: 8px; cursor: pointer; border: 2px solid ${index === 0 ? 'var(--black)' : 'transparent'}; transition: border 0.3s;"
                       onclick="UI.goToSlide(${index})"
                       onerror="this.src='${CONFIG.app.defaultImage}'"
                       class="thumbnail-image"
                       data-index="${index}">
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          <!-- BOTONES DE ACCIÓN -->
          <div class="modal-actions">
            <button class="button" onclick="UI.contactVehicle('${vehicleId}')" style="flex: 1;"> 
              <i class="fab fa-whatsapp"></i> Consultar por WhatsApp 
            </button>
            <button class="button button-outline" onclick="UI.customizeVehicle('${vehicleId}')" style="flex: 1;"> 
              <i class="fas fa-crown"></i> Personalizar con Kits 
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Inicializar slider
    this.initSlider(totalImagenes);
    
    // Mostrar modal
    this.showModal('vehicleModal');
    
    console.log(`✅ Modal de detalles mostrado para: ${vehiculo.nombre}`);
  }
  
  // ============================================
  // FUNCIONES DEL SLIDER
  // ============================================
  
  static initSlider(totalSlides) {
    this.currentSlide = 0;
    this.totalSlides = totalSlides;
    this.updateSlider();
  }
  
  static sliderPrev() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
      this.updateSlider();
    }
  }
  
  static sliderNext() {
    if (this.currentSlide < this.totalSlides - 1) {
      this.currentSlide++;
      this.updateSlider();
    }
  }
  
  static goToSlide(index) {
    if (index >= 0 && index < this.totalSlides) {
      this.currentSlide = index;
      this.updateSlider();
    }
  }
  
  static updateSlider() {
    const slider = document.getElementById('vehicleImageSlider');
    if (!slider) return;
    
    const wrapper = slider.querySelector('.slider-wrapper');
    const dots = slider.querySelectorAll('.slider-dot');
    const thumbnails = document.querySelectorAll('.thumbnail-image');
    const currentIndexElement = document.getElementById('currentImageIndex');
    
    // Mover el slider
    if (wrapper) {
      wrapper.style.transform = `translateX(-${this.currentSlide * 100}%)`;
    }
    
    // Actualizar contador
    if (currentIndexElement) {
      currentIndexElement.textContent = this.currentSlide + 1;
    }
    
    // Actualizar puntos activos
    dots.forEach((dot, index) => {
      if (dot) {
        dot.classList.toggle('active', index === this.currentSlide);
      }
    });
    
    // Actualizar bordes de miniaturas
    thumbnails.forEach((thumb, index) => {
      if (thumb) {
        thumb.style.borderColor = index === this.currentSlide ? 'var(--black)' : 'transparent';
      }
    });
    
    // Actualizar estado de botones de navegación
    const prevBtn = slider.querySelector('.slider-button-prev');
    const nextBtn = slider.querySelector('.slider-button-next');
    
    if (prevBtn) {
      prevBtn.disabled = this.currentSlide === 0;
      prevBtn.style.opacity = this.currentSlide === 0 ? '0.3' : '1';
      prevBtn.style.cursor = this.currentSlide === 0 ? 'not-allowed' : 'pointer';
    }
    
    if (nextBtn) {
      nextBtn.disabled = this.currentSlide === this.totalSlides - 1;
      nextBtn.style.opacity = this.currentSlide === this.totalSlides - 1 ? '0.3' : '1';
      nextBtn.style.cursor = this.currentSlide === this.totalSlides - 1 ? 'not-allowed' : 'pointer';
    }
  }
  
  // ============================================
  // PERSONALIZACIÓN DE VEHÍCULOS (KITS)
  // ============================================
  
  static customizeVehicle(vehicleId) {
    const vehiculo = productosManager.getVehiculoById(vehicleId);
    if (!vehiculo) {
      this.showError("Vehículo no encontrado");
      return;
    }
    
    // Cerrar modal de detalles
    this.closeModal('vehicleModal');
    
    // Obtener kits del vehículo
    const kits = vehiculo.kits || [];
    
    const modalContent = document.getElementById('customizationContent');
    
    modalContent.innerHTML = `
      <div class="customization-container">
        <div style="padding: 32px; background: var(--gray-50); text-align: center;">
          <h3 style="font-size: 24px; font-weight: 700; margin-bottom: 8px; color: var(--black);">
            Personalizar ${vehiculo.nombre}
          </h3>
          <p style="color: #86868b; margin-bottom: 20px;">
            Selecciona un kit de upgrade para ver los detalles y precios específicos
          </p>
        </div>
        
        <div style="padding: 32px;">
          <h4 style="font-size: 18px; font-weight: 600; margin-bottom: 24px; color: var(--black);">
            <i class="fas fa-crown"></i> Kits de Upgrade Disponibles
          </h4>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
            ${kits.map(kit => {
              const badgeColor = kit.nivel === 'full' ? 'var(--gold)' : 
                               kit.nivel === 'medium' ? 'var(--silver)' : 'var(--bronze)';
              const textColor = kit.nivel === 'full' ? 'black' : 'white';
              const icon = kit.nivel === 'full' ? 'fa-crown' : 
                          kit.nivel === 'medium' ? 'fa-medal' : 'fa-star';
              
              return `
                <div style="border: var(--border); border-radius: var(--radius); padding: 24px; text-align: center; background: white;">
                  <div style="width: 60px; height: 60px; background: ${badgeColor}; border-radius: 30px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: ${textColor};">
                    <i class="fas ${icon}" style="font-size: 24px;"></i>
                  </div>
                  <h5 style="font-size: 18px; font-weight: 600; margin-bottom: 8px; color: var(--black);">
                    ${kit.nombre}
                  </h5>
                  <div style="font-size: 20px; font-weight: 700; margin-bottom: 12px; color: ${badgeColor};">
                    ${kit.precio > 0 ? `+${productosManager.formatPrice(kit.precio)}` : '<span style="color: var(--success);">INCLUIDO</span>'}
                  </div>
                  <p style="color: #86868b; font-size: 14px; margin-bottom: 20px; min-height: 60px;">
                    ${kit.descripcion}
                  </p>
                  
                  <div style="text-align: left; margin-bottom: 20px;">
                    <div style="font-size: 14px; font-weight: 600; margin-bottom: 12px; color: var(--black);">
                      <i class="fas fa-check-circle" style="color: var(--success); margin-right: 8px;"></i>
                      Este kit incluye:
                    </div>
                    <div style="font-size: 13px; color: #86868b;">
                      ${kit.includes.map(item => `
                        <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px;">
                          <div style="color: var(--success); font-size: 12px; margin-top: 2px;">
                            <i class="fas fa-check"></i>
                          </div>
                          <div>${item}</div>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                  
                  <button class="button" onclick="UI.selectKitAndContact('${vehicleId}', '${kit.id}')" style="width: 100%;">
                    <i class="fab fa-whatsapp"></i> Cotizar este Kit
                  </button>
                </div>
              `;
            }).join('')}
          </div>
          
          <div style="margin-top: 32px; padding: 24px; background: var(--gray-50); border-radius: var(--radius); border: var(--border);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <div style="font-size: 17px; font-weight: 600;">Vehículo base</div>
              <div style="font-size: 24px; font-weight: 700;">${productosManager.formatPrice(vehiculo.precio)}</div>
            </div>
            <p style="color: #86868b; font-size: 14px; text-align: center; margin-top: 16px;">
              Selecciona un kit para ver el precio total
            </p>
          </div>
        </div>
      </div>
    `;
    
    this.showModal('customizationModal');
    console.log(`🎨 Modal de personalización mostrado para: ${vehiculo.nombre}`);
  }
  
  static selectKitAndContact(vehicleId, kitId) {
    const vehiculo = productosManager.getVehiculoById(vehicleId);
    if (!vehiculo) return;
    
    const kits = vehiculo.kits || [];
    const kit = kits.find(k => k.id === kitId);
    if (!kit) return;
    
    // Cerrar modal
    this.closeModal('customizationModal');
    
    // Contactar por WhatsApp con el kit seleccionado
    this.contactVehicle(vehicleId, kit);
  }
  
  // ============================================
  // CONTACTO WHATSAPP
  // ============================================
  
  static contactVehicle(vehicleId, kit = null) {
    const vehiculo = productosManager.getVehiculoById(vehicleId);
    if (!vehiculo) {
      this.showError("Vehículo no encontrado");
      return;
    }
    
    const whatsappUrl = productosManager.getWhatsAppUrl(vehiculo, kit);
    console.log(`📱 Abriendo WhatsApp para: ${vehiculo.nombre}`);
    window.open(whatsappUrl, '_blank');
  }
  
  // ============================================
  // MOSTRAR TODOS LOS VEHÍCULOS PARA PERSONALIZACIÓN
  // ============================================
  
  static showAllVehiclesForCustomization() {
    const vehiculos = productosManager.vehiculos;
    if (!vehiculos || vehiculos.length === 0) {
      this.showError("Primero carga los vehículos");
      return;
    }
    
    const modalContent = document.getElementById('customizationContent');
    
    modalContent.innerHTML = `
      <div class="customization-container">
        <div style="padding: 32px; background: var(--gray-50); text-align: center;">
          <h3 style="font-size: 24px; font-weight: 700; margin-bottom: 12px; color: var(--black);">
            <i class="fas fa-crown"></i> Kits Upgrade Personalizados
          </h3>
          <p style="color: #86868b; max-width: 500px; margin: 0 auto;">
            Cada vehículo tiene kits de upgrade con precios específicos según modelo
          </p>
        </div>
        
        <div style="padding: 32px;">
          <h4 style="font-size: 18px; font-weight: 600; margin-bottom: 24px; color: var(--black);">
            Selecciona un Vehículo para Personalizar
          </h4>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; max-height: 400px; overflow-y: auto; padding-right: 8px;">
            ${vehiculos.map(vehicle => `
              <div onclick="UI.customizeVehicle('${vehicle.id}')" 
                   style="cursor: pointer; border: var(--border); border-radius: var(--radius); padding: 20px; transition: all 0.3s; background: var(--white);" 
                   onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='var(--shadow)';" 
                   onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                <img src="${vehicle.imagenes?.[0] || CONFIG.app.defaultImage}" 
                     style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px; margin-bottom: 16px;"
                     onerror="this.src='${CONFIG.app.defaultImage}'">
                <div style="font-weight: 600; margin-bottom: 8px; font-size: 16px; color: var(--black);">${vehicle.nombre}</div>
                <div style="font-size: 13px; color: #86868b; margin-bottom: 12px;">
                  ${vehicle.descripcion ? (vehicle.descripcion.substring(0, 80) + (vehicle.descripcion.length > 80 ? '...' : '')) : 'Sin descripción'}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div style="font-size: 18px; font-weight: 700;">${productosManager.formatPrice(vehicle.precio)}</div>
                  <div class="vehicle-status" style="font-size: 11px; padding: 4px 8px;">
                    ${vehicle.estado === 'stock' ? 'En Stock' : 
                      vehicle.estado === 'transit' ? 'En Tránsito' : 
                      'Reserva'}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    
    this.showModal('customizationModal');
  }
}

// ============================================
// HACER FUNCIONES DISPONIBLES GLOBALMENTE
// ============================================

window.UI = UI;
window.UI.sliderPrev = () => UI.sliderPrev();
window.UI.sliderNext = () => UI.sliderNext();
window.UI.goToSlide = (index) => UI.goToSlide(index);
window.UI.contactVehicle = (id, kit) => UI.contactVehicle(id, kit);
window.UI.customizeVehicle = (id) => UI.customizeVehicle(id);
window.UI.selectKitAndContact = (vehicleId, kitId) => UI.selectKitAndContact(vehicleId, kitId);
