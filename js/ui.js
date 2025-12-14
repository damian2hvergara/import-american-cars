import { CONFIG } from './config.js';
import { productosManager } from './productos.js';

export class UI {
  static init() {
    this.initEventListeners();
    this.initMobileMenu();
  }
  
  static initEventListeners() {
    document.querySelectorAll('.filter-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const filter = e.target.dataset.filter;
        if (filter) {
          productosManager.filtrarVehiculos(filter);
        }
      });
    });
    
    document.querySelectorAll('.indicator').forEach(indicator => {
      indicator.addEventListener('click', (e) => {
        const filter = e.currentTarget.dataset.filter;
        if (filter) {
          productosManager.filtrarVehiculos(filter);
          window.scrollTo({ top: document.getElementById('vehicles').offsetTop - 80, behavior: 'smooth' });
        }
      });
    });
    
    document.getElementById('showAllKits')?.addEventListener('click', () => {
      this.showAllVehiclesForCustomization();
    });
    
    document.getElementById('closeVehicleModal')?.addEventListener('click', () => {
      this.closeModal('vehicleModal');
    });
    
    document.getElementById('closeCustomizationModal')?.addEventListener('click', () => {
      this.closeModal('customizationModal');
    });
    
    document.addEventListener('click', (e) => {
      if (e.target === document.getElementById('vehicleModal') || 
          e.target === document.getElementById('customizationModal')) {
        this.closeModal(e.target.id);
      }
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal('vehicleModal');
        this.closeModal('customizationModal');
      }
    });
  }
  
  static initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    if (!menuToggle) return;
    
    menuToggle.addEventListener('click', () => {
      const navLinks = document.querySelector('.nav-links');
      navLinks.classList.toggle('mobile-active');
    });
  }
  
  static showLoading() {
    const container = document.getElementById('vehiclesContainer');
    if (container) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
          <div class="loading-spinner"></div>
          <p style="font-size: 17px; color: var(--secondary-dark); margin-top: 20px;">
            Cargando vehículos desde la base de datos...
          </p>
        </div>
      `;
    }
  }
  
  static hideLoading() {}
  
  static showNotification(message, type = 'success') {
    const container = document.getElementById('notificationContainer') || document.createElement('div');
    container.id = 'notificationContainer';
    container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999;';
    if (!container.parentNode) document.body.appendChild(container);
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    const colors = {
      success: CONFIG.app.colors.success,
      error: CONFIG.app.colors.error,
      warning: CONFIG.app.colors.warning,
      info: CONFIG.app.colors.primaryMain
    };
    
    notification.innerHTML = `
      <div style="
        width: 24px;
        height: 24px;
        border-radius: 12px;
        background: ${colors[type]};
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
      ">
        ${type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'i'}
      </div>
      <div style="flex: 1; min-width: 0;">
        <div style="font-size: 14px; font-weight: 600; color: var(--primary-dark);">
          ${type === 'success' ? 'Éxito' : type === 'error' ? 'Error' : type === 'warning' ? 'Advertencia' : 'Información'}
        </div>
        <div style="font-size: 13px; color: var(--secondary-dark); overflow-wrap: break-word;">${message}</div>
      </div>
      <button style="
        background: none;
        border: none;
        color: var(--secondary-main);
        cursor: pointer;
        padding: 4px;
        border-radius: 6px;
        transition: background 150ms;
        flex-shrink: 0;
      ">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    container.appendChild(notification);
    
    notification.querySelector('button').addEventListener('click', () => {
      notification.style.transform = 'translateX(100%)';
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    });
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);
  }
  
  static showError(message) {
    this.showNotification(message, 'error');
  }
  
  static showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  static closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
  
  static updateCounter(elementId, count) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = count;
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
  
  static renderVehiculosGrid(vehiculos) {
    const container = document.getElementById('vehiclesContainer');
    if (!container) return;
    
    if (!vehiculos || vehiculos.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
          <div style="font-size: 48px; margin-bottom: 20px; color: var(--secondary-main);">
            <i class="fas fa-search"></i>
          </div>
          <h3 style="font-size: 21px; font-weight: 600; margin-bottom: 12px; color: var(--primary-dark);">
            No hay vehículos disponibles
          </h3>
          <p style="color: var(--secondary-dark); margin-bottom: 20px;">
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
      
      return `
        <div class="vehicle-card fade-in" data-id="${vehiculo.id}">
          <img src="${primeraImagen}" 
               alt="${vehiculo.nombre}" 
               class="vehicle-image"
               onerror="this.src='${CONFIG.app.defaultImage}'"
               loading="lazy">
          <div class="vehicle-info">
            <div class="vehicle-status" data-status="${vehiculo.estado}">
              ${vehiculo.estado === 'stock' ? 'En Stock Arica' : 
                vehiculo.estado === 'transit' ? 'En Tránsito' : 
                'Para Reservar'}
            </div>
            <h3 class="vehicle-title">${vehiculo.nombre || 'Vehículo sin nombre'}</h3>
            <div class="vehicle-price">${productosManager.formatPrice(vehiculo.precio)}</div>
            <p class="vehicle-description">
              ${vehiculo.descripcion ? (vehiculo.descripcion.substring(0, 100) + (vehiculo.descripcion.length > 100 ? '...' : '')) : 'Sin descripción disponible.'}
            </p>
            <div class="vehicle-actions">
              <button class="button whatsapp-btn" data-action="consultar" data-id="${vehiculo.id}">
                <i class="fab fa-whatsapp"></i> Consultar
              </button>
              <button class="button kit-btn" data-action="kits" data-id="${vehiculo.id}">
                <i class="fas fa-crown"></i> Kits
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
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
  
  static showVehicleDetails(vehicleId) {
    const vehiculo = productosManager.getVehiculoById(vehicleId);
    if (!vehiculo) {
      this.showNotification("Vehículo no encontrado", "error");
      return;
    }
    
    const modalContent = document.getElementById('vehicleModalContent');
    const imagenes = vehiculo.imagenes && vehiculo.imagenes.length > 0 
      ? vehiculo.imagenes 
      : [CONFIG.app.defaultImage];
    
    modalContent.innerHTML = `
      <div class="vehicle-details">
        <div class="image-gallery-container">
          <div id="vehicleImageSlider" class="slider-container">
            <div class="slider-wrapper">
              ${imagenes.map(img => `
                <div class="slider-slide">
                  <img src="${img}" alt="Imagen de ${vehiculo.nombre}" loading="lazy">
                </div>
              `).join('')}
            </div>
            <button class="slider-button-prev"><i class="fas fa-chevron-left"></i></button>
            <button class="slider-button-next"><i class="fas fa-chevron-right"></i></button>
          </div>
        </div>
        
        <div class="details-content">
          <div class="vehicle-status" data-status="${vehiculo.estado}">
            ${vehiculo.estado === 'stock' ? 'En Stock Arica' : 
              vehiculo.estado === 'transit' ? 'En Tránsito' : 
              'Para Reservar'}
          </div>
          <h2 class="detail-title">${vehiculo.nombre || 'Vehículo'}</h2>
          <div class="detail-price">${productosManager.formatPrice(vehiculo.precio)}</div>
          <p class="detail-description">${vehiculo.descripcion || 'Sin descripción disponible.'}</p>
          
          <div class="detail-features">
            ${vehiculo.motor ? `<div><i class="fas fa-cogs"></i> <span>Motor:</span> ${vehiculo.motor}</div>` : ''}
            ${vehiculo.kilometraje ? `<div><i class="fas fa-road"></i> <span>Kilometraje:</span> ${vehiculo.kilometraje} km</div>` : ''}
            ${vehiculo.ano ? `<div><i class="fas fa-calendar"></i> <span>Año:</span> ${vehiculo.ano}</div>` : ''}
            ${vehiculo.color ? `<div><i class="fas fa-palette"></i> <span>Color:</span> ${vehiculo.color}</div>` : ''}
            ${vehiculo.transmision ? `<div><i class="fas fa-exchange-alt"></i> <span>Transmisión:</span> ${vehiculo.transmision}</div>` : ''}
            ${vehiculo.combustible ? `<div><i class="fas fa-gas-pump"></i> <span>Combustible:</span> ${vehiculo.combustible}</div>` : ''}
          </div>

          <div class="modal-actions">
            <button class="button whatsapp-btn" id="whatsappFromModal" data-id="${vehicleId}"> 
              <i class="fab fa-whatsapp"></i> Reservar Ahora 
            </button>
            <button class="button kit-btn" id="customizeBtn" data-id="${vehicleId}"> 
              <i class="fas fa-crown"></i> Personalizar 
            </button>
          </div>
        </div>
      </div>
    `;

    this.initSlider();
    
    document.getElementById('whatsappFromModal')?.addEventListener('click', (e) => {
      this.contactVehicle(e.currentTarget.dataset.id);
    });
    
    document.getElementById('customizeBtn')?.addEventListener('click', (e) => {
      this.closeModal('vehicleModal');
      this.customizeVehicle(e.currentTarget.dataset.id);
    });
    
    this.showModal('vehicleModal');
  }
  
  static initSlider() {
    const slider = document.getElementById('vehicleImageSlider');
    if (!slider) return;
    
    const wrapper = slider.querySelector('.slider-wrapper');
    const slides = wrapper.querySelectorAll('.slider-slide');
    const prevBtn = slider.querySelector('.slider-button-prev');
    const nextBtn = slider.querySelector('.slider-button-next');
    
    let currentSlide = 0;
    
    const updateSlider = () => {
      wrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
      prevBtn.style.opacity = currentSlide === 0 ? '0.5' : '1';
      nextBtn.style.opacity = currentSlide === slides.length - 1 ? '0.5' : '1';
    };
    
    nextBtn?.addEventListener('click', () => {
      if (currentSlide < slides.length - 1) {
        currentSlide++;
        updateSlider();
      }
    });
    
    prevBtn?.addEventListener('click', () => {
      if (currentSlide > 0) {
        currentSlide--;
        updateSlider();
      }
    });
    
    updateSlider();
  }
  
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
    const imagenPrincipal = vehiculo.imagen_principal_card || vehiculo.imagenes?.[0] || CONFIG.app.defaultImage;
    
    modalContent.innerHTML = `
      <div class="comparison-modal">
        <div class="comparison-header">
          <h3>Personaliza tu ${vehiculo.nombre || 'Vehículo'}</h3>
          <p>Selecciona un paquete de mejora para ver la comparación visual</p>
        </div>

        <div class="comparison-container">
          <div class="comparison-panel">
            <h4>Vehículo Original</h4>
            <div class="comparison-image-container">
              <img id="originalVehicleImage" src="${imagenPrincipal}" alt="Vehículo Original"
                   onerror="this.src='${CONFIG.app.defaultImage}'; this.onerror=null">
            </div>
            <div class="comparison-details">
              <h5>Configuración Base</h5>
              <p>Precio: ${productosManager.formatPrice(vehiculo.precio)}</p>
            </div>
          </div>
          
          <div class="comparison-panel">
            <h4>Con Kit <span id="selectedKitName">Standard</span></h4>
            <div class="comparison-image-container">
              <img id="customizedVehicleImage" src="${imagenPrincipal}" alt="Vehículo Personalizado"
                   onerror="this.src='${CONFIG.app.defaultImage}'; this.onerror=null">
            </div>
            <div class="comparison-details">
              <h5 id="selectedKitTitle">Kit Standard</h5>
              <p id="selectedKitDescription">Preparación básica incluida</p>
            </div>
          </div>
        </div>

        <div>
          <h4 style="font-size: 18px; font-weight: 600; color: var(--primary-dark); margin-bottom: var(--space-lg); text-align: center;">
            Seleccionar Paquete de Mejora
          </h4>
          <div id="kitSelectionContainer" class="kit-selection-controls">
            ${kits.map(kit => `
              <button class="button kit-button" 
                      data-kit-id="${kit.id}" 
                      data-vehiculo-id="${vehiculo.id}"
                      data-kit-precio="${kit.precio}"
                      data-kit-nombre="${kit.nombre}"
                      data-kit-descripcion="${kit.descripcion || ''}"
                      ${kit.nivel === 'standar' ? 'data-default-kit="true"' : ''}>
                ${kit.nombre} 
                <span class="kit-price">(${productosManager.formatPrice(kit.precio)})</span>
              </button>
            `).join('')}
          </div>
        </div>
        
        <div class="customization-summary">
          <div class="summary-line">
            <span>Precio Vehículo Base:</span>
            <span class="price-value">${productosManager.formatPrice(vehiculo.precio)}</span>
          </div>
          <div class="summary-line">
            <span>Costo Kit Seleccionado:</span>
            <span class="price-value" id="kitPriceValue">INCLUIDO</span>
          </div>
          <div class="summary-total">
            <span>Precio Total Estimado:</span>
            <span class="price-value" id="totalPriceValue">${productosManager.formatPrice(vehiculo.precio)}</span>
          </div>
        </div>

        <div style="text-align: center; margin-top: var(--space-3xl);">
          <button class="button whatsapp-btn" id="requestQuote" style="padding: var(--space-lg) var(--space-3xl); font-size: 17px;">
            <i class="fab fa-whatsapp"></i> Solicitar Cotización con este Kit
          </button>
        </div>
      </div>
    `;
    
    const kitSelectionContainer = document.getElementById('kitSelectionContainer');
    if (kitSelectionContainer) {
      kitSelectionContainer.querySelectorAll('.kit-button').forEach(button => {
        button.addEventListener('click', (e) => {
          const kitId = e.currentTarget.dataset.kitId;
          const kitNombre = e.currentTarget.dataset.kitNombre;
          const kitPrecio = parseFloat(e.currentTarget.dataset.kitPrecio);
          const kitDescripcion = e.currentTarget.dataset.kitDescripcion;
          
          this.selectKit(vehiculo, kitId, kitNombre, kitPrecio, kitDescripcion);
          
          kitSelectionContainer.querySelectorAll('.kit-button').forEach(btn => btn.classList.remove('active'));
          e.currentTarget.classList.add('active');
        });
      });

      const defaultKitButton = kitSelectionContainer.querySelector('.kit-button[data-default-kit="true"]') || 
                              kitSelectionContainer.querySelector('.kit-button');
      if (defaultKitButton) {
        defaultKitButton.click();
      }
    }
    
    document.getElementById('requestQuote')?.addEventListener('click', () => {
      const selectedButton = kitSelectionContainer?.querySelector('.kit-button.active');
      const selectedKit = selectedButton ? 
        productosManager.getKitsForDisplay().find(k => k.id === selectedButton.dataset.kitId) : 
        kits[0];
      
      this.contactVehicle(vehiculo.id, selectedKit);
    });
    
    this.showModal('customizationModal');
  }
  
  static async selectKit(vehiculo, kitId, kitNombre, kitPrecio, kitDescripcion) {
    const originalImageUrl = vehiculo.imagen_principal_card || vehiculo.imagenes?.[0] || CONFIG.app.defaultImage;
    const customizedImageElement = document.getElementById('customizedVehicleImage');
    const selectedKitNameElement = document.getElementById('selectedKitName');
    const selectedKitTitleElement = document.getElementById('selectedKitTitle');
    const selectedKitDescriptionElement = document.getElementById('selectedKitDescription');
    const kitPriceValueElement = document.getElementById('kitPriceValue');
    const totalPriceValueElement = document.getElementById('totalPriceValue');
    
    if (!customizedImageElement || !selectedKitNameElement) return;
    
    customizedImageElement.style.opacity = '0.7';
    
    selectedKitNameElement.textContent = kitNombre;
    selectedKitTitleElement.textContent = kitNombre;
    selectedKitDescriptionElement.textContent = kitDescripcion || 'Mejoras aplicadas';
    
    kitPriceValueElement.textContent = kitPrecio > 0 ? `+${productosManager.formatPrice(kitPrecio)}` : 'INCLUIDO';
    const totalPrice = (vehiculo.precio || 0) + kitPrecio;
    totalPriceValueElement.textContent = `${productosManager.formatPrice(totalPrice)}`;

    if (kitPrecio === 0) {
      customizedImageElement.src = originalImageUrl;
      customizedImageElement.style.opacity = '1';
      return;
    }
    
    try {
      let imageUrl = await productosManager.getCustomizationImage(vehiculo.id, kitId);
      
      if (!imageUrl) {
        imageUrl = originalImageUrl;
      }
      
      const img = new Image();
      img.onload = () => {
        customizedImageElement.src = imageUrl;
        customizedImageElement.style.opacity = '1';
      };
      img.onerror = () => {
        customizedImageElement.src = originalImageUrl;
        customizedImageElement.style.opacity = '1';
      };
      img.src = imageUrl;
      
    } catch (error) {
      customizedImageElement.src = originalImageUrl;
      customizedImageElement.style.opacity = '1';
    }
  }

  static showAllVehiclesForCustomization() {
    this.closeModal('vehicleModal');
    this.closeModal('customizationModal');
    
    window.scrollTo({ top: document.getElementById('vehicles').offsetTop - 80, behavior: 'smooth' });
    this.showNotification("Selecciona un vehículo para personalizarlo.", "info");
  }

  static contactVehicle(vehicleId, kit = null) {
    const vehiculo = productosManager.getVehiculoById(vehicleId);
    if (!vehiculo) {
      this.showNotification("Vehículo no encontrado", "error");
      return;
    }
    
    const whatsappUrl = productosManager.getWhatsAppUrl(vehiculo, kit);
    window.open(whatsappUrl, '_blank');
  }
  
  static showMessage(message) {
    this.showNotification(message, 'info');
  }
}
