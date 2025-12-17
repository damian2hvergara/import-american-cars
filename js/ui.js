[file name]: ui.js
[file content begin]
import { CONFIG } from './config.js';
import { productosManager } from './productos.js';

// Gestión de la interfaz de usuario
export class UI {
  // Inicializar eventos
  static init() {
    this.initEventListeners();
    this.initMobileMenu();
  }
  
  // Inicializar event listeners
  static initEventListeners() {
    // Filtros
    document.querySelectorAll('.filter-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const filter = e.target.dataset.filter;
        if (filter) {
          productosManager.filtrarVehiculos(filter);
        }
      });
    });
    
    // Indicadores de stock
    document.querySelectorAll('.indicator').forEach(indicator => {
      indicator.addEventListener('click', (e) => {
        const filter = e.currentTarget.dataset.filter;
        if (filter) {
          productosManager.filtrarVehiculos(filter);
          window.scrollTo({ top: document.getElementById('vehicles').offsetTop - 80, behavior: 'smooth' });
        }
      });
    });
    
    // Botón ver todos los kits
    document.getElementById('showAllKits')?.addEventListener('click', () => {
      this.showAllVehiclesForCustomization();
    });
    
    // Cerrar modales
    document.getElementById('closeVehicleModal')?.addEventListener('click', () => {
      this.closeModal('vehicleModal');
    });
    
    document.getElementById('closeCustomizationModal')?.addEventListener('click', () => {
      this.closeModal('customizationModal');
    });
    
    // Cerrar al hacer click fuera
    document.addEventListener('click', (e) => {
      if (e.target === document.getElementById('vehicleModal') || 
          e.target === document.getElementById('customizationModal')) {
        this.closeModal(e.target.id);
      }
    });
    
    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal('vehicleModal');
        this.closeModal('customizationModal');
      }
    });
  }
  
  // Menú móvil
  static initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.querySelector('.nav-links');
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu';
    mobileMenu.id = 'mobileMenu';
    mobileMenu.innerHTML = `
      <a href="#vehicles">Vehículos</a>
      <a href="#customize">Kits Upgrade</a>
      <a href="#instagram">Instagram</a>
      <a href="#contact">Contacto</a>
    `;
    
    document.body.appendChild(mobileMenu);
    
    menuToggle?.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
    });
    
    // Cerrar menú al hacer click en un link
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
      });
    });
  }
  
  // Mostrar loading
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
  
  // Ocultar loading
  static hideLoading() {
    // Se maneja en renderVehiculosGrid
  }
  
  // Mostrar notificación
  static showNotification(message, type = 'success') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const colors = {
      success: 'var(--success)',
      error: 'var(--error)',
      warning: 'var(--warning)',
      info: 'var(--blue)'
    };
    
    const icons = {
      success: '✓',
      error: '✗',
      warning: '⚠',
      info: 'ℹ'
    };
    
    notification.innerHTML = `
      <div style="font-size: 20px; color: ${colors[type]};">
        ${icons[type]}
      </div>
      <div style="flex: 1;">
        <div style="font-weight: 500; font-size: 14px; margin-bottom: 4px; color: var(--black);">
          ${type === 'success' ? 'Éxito' : type === 'error' ? 'Error' : type === 'warning' ? 'Advertencia' : 'Información'}
        </div>
        <div style="font-size: 13px; color: #86868b;">${message}</div>
      </div>
      <button onclick="this.parentElement.remove()" style="background: none; border: none; color: #86868b; cursor: pointer; padding: 0;">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    container.appendChild(notification);
    
    // Cerrar al hacer click en el botón
    notification.querySelector('button').addEventListener('click', function() {
      this.parentElement.remove();
    });
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }
  
  // Mostrar mensaje de error
  static showError(message) {
    this.showNotification(message, 'error');
  }
  
  // Mostrar modal
  static showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  // Cerrar modal
  static closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  // Actualizar contador
  static updateCounter(elementId, count) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = count;
    }
  }
  
  // Actualizar botones de filtro
  static updateFilterButtons(activeFilter) {
    document.querySelectorAll('.filter-button').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.filter === activeFilter) {
        btn.classList.add('active');
      }
    });
  }
  
  // Renderizar grid de vehículos
  static renderVehiculosGrid(vehiculos) {
    const container = document.getElementById('vehiclesContainer');
    if (!container) return;
    
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
      
      // Re-asignar evento al botón
      container.querySelector('.button[data-filter="all"]')?.addEventListener('click', (e) => {
        productosManager.filtrarVehiculos('all');
      });
      
      return;
    }
    
    container.innerHTML = vehiculos.map(vehiculo => {
      // Asegurar que haya al menos una imagen
      const primeraImagen = vehiculo.imagenes && vehiculo.imagenes.length > 0 
        ? vehiculo.imagenes[0] 
        : CONFIG.app.defaultImage;
      
      return `
        <div class="vehicle-card fade-in" data-id="${vehiculo.id}">
          <div style="position: relative;">
            <img src="${primeraImagen}" 
                 alt="${vehiculo.nombre}" 
                 class="vehicle-image"
                 onerror="this.src='${CONFIG.app.defaultImage}'"
                 loading="lazy">
            ${vehiculo.imagenes && vehiculo.imagenes.length > 1 && CONFIG.app.mostrarPuntosImagenes ? `
              <div style="position: absolute; bottom: 12px; left: 0; right: 0; display: flex; justify-content: center; gap: 6px;">
                ${Array.from({length: Math.min(vehiculo.imagenes.length, 8)}).map((_, i) => `
                  <div style="width: 6px; height: 6px; border-radius: 50%; background: ${i === 0 ? 'white' : 'rgba(255,255,255,0.3)'};"></div>
                `).join('')}
              </div>
            ` : ''}
          </div>
          <div class="vehicle-info">
            <div class="vehicle-status">
              ${vehiculo.estado === 'stock' ? 'En Stock Arica' : 
                vehiculo.estado === 'transit' ? 'En Tránsito' : 
                'Para Reservar'}
            </div>
            <h3 class="vehicle-title">${vehiculo.nombre || 'Vehículo sin nombre'}</h3>
            <div class="vehicle-price">${productosManager.formatPrice(vehiculo.precio)}</div>
            <p style="color: #86868b; font-size: 14px; margin-bottom: 16px;">
              ${vehiculo.descripcion ? (vehiculo.descripcion.substring(0, 80) + (vehiculo.descripcion.length > 80 ? '...' : '')) : 'Sin descripción disponible.'}
            </p>
            <div style="display: flex; gap: 8px;">
              <button class="button" data-action="consultar" data-id="${vehiculo.id}" style="flex: 1;">
                <i class="fab fa-whatsapp"></i> Consultar
              </button>
              <button class="button button-outline" data-action="kits" data-id="${vehiculo.id}" style="flex: 1;">
                <i class="fas fa-crown"></i> Personalizar
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    // Asignar eventos a las tarjetas y botones
    container.querySelectorAll('.vehicle-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
          const id = card.dataset.id;
          this.showVehicleDetails(id);
        }
      });
    });
    
    container.querySelectorAll('button[data-action="consultar"]').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = button.dataset.id;
        this.contactVehicle(id);
      });
    });
    
    container.querySelectorAll('button[data-action="kits"]').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = button.dataset.id;
        this.customizeVehicle(id);
      });
    });
  }
  
  // ============================================
  // NUEVO SLIDER CON PUNTOS DE IMÁGENES
  // ============================================
  
  static initImageSlider(sliderElement, images, vehiculoNombre) {
    if (!sliderElement || !images || images.length === 0) {
      console.error('❌ No hay imágenes para el slider');
      return;
    }
    
    const wrapper = sliderElement.querySelector('.slider-wrapper');
    const prevButton = sliderElement.querySelector('.slider-button-prev');
    const nextButton = sliderElement.querySelector('.slider-button-next');
    const dotsContainer = sliderElement.querySelector('.slider-dots');
    
    if (!wrapper || !prevButton || !nextButton) {
      console.error('❌ Elementos del slider no encontrados');
      return;
    }
    
    const totalSlides = Math.min(images.length, CONFIG.app.maxImagenesVehículo || 8);
    let currentSlide = 0;
    
    // Crear estructura completa del slider
    sliderElement.innerHTML = `
      <div class="slider-wrapper">
        ${images.slice(0, totalSlides).map((url, index) => `
          <div class="slider-slide" data-index="${index}">
            <img src="${url}" 
                 alt="Imagen ${index + 1} de ${vehiculoNombre}" 
                 loading="lazy" 
                 onerror="this.src='${CONFIG.app.defaultImage}'
                 this.onerror=null">
          </div>
        `).join('')}
      </div>
      <button class="slider-button-prev"><i class="fas fa-chevron-left"></i></button>
      <button class="slider-button-next"><i class="fas fa-chevron-right"></i></button>
      ${CONFIG.app.mostrarPuntosImagenes ? `
        <div class="slider-dots">
          ${Array.from({length: totalSlides}).map((_, index) => `
            <button class="slider-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></button>
          `).join('')}
        </div>
      ` : ''}
    `;
    
    // Re-asignar referencias después de re-render
    const newWrapper = sliderElement.querySelector('.slider-wrapper');
    const newPrevButton = sliderElement.querySelector('.slider-button-prev');
    const newNextButton = sliderElement.querySelector('.slider-button-next');
    const newDotsContainer = sliderElement.querySelector('.slider-dots');
    
    // Mostrar/ocultar botones si solo hay una imagen
    if (totalSlides <= 1) {
      newPrevButton.style.display = 'none';
      newNextButton.style.display = 'none';
      if (newDotsContainer) newDotsContainer.style.display = 'none';
    } else {
      newPrevButton.style.display = 'flex';
      newNextButton.style.display = 'flex';
      if (newDotsContainer) newDotsContainer.style.display = 'flex';
    }
    
    const updateSlider = () => {
      newWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
      
      // Actualizar puntos
      if (newDotsContainer) {
        newDotsContainer.querySelectorAll('.slider-dot').forEach((dot, index) => {
          dot.classList.toggle('active', index === currentSlide);
        });
      }
      
      // Actualizar estado de botones
      newPrevButton.disabled = currentSlide === 0;
      newNextButton.disabled = currentSlide === totalSlides - 1;
    };
    
    newNextButton.onclick = () => {
      if (currentSlide < totalSlides - 1) {
        currentSlide++;
        updateSlider();
      }
    };
    
    newPrevButton.onclick = () => {
      if (currentSlide > 0) {
        currentSlide--;
        updateSlider();
      }
    };
    
    // Navegación por puntos
    if (newDotsContainer) {
      newDotsContainer.querySelectorAll('.slider-dot').forEach(dot => {
        dot.addEventListener('click', (e) => {
          const index = parseInt(e.target.dataset.index);
          if (!isNaN(index) && index >= 0 && index < totalSlides) {
            currentSlide = index;
            updateSlider();
          }
        });
      });
    }
    
    updateSlider();
  }
  
  // ============================================
  // DETALLES DEL VEHÍCULO CON 6-8 IMÁGENES
  // ============================================
  
  static showVehicleDetails(vehicleId) {
    const vehiculo = productosManager.getVehiculoById(vehicleId);
    if (!vehiculo) {
      this.showNotification("Vehículo no encontrado", "error");
      return;
    }
    
    const modalContent = document.getElementById('vehicleModalContent');
    
    // Asegurar que haya imágenes (6-8 máximo)
    const imagenes = vehiculo.imagenes && vehiculo.imagenes.length > 0 
      ? vehiculo.imagenes.slice(0, CONFIG.app.maxImagenesVehículo || 8)
      : [CONFIG.app.defaultImage];
    
    // Inyectar el HTML del modal con el nuevo slider
    modalContent.innerHTML = `
      <div class="vehicle-details">
        <div class="image-gallery-container">
          <div id="vehicleImageSlider" class="slider-container">
            <!-- El slider se generará dinámicamente -->
          </div>
        </div>
        
        <div class="details-content">
          <div class="vehicle-status">
            ${vehiculo.estado === 'stock' ? 'En Stock Arica' : 
              vehiculo.estado === 'transit' ? 'En Tránsito' : 
              'Para Reservar'}
          </div>
          <h2 class="detail-title">${vehiculo.nombre || 'Vehículo'}</h2>
          <div class="detail-price">${productosManager.formatPrice(vehiculo.precio)}</div>
          <p class="detail-description">${vehiculo.descripcion || 'Sin descripción disponible.'}</p>
          
          <div class="detail-features">
            ${vehiculo.ano ? `<div><i class="fas fa-calendar"></i> Año: ${vehiculo.ano}</div>` : ''}
            ${vehiculo.color ? `<div><i class="fas fa-palette"></i> Color: ${vehiculo.color}</div>` : ''}
            ${vehiculo.motor ? `<div><i class="fas fa-cogs"></i> Motor: ${vehiculo.motor}</div>` : ''}
            ${vehiculo.kilometraje ? `<div><i class="fas fa-road"></i> Kilometraje: ${vehiculo.kilometraje.toLocaleString()} km</div>` : ''}
            ${vehiculo.transmision ? `<div><i class="fas fa-exchange-alt"></i> Transmisión: ${vehiculo.transmision}</div>` : ''}
            ${vehiculo.combustible ? `<div><i class="fas fa-gas-pump"></i> Combustible: ${vehiculo.combustible}</div>` : ''}
            ${vehiculo.marca ? `<div><i class="fas fa-tag"></i> Marca: ${vehiculo.marca}</div>` : ''}
            ${vehiculo.modelo ? `<div><i class="fas fa-car"></i> Modelo: ${vehiculo.modelo}</div>` : ''}
          </div>
          
          <div style="margin: 32px 0; padding: 20px; background: var(--gray-50); border-radius: var(--radius); border: var(--border);">
            <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 12px; color: var(--black);">
              <i class="fas fa-images"></i> Galería de Imágenes
            </h4>
            <p style="color: #86868b; font-size: 14px; margin-bottom: 16px;">
              ${imagenes.length} ${imagenes.length === 1 ? 'imagen' : 'imágenes'} disponible${imagenes.length === 1 ? '' : 's'}
            </p>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
              ${imagenes.slice(0, 4).map((url, index) => `
                <img src="${url}" 
                     alt="Imagen ${index + 1}" 
                     style="width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 8px; cursor: pointer;"
                     onclick="document.querySelectorAll('.slider-dot')[${index}].click()"
                     onerror="this.src='${CONFIG.app.defaultImage}'">
              `).join('')}
            </div>
          </div>

          <div class="modal-actions">
            <button class="button" id="whatsappFromModal" data-id="${vehicleId}" style="flex: 1;"> 
              <i class="fab fa-whatsapp"></i> Reservar Ahora 
            </button>
            <button class="button button-outline" id="customizeBtn" data-id="${vehicleId}" style="flex: 1;"> 
              <i class="fas fa-crown"></i> Personalizar con Kits 
            </button>
          </div>
        </div>
      </div>
    `;

    // Inicializar el Slider con el array de imágenes
    const sliderElement = document.getElementById('vehicleImageSlider');
    this.initImageSlider(sliderElement, imagenes, vehiculo.nombre || 'Vehículo');
    
    // Asignar eventos dentro del modal
    document.getElementById('whatsappFromModal')?.addEventListener('click', (e) => {
      this.contactVehicle(e.currentTarget.dataset.id);
    });
    
    document.getElementById('customizeBtn')?.addEventListener('click', (e) => {
      this.closeModal('vehicleModal');
      this.customizeVehicle(e.currentTarget.dataset.id);
    });
    
    this.showModal('vehicleModal');
  }
  
  // ============================================
  // NUEVO SISTEMA DE COMPARACIÓN CON KITS
  // ============================================
  
  static async customizeVehicle(vehicleId) {
    const vehiculo = productosManager.getVehiculoById(vehicleId);
    if (!vehiculo) {
      this.showNotification("Vehículo no encontrado", "error");
      return;
    }
    
    const kits = vehiculo.kits || [];
    if (kits.length === 0) {
      this.showNotification("No hay kits de mejora disponibles para este vehículo", "warning");
      return;
    }
    
    const modalContent = document.getElementById('customizationContent');
    
    // Kit inicial (Standard)
    const kitInicial = kits.find(k => k.nivel === 'standar') || kits[0];
    
    modalContent.innerHTML = `
      <div class="customization-container">
        <!-- COMPARADOR VISUAL MEJORADO -->
        <div style="padding: 32px; background: var(--gray-50);">
          <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 20px; text-align: center; color: var(--black);">
            <i class="fas fa-exchange-alt"></i> Comparador Visual
          </h3>
          <div style="display: grid; grid-template-columns: 1fr; gap: 24px; max-width: 800px; margin: 0 auto;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px;">
              <div style="flex: 1; text-align: center;">
                <div style="font-size: 14px; color: #86868b; margin-bottom: 8px; font-weight: 500;">Original</div>
                <div id="originalImageContainer" style="width: 100%; height: 250px; background: var(--white); border-radius: var(--radius); border: var(--border); display: flex; align-items: center; justify-content: center;">
                  <img src="${vehiculo.imagenes?.[0] || CONFIG.app.defaultImage}" 
                       alt="Vehículo Original" 
                       style="max-width: 100%; max-height: 100%; object-fit: contain; padding: 16px;"
                       onerror="this.src='${CONFIG.app.defaultImage}'"
                       id="originalImage">
                </div>
              </div>
              
              <div style="width: 60px; text-align: center;">
                <div style="font-size: 24px; color: #86868b; margin: 40px 0;">
                  <i class="fas fa-arrow-right"></i>
                </div>
              </div>
              
              <div style="flex: 1; text-align: center;">
                <div style="font-size: 14px; color: #86868b; margin-bottom: 8px; font-weight: 500;">
                  Con Kit: <span id="selectedKitName">${kitInicial.nombre}</span>
                </div>
                <div id="kitImageContainer" style="width: 100%; height: 250px; background: var(--white); border-radius: var(--radius); border: var(--border); display: flex; align-items: center; justify-content: center;">
                  <img src="${vehiculo.imagenes?.[0] || CONFIG.app.defaultImage}" 
                       alt="Con Kit ${kitInicial.nombre}" 
                       style="max-width: 100%; max-height: 100%; object-fit: contain; padding: 16px;"
                       onerror="this.src='${CONFIG.app.defaultImage}'"
                       id="kitImage">
                </div>
              </div>
            </div>
            
            <div style="text-align: center;">
              <div style="font-size: 12px; color: #86868b; margin-top: 8px;">
                Selecciona un kit para ver la transformación
              </div>
            </div>
          </div>
        </div>
        
        <!-- SELECCIÓN DE KITS -->
        <div style="padding: 32px; overflow-y: auto; max-height: 70vh;">
          <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Personaliza tu ${vehiculo.nombre}</h2>
          <p style="color: #86868b; margin-bottom: 32px; font-size: 14px;">Precios específicos para este modelo. Selecciona un kit para ver la comparación.</p>
          
          <div class="option-group">
            <h3 class="option-title">Niveles de Upgrade Disponibles</h3>
            <div class="option-items" id="kitsOptions">
              ${kits.map(kit => {
                const badgeColor = kit.nivel === 'full' ? 'var(--gold)' : 
                                 kit.nivel === 'medium' ? 'var(--silver)' : 'var(--bronze)';
                const textColor = kit.nivel === 'full' ? 'black' : 'white';
                const icon = kit.nivel === 'full' ? 'fa-crown' : 
                            kit.nivel === 'medium' ? 'fa-medal' : 'fa-star';
                const isSelected = kit.nivel === 'standar';
                
                return `
                  <div class="option-item ${isSelected ? 'selected' : ''}" 
                       onclick="UI.selectKit('${kit.id}', '${kit.nivel}', '${kit.nombre}', ${kit.precio}, ${vehiculo.id}, '${vehiculo.nombre}', ${vehiculo.precio})"
                       data-kit-id="${kit.id}">
                    <div style="width: 60px; height: 60px; background: ${badgeColor}; 
                         border-radius: 30px; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; color: ${textColor};">
                      <i class="fas ${icon}"></i>
                    </div>
                    <div style="font-size: 16px; font-weight: 600; margin-bottom: 6px;">${kit.nombre}</div>
                    <div style="font-size: 14px; font-weight: 500; margin-bottom: 8px; color: ${badgeColor};">
                      ${kit.precio > 0 ? `+${productosManager.formatPrice(kit.precio)}` : '<span style="color: var(--success);">INCLUIDO</span>'}
                    </div>
                    <div style="font-size: 12px; color: #86868b; line-height: 1.4;">${kit.descripcion || ''}</div>
                  </div>
                `;
              }).join('')}
            </div>
            
            <!-- DETALLES DEL KIT -->
            <div id="kitDetails" style="margin-top: 24px; padding: 24px; background: var(--gray-50); border-radius: var(--radius); border: var(--border);">
              <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 16px; color: var(--black); display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-clipboard-list"></i> Este kit incluye:
              </h4>
              <div id="kitIncludesList" style="display: grid; grid-template-columns: 1fr; gap: 10px;">
                ${kitInicial.includes ? kitInicial.includes.map(item => `
                  <div style="display: flex; align-items: flex-start; gap: 12px; padding: 10px; background: var(--white); border-radius: 8px;">
                    <div style="color: var(--success); font-size: 14px; margin-top: 2px; min-width: 20px;">
                      <i class="fas fa-check-circle"></i>
                    </div>
                    <div style="font-size: 14px; color: #86868b; line-height: 1.4; flex: 1;">${item}</div>
                  </div>
                `).join('') : '<div style="color: #86868b; font-size: 14px; padding: 20px; text-align: center;">Sin detalles disponibles.</div>'}
              </div>
            </div>
          </div>
          
          <!-- RESUMEN Y COTIZACIÓN -->
          <div style="margin-top: 32px; padding: 24px; background: var(--gray-50); border-radius: var(--radius); border: var(--border);">
            <div style="margin-bottom: 24px;">
              <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 16px; color: var(--black);">
                <i class="fas fa-file-invoice-dollar"></i> Resumen de Cotización
              </h4>
              
              <div style="margin-bottom: 16px; padding: 16px; background: var(--white); border-radius: 8px; border-left: 4px solid var(--blue);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <div style="font-weight: 600; color: var(--black);">${vehiculo.nombre}</div>
                  <div style="font-weight: 600; color: var(--black);">${productosManager.formatPrice(vehiculo.precio)}</div>
                </div>
                <div style="font-size: 13px; color: #86868b;">
                  ${vehiculo.estado === 'stock' ? 'En Stock Arica' : vehiculo.estado === 'transit' ? 'En Tránsito' : 'Para Reservar'}
                </div>
              </div>
              
              <div id="selectedOptionsList">
                <div style="padding: 16px; background: var(--white); border-radius: 8px; border-left: 4px solid var(--bronze);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <div style="font-weight: 600; color: var(--black); display: flex; align-items: center; gap: 8px;">
                      <span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; 
                            background: var(--bronze); color: white; border-radius: 12px; font-size: 12px;">
                        <i class="fas fa-star"></i>
                      </span>
                      Kit ${kitInicial.nombre}
                    </div>
                    <div style="font-weight: 600; color: var(--success); font-size: 16px;">
                      INCLUIDO
                    </div>
                  </div>
                  <div style="font-size: 13px; color: #86868b; margin-top: 4px;">
                    ${kitInicial.descripcion || ''}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- TOTAL -->
            <div style="border-top: var(--border); padding-top: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 17px; font-weight: 600;">Total con Upgrade</div>
                <div style="font-size: 28px; font-weight: 700;" id="totalPrice">
                  ${productosManager.formatPrice(vehiculo.precio)} CLP
                </div>
              </div>
            </div>
            
            <!-- ACCIONES -->
            <div style="display: flex; gap: 12px; margin-top: 24px;">
              <button class="button" onclick="UI.requestCustomization(${vehiculo.id})" style="flex: 2;">
                <i class="fab fa-whatsapp"></i> Solicitar Cotización Completa
              </button>
              <button class="button button-outline" onclick="UI.closeModal('customizationModal')" style="flex: 1;">
                Volver
              </button>
            </div>
            
            <p style="font-size: 12px; color: #86868b; margin-top: 16px; text-align: center;">
              <i class="fas fa-info-circle"></i> Los precios son estimados y pueden variar según disponibilidad.
            </p>
          </div>
        </div>
      </div>
    `;
    
    // Cargar imagen del kit inicial
    this.loadKitImage(vehiculo.id, kitInicial.id);
    
    this.showModal('customizationModal');
  }
  
  // ============================================
  // FUNCIONES DE COMPARACIÓN
  // ============================================
  
  static async selectKit(kitId, kitNivel, kitNombre, kitPrecio, vehicleId, vehiculoNombre, basePrice) {
    const vehiculo = productosManager.getVehiculoById(vehicleId);
    if (!vehiculo) return;
    
    const kits = vehiculo.kits || [];
    const kit = kits.find(k => k.id === kitId);
    if (!kit) return;
    
    // Actualizar clases de selección
    document.querySelectorAll('#kitsOptions .option-item').forEach(item => {
      item.classList.remove('selected');
    });
    
    const clickedElement = event?.target?.closest('.option-item');
    if (clickedElement) {
      clickedElement.classList.add('selected');
    }
    
    // Actualizar nombre del kit en el comparador
    const selectedKitName = document.getElementById('selectedKitName');
    if (selectedKitName) {
      selectedKitName.textContent = kitNombre;
    }
    
    // Actualizar detalles del kit
    const includesList = document.getElementById('kitIncludesList');
    if (includesList && kit.includes) {
      includesList.innerHTML = kit.includes.map(item => `
        <div style="display: flex; align-items: flex-start; gap: 12px; padding: 10px; background: var(--white); border-radius: 8px;">
          <div style="color: var(--success); font-size: 14px; margin-top: 2px; min-width: 20px;">
            <i class="fas fa-check-circle"></i>
          </div>
          <div style="font-size: 14px; color: #86868b; line-height: 1.4; flex: 1;">${item}</div>
        </div>
      `).join('');
    }
    
    // Actualizar opciones seleccionadas
    const badgeColor = kit.nivel === 'full' ? 'var(--gold)' : 
                      kit.nivel === 'medium' ? 'var(--silver)' : 'var(--bronze)';
    const textColor = kit.nivel === 'full' ? 'black' : 'white';
    const icon = kit.nivel === 'full' ? 'fa-crown' : 
                kit.nivel === 'medium' ? 'fa-medal' : 'fa-star';
    
    const selectedOptionsList = document.getElementById('selectedOptionsList');
    if (selectedOptionsList) {
      selectedOptionsList.innerHTML = `
        <div style="padding: 16px; background: var(--white); border-radius: 8px; border-left: 4px solid ${badgeColor};">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <div style="font-weight: 600; color: var(--black); display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; 
                    background: ${badgeColor}; color: ${textColor}; border-radius: 12px; font-size: 12px;">
                <i class="fas ${icon}"></i>
              </span>
              Kit ${kitNombre}
            </div>
            <div style="font-weight: 600; color: var(--black); font-size: 16px;">
              ${kit.precio > 0 ? `+${productosManager.formatPrice(kit.precio)}` : '<span style="color: var(--success);">INCLUIDO</span>'}
            </div>
          </div>
          <div style="font-size: 13px; color: #86868b; margin-top: 4px;">
            ${kit.descripcion || ''}
          </div>
        </div>
      `;
    }
    
    // Actualizar precio total
    const totalPrice = document.getElementById('totalPrice');
    if (totalPrice) {
      const basePrice = vehiculo.precio || 0;
      const total = basePrice + kit.precio;
      
      if (kit.precio > 0) {
        totalPrice.innerHTML = `
          ${productosManager.formatPrice(total)} 
          <span style="font-size: 14px; color: var(--success); margin-left: 4px;">
            (+${productosManager.formatPrice(kit.precio)})
          </span>
        `;
      } else {
        totalPrice.textContent = `${productosManager.formatPrice(total)} CLP`;
      }
    }
    
    // Cargar imagen del kit para comparación
    await this.loadKitImage(vehicleId, kitId);
  }
  
  // Cargar imagen del kit para el comparador
  static async loadKitImage(vehicleId, kitId) {
    try {
      const imagenKit = await productosManager.getCustomizationImage(vehicleId, kitId);
      const kitImageElement = document.getElementById('kitImage');
      
      if (kitImageElement) {
        if (imagenKit) {
          kitImageElement.src = imagenKit;
          kitImageElement.onerror = function() {
            const vehiculo = productosManager.getVehiculoById(vehicleId);
            this.src = vehiculo?.imagenes?.[0] || CONFIG.app.defaultImage;
          };
        } else {
          const vehiculo = productosManager.getVehiculoById(vehicleId);
          kitImageElement.src = vehiculo?.imagenes?.[0] || CONFIG.app.defaultImage;
        }
      }
    } catch (error) {
      console.error('Error cargando imagen del kit:', error);
    }
  }
  
  // Solicitar cotización
  static requestCustomization(vehicleId) {
    const vehiculo = productosManager.getVehiculoById(vehicleId);
    if (!vehiculo) {
      this.showNotification("Primero selecciona un vehículo", "warning");
      return;
    }
    
    // Obtener el kit seleccionado
    const selectedElement = document.querySelector('#kitsOptions .option-item.selected');
    if (!selectedElement) {
      this.showNotification("Selecciona un kit de upgrade", "warning");
      return;
    }
    
    const kitId = selectedElement.dataset.kitId;
    const kitNombre = selectedElement.querySelector('div:nth-child(2)').textContent;
    const kitPriceText = selectedElement.querySelector('div:nth-child(3)').textContent;
    const kitPrice = kitPriceText.includes('+') ? 
      parseInt(kitPriceText.replace('+$', '').replace('.', '')) : 0;
    
    const basePrice = vehiculo.precio || 0;
    const total = basePrice + kitPrice;
    
    let message = `🚗 *COTIZACIÓN KIT UPGRADE - IMPORT AMERICAN CARS*\n\n`;
    message += `*Vehículo:* ${vehiculo.nombre}\n`;
    message += `*Estado:* ${vehiculo.estado === 'stock' ? 'En Stock Arica' : vehiculo.estado === 'transit' ? 'En Tránsito' : 'Para Reservar'}\n`;
    message += `*Precio base:* ${productosManager.formatPrice(basePrice)} CLP\n\n`;
    
    message += `*Kit Upgrade seleccionado:*\n`;
    message += `*Kit ${kitNombre}:* ${kitPrice > 0 ? `+${productosManager.formatPrice(kitPrice)}` : 'INCLUIDO'}\n\n`;
    
    // Especificaciones del vehículo
    if (vehiculo.ano || vehiculo.color || vehiculo.motor) {
      message += `*Especificaciones:*\n`;
      if (vehiculo.ano) message += `• Año: ${vehiculo.ano}\n`;
      if (vehiculo.color) message += `• Color: ${vehiculo.color}\n`;
      if (vehiculo.motor) message += `• Motor: ${vehiculo.motor}\n`;
      if (vehiculo.kilometraje) message += `• Kilometraje: ${vehiculo.kilometraje.toLocaleString()} km\n`;
      if (vehiculo.transmision) message += `• Transmisión: ${vehiculo.transmision}\n`;
      message += `\n`;
    }
    
    message += `💰 *TOTAL ESTIMADO:* ${productosManager.formatPrice(total)} CLP\n\n`;
    message += `¿Podemos proceder con esta configuración? Necesito:\n`;
    message += `✅ Confirmar disponibilidad\n`;
    message += `✅ Coordinar visita en Zona Franca Arica\n`;
    message += `✅ Programar instalación del kit\n\n`;
    message += `¡Gracias por tu interés en Import American Cars!`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${CONFIG.contacto.whatsapp}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  }
  
  // Mostrar todos los vehículos para personalización
  static showAllVehiclesForCustomization() {
    const vehiculos = productosManager.vehiculos;
    if (!vehiculos || vehiculos.length === 0) {
      this.showNotification("Primero carga los vehículos", "warning");
      return;
    }
    
    const modalContent = document.getElementById('customizationContent');
    
    modalContent.innerHTML = `
      <div class="customization-container">
        <div style="padding: 32px; background: var(--gray-50); display: flex; align-items: center; justify-content: center;">
          <div style="text-align: center;">
            <div style="font-size: 64px; color: #86868b; margin-bottom: 20px;">🚗✨</div>
            <h3 style="font-size: 24px; font-weight: 700; margin-bottom: 12px; color: var(--black);">
              Kits Upgrade Personalizados
            </h3>
            <p style="color: #86868b; max-width: 400px;">
              Cada vehículo tiene kits de upgrade con precios específicos según modelo
            </p>
          </div>
        </div>
        <div style="padding: 32px; overflow-y: auto; max-height: 80vh;">
          <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Selecciona un Vehículo</h2>
          <p style="color: #86868b; margin-bottom: 32px; font-size: 14px;">Elige un vehículo para ver sus kits de upgrade personalizados</p>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; max-height: 400px; overflow-y: auto; padding-right: 8px;">
            ${vehiculos.map(vehicle => `
              <div onclick="UI.customizeVehicle('${vehicle.id}')" 
                   style="cursor: pointer; border: var(--border); border-radius: var(--radius); padding: 20px; transition: all 0.3s; background: var(--white); text-align: center;" 
                   onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='var(--shadow)';" 
                   onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                <img src="${vehicle.imagenes?.[0] || CONFIG.app.defaultImage}" 
                     style="width: 100%; height: 140px; object-fit: cover; border-radius: 6px; margin-bottom: 12px;"
                     onerror="this.src='${CONFIG.app.defaultImage}'">
                <div style="font-weight: 500; margin-bottom: 4px; font-size: 15px; color: var(--black);">${vehicle.nombre}</div>
                <div style="font-size: 13px; color: #86868b; margin-bottom: 8px;">
                  ${vehicle.descripcion ? (vehicle.descripcion.substring(0, 60) + (vehicle.descripcion.length > 60 ? '...' : '')) : 'Sin descripción'}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
                  <div style="font-size: 17px; font-weight: 600;">${productosManager.formatPrice(vehicle.precio)}</div>
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

  // Contactar vehículo
  static contactVehicle(vehicleId, kit = null) {
    const vehiculo = productosManager.getVehiculoById(vehicleId);
    if (!vehiculo) {
      this.showNotification("Vehículo no encontrado", "error");
      return;
    }
    
    const whatsappUrl = productosManager.getWhatsAppUrl(vehiculo, kit);
    window.open(whatsappUrl, '_blank');
  }
  
  // Mostrar mensaje general
  static showMessage(message) {
    this.showNotification(message, 'info');
  }
}

// Hacer funciones globales para usar en onclick
window.UI = UI;
[file content end]
