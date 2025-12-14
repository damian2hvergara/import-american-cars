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
  
  // Mostrar notificación - EXACTA AL PRIMER CÓDIGO
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
  
  // Renderizar grid de vehículos - EXACTO AL PRIMER CÓDIGO
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
          <img src="${primeraImagen}" 
               alt="${vehiculo.nombre}" 
               class="vehicle-image"
               onerror="this.src='${CONFIG.app.defaultImage}'"
               loading="lazy">
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
                <i class="fas fa-crown"></i> Kits
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    // Asignar eventos a las tarjetas y botones - EXACTO
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
  
  // Lógica del Slider
  static initImageSlider(sliderElement, images, vehiculoNombre) {
    if (!sliderElement || !images || images.length === 0) {
      console.error('❌ No hay imágenes para el slider');
      return;
    }
    
    const wrapper = sliderElement.querySelector('.slider-wrapper');
    const prevButton = sliderElement.querySelector('.slider-button-prev');
    const nextButton = sliderElement.querySelector('.slider-button-next');
    
    if (!wrapper || !prevButton || !nextButton) {
      console.error('❌ Elementos del slider no encontrados');
      return;
    }
    
    const totalSlides = images.length;
    let currentSlide = 0;
    
    // Limpiar y re-inyectar imágenes
    wrapper.innerHTML = images.map((url, index) => `
      <div class="slider-slide">
        <img src="${url}" 
             alt="Imagen ${index + 1} de ${vehiculoNombre}" 
             loading="lazy" 
             onerror="this.src='${CONFIG.app.defaultImage}'
             this.onerror=null">
      </div>
    `).join('');

    // Mostrar/ocultar botones si solo hay una imagen
    if (totalSlides <= 1) {
      prevButton.style.display = 'none';
      nextButton.style.display = 'none';
    } else {
      prevButton.style.display = 'flex';
      nextButton.style.display = 'flex';
    }
    
    const updateSlider = () => {
      wrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
      prevButton.disabled = currentSlide === 0;
      nextButton.disabled = currentSlide === totalSlides - 1;
    };
    
    nextButton.onclick = () => {
      if (currentSlide < totalSlides - 1) {
        currentSlide++;
        updateSlider();
      }
    };
    
    prevButton.onclick = () => {
      if (currentSlide > 0) {
        currentSlide--;
        updateSlider();
      }
    };
    
    updateSlider();
  }
  
  // Mostrar detalles del vehículo - EXACTO
  static showVehicleDetails(vehicleId) {
    const vehiculo = productosManager.getVehiculoById(vehicleId);
    if (!vehiculo) {
      this.showNotification("Vehículo no encontrado", "error");
      return;
    }
    
    const modalContent = document.getElementById('vehicleModalContent');
    
    // Asegurar que haya imágenes
    const imagenes = vehiculo.imagenes && vehiculo.imagenes.length > 0 
      ? vehiculo.imagenes 
      : [CONFIG.app.defaultImage];
    
    // Inyectar el HTML del modal con el contenedor del slider - EXACTO
    modalContent.innerHTML = `
      <div class="vehicle-details">
        <div class="image-gallery-container">
          <div id="vehicleImageSlider" class="slider-container">
            <div class="slider-wrapper"></div>
            <button class="slider-button-prev"><i class="fas fa-chevron-left"></i></button>
            <button class="slider-button-next"><i class="fas fa-chevron-right"></i></button>
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
            ${vehiculo.motor ? `<div><i class="fas fa-cogs"></i> Motor: ${vehiculo.motor}</div>` : ''}
            ${vehiculo.kilometraje ? `<div><i class="fas fa-road"></i> Kilometraje: ${vehiculo.kilometraje} km</div>` : ''}
            ${vehiculo.ano ? `<div><i class="fas fa-calendar"></i> Año: ${vehiculo.ano}</div>` : ''}
            ${vehiculo.color ? `<div><i class="fas fa-palette"></i> Color: ${vehiculo.color}</div>` : ''}
            ${vehiculo.transmision ? `<div><i class="fas fa-exchange-alt"></i> Transmisión: ${vehiculo.transmision}</div>` : ''}
            ${vehiculo.combustible ? `<div><i class="fas fa-gas-pump"></i> Combustible: ${vehiculo.combustible}</div>` : ''}
          </div>

          <div class="modal-actions">
            <button class="button" id="whatsappFromModal" data-id="${vehicleId}" style="flex: 1;"> 
              <i class="fab fa-whatsapp"></i> Reservar Ahora 
            </button>
            <button class="button button-outline" id="customizeBtn" data-id="${vehicleId}" style="flex: 1;"> 
              <i class="fas fa-crown"></i> Personalizar 
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
  // FUNCIÓN DE KITS UPGRADE - EXACTA AL PRIMER CÓDIGO
  // ============================================
  static async customizeVehicle(vehicleId) {
    const vehiculo = productosManager.getVehiculoById(vehicleId);
    if (!vehiculo) {
      this.showNotification("Vehículo no encontrado", "error");
      return;
    }
    
    const kits = productosManager.getKitsForDisplay();
    if (kits.length === 0) {
      this.showNotification("No hay kits de mejora disponibles", "warning");
      return;
    }
    
    const modalContent = document.getElementById('customizationContent');
    
    // Asegurar imagen principal
    const imagenPrincipal = vehiculo.imagen_principal_card || vehiculo.imagenes?.[0] || CONFIG.app.defaultImage;
    
    // HTML EXACTO del primer código
    modalContent.innerHTML = `
      <div class="customization-container">
        <div style="padding: 32px; background: var(--gray-50); display: flex; align-items: center; justify-content: center;">
          <div style="text-align: center; width: 100%;">
            <div id="comparisonVisual" style="max-width: 100%;">
              <img src="${imagenPrincipal}" 
                   alt="${vehiculo.nombre}" 
                   style="max-width: 100%; max-height: 300px; object-fit: contain; border-radius: var(--radius);"
                   onerror="this.src='${CONFIG.app.defaultImage}'">
            </div>
            <div style="margin-top: 20px; font-size: 14px; color: #86868b;">
              Selecciona un kit para ver la comparación
            </div>
          </div>
        </div>
        <div style="padding: 32px; overflow-y: auto; max-height: 80vh;">
          <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Kits Upgrade para ${vehiculo.nombre}</h2>
          <p style="color: #86868b; margin-bottom: 32px; font-size: 14px;">Precios específicos para este modelo</p>
          
          <div class="option-group">
            <h3 class="option-title">Nivel de Upgrade</h3>
            <div class="option-items" id="kitsOptions">
              ${kits.map(kit => {
                const badgeColor = kit.nivel === 'full' ? 'var(--gold)' : 
                                 kit.nivel === 'medium' ? 'var(--silver)' : 'var(--bronze)';
                const textColor = kit.nivel === 'full' ? 'black' : 'white';
                const icon = kit.nivel === 'full' ? 'fa-crown' : 
                            kit.nivel === 'medium' ? 'fa-medal' : 'fa-star';
                
                return `
                  <div class="option-item ${kit.nivel === 'standar' ? 'selected' : ''}" 
                       onclick="UI.selectKit('${kit.id}', '${kit.nivel}', '${kit.nombre}', ${kit.precio}, ${vehiculo.id})">
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
            
            <div id="kitDetails" style="margin-top: 24px; padding: 20px; background: var(--gray-50); border-radius: var(--radius); border: var(--border);">
              <h4 style="font-size: 15px; font-weight: 600; margin-bottom: 12px; color: var(--black); display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-clipboard-list"></i> Este kit incluye:
              </h4>
              <div id="kitIncludesList">
                ${kits[0].includes ? kits[0].includes.map(item => `
                  <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px;">
                    <div style="color: var(--success); font-size: 12px; margin-top: 2px;">
                      <i class="fas fa-check-circle"></i>
                    </div>
                    <div style="font-size: 13px; color: #86868b; line-height: 1.4; flex: 1;">${item}</div>
                  </div>
                `).join('') : '<div style="color: #86868b; font-size: 13px;">Sin detalles disponibles.</div>'}
              </div>
            </div>
          </div>
          
          <div style="margin-top: 32px; padding: 24px; background: var(--gray-50); border-radius: var(--radius); border: var(--border);">
            <div style="margin-bottom: 16px;">
              <div style="font-size: 13px; color: #86868b; margin-bottom: 8px;">Vehículo base</div>
              <div style="font-weight: 500; margin-bottom: 4px;">${vehiculo.nombre}</div>
              <div style="font-size: 24px; font-weight: 700;">${productosManager.formatPrice(vehiculo.precio)} CLP</div>
            </div>
            
            <div id="selectedOptionsList" style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 15px; 
                   background: var(--white); padding: 16px; border-radius: 8px; border-left: 4px solid var(--bronze);">
                <div>
                  <div style="font-weight: 700; color: var(--black); margin-bottom: 4px; display: flex; align-items: center; gap: 8px;">
                    <span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; 
                          background: var(--bronze); color: white; border-radius: 12px; font-size: 12px;">
                      <i class="fas fa-star"></i>
                    </span>
                    Kit ${kits[0].nombre}
                  </div>
                  <div style="font-size: 13px; color: #86868b;">${kits[0].descripcion || ''}</div>
                </div>
                <div style="font-weight: 700; color: var(--success); font-size: 16px;">
                  INCLUIDO
                </div>
              </div>
            </div>
            
            <div style="border-top: var(--border); padding-top: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="font-weight: 600;">Total con Upgrade</div>
                <div style="font-size: 28px; font-weight: 700;" id="totalPrice">${productosManager.formatPrice(vehiculo.precio)} CLP</div>
              </div>
            </div>
            
            <button class="button" onclick="UI.requestCustomization(${vehiculo.id})" style="margin-top: 24px;">
              <i class="fab fa-whatsapp"></i> Solicitar Cotización
            </button>
          </div>
        </div>
      </div>
    `;
    
    this.showModal('customizationModal');
  }
  
  // Seleccionar kit - EXACTO
  static async selectKit(kitId, kitNivel, kitNombre, kitPrecio, vehicleId) {
    const vehiculo = productosManager.getVehiculoById(vehicleId);
    if (!vehiculo) return;
    
    const kits = productosManager.getKitsForDisplay();
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
    
    // Actualizar detalles del kit
    const includesList = document.getElementById('kitIncludesList');
    if (includesList && kit.includes) {
      includesList.innerHTML = kit.includes.map(item => `
        <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px;">
          <div style="color: var(--success); font-size: 12px; margin-top: 2px;">
            <i class="fas fa-check-circle"></i>
          </div>
          <div style="font-size: 13px; color: #86868b; line-height: 1.4; flex: 1;">${item}</div>
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
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 15px; 
             background: var(--white); padding: 16px; border-radius: 8px; border-left: 4px solid ${badgeColor};">
          <div>
            <div style="font-weight: 700; color: var(--black); margin-bottom: 4px; display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; 
                    background: ${badgeColor}; color: ${textColor}; border-radius: 12px; font-size: 12px;">
                <i class="fas ${icon}"></i>
              </span>
              Kit ${kit.nombre}
            </div>
            <div style="font-size: 13px; color: #86868b;">${kit.descripcion || ''}</div>
          </div>
          <div style="font-weight: 700; color: var(--black); font-size: 16px;">
            ${kit.precio > 0 ? `+${productosManager.formatPrice(kit.precio)}` : '<span style="color: var(--success);">INCLUIDO</span>'}
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
    
    // Actualizar imagen de comparación
    const comparisonVisual = document.getElementById('comparisonVisual');
    if (comparisonVisual) {
      // Intentar obtener imagen personalizada
      let imageUrl = await productosManager.getCustomizationImage(vehiculo.id, kit.id);
      
      if (!imageUrl) {
        // Si no hay imagen personalizada, usar la imagen base
        imageUrl = vehiculo.imagen_principal_card || vehiculo.imagenes?.[0] || CONFIG.app.defaultImage;
      }
      
      comparisonVisual.innerHTML = `
        <img src="${imageUrl}" 
             alt="${vehiculo.nombre} - ${kit.nombre}" 
             style="max-width: 100%; max-height: 300px; object-fit: contain; border-radius: var(--radius);"
             onerror="this.src='${vehiculo.imagenes?.[0] || CONFIG.app.defaultImage}'">
      `;
    }
  }
  
  // Solicitar cotización - EXACTO
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
    
    const kitNombre = selectedElement.querySelector('div:nth-child(2)').textContent;
    const kitPriceText = selectedElement.querySelector('div:nth-child(3)').textContent;
    const kitPrice = kitPriceText.includes('+') ? 
      parseInt(kitPriceText.replace('+$', '').replace('.', '')) : 0;
    
    const basePrice = vehiculo.precio || 0;
    const total = basePrice + kitPrice;
    
    let message = `🚗 *COTIZACIÓN KIT UPGRADE*\n\n`;
    message += `*Vehículo:* ${vehiculo.nombre}\n`;
    message += `*Precio base:* ${productosManager.formatPrice(basePrice)} CLP\n\n`;
    message += `*Kit Upgrade seleccionado:*\n`;
    message += `*Kit ${kitNombre}:* ${kitPrice > 0 ? `+${productosManager.formatPrice(kitPrice)}` : 'INCLUIDO'}\n\n`;
    message += `💰 *TOTAL ESTIMADO:* ${productosManager.formatPrice(total)} CLP\n\n`;
    message += `¿Podemos proceder con esta configuración?`;
    
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
    
    // HTML EXACTO del primer código
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
          
          <div style="display: grid; grid-template-columns: 1fr; gap: 16px; max-height: 400px; overflow-y: auto; padding-right: 8px;">
            ${vehiculos.map(vehicle => `
              <div onclick="UI.customizeVehicle('${vehicle.id}')" 
                   style="cursor: pointer; border: var(--border); border-radius: var(--radius); padding: 20px; text-align: center; transition: all 0.3s; background: var(--white);" 
                   onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='var(--shadow)';" 
                   onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                <img src="${vehicle.imagenes?.[0] || CONFIG.app.defaultImage}" 
                     style="width: 100%; height: 120px; object-fit: cover; border-radius: 6px; margin-bottom: 12px;"
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
