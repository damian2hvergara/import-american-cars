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
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (!menuToggle || !mobileMenu) return;
    
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
    });
    
    // Cerrar menú al hacer click en un link
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
      });
    });
    
    // Cerrar al hacer click fuera
    document.addEventListener('click', (e) => {
      if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        mobileMenu.classList.remove('active');
      }
    });
  }
  
  // Mostrar loading
  static showLoading() {
    const container = document.getElementById('vehiclesContainer');
    if (container) {
      container.innerHTML = `
        <div class="loading-message" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
          <div class="loading-spinner" style="font-size: 40px; margin-bottom: 20px; color: var(--text-tertiary);">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
          <p style="font-size: 17px; color: var(--text-secondary);">Cargando vehículos desde la base de datos...</p>
        </div>
      `;
    }
  }
  
  // Ocultar loading
  static hideLoading() {
    // Se maneja en renderVehiculosGrid
  }
  
  // Mostrar notificación - CORREGIDO
  static showNotification(message, type = 'success') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'i'
    };
    
    const colors = {
      success: '#34C759',
      error: '#FF3B30',
      warning: '#FF9500',
      info: '#007AFF'
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
        ${icons[type]}
      </div>
      <div style="flex: 1; min-width: 0;">
        <div style="font-size: 14px; font-weight: 500; color: var(--text-primary);">
          ${type === 'success' ? 'Éxito' : type === 'error' ? 'Error' : type === 'warning' ? 'Advertencia' : 'Información'}
        </div>
        <div style="font-size: 13px; color: var(--text-secondary); overflow-wrap: break-word;">${message}</div>
      </div>
      <button style="
        background: none;
        border: none;
        color: var(--text-tertiary);
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
    
    // Cerrar al hacer click en el botón
    notification.querySelector('button').addEventListener('click', () => {
      notification.style.transform = 'translateX(100%)';
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    });
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);
  }
  
  // Mostrar mensaje de error
  static showError(message) {
    this.showNotification(message, 'error');
  }
  
  // Mostrar modal - CORREGIDO
  static showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // Resetear transformación
    const content = modal.querySelector('.modal-content');
    if (content) {
      content.style.transform = 'scale(0.95) translateY(20px)';
      content.style.opacity = '0';
    }
    
    // Mostrar modal
    modal.classList.add('active');
    document.body.classList.add('modal-open');
    
    // Forzar reflow para animación
    setTimeout(() => {
      if (content) {
        content.style.transform = 'scale(1) translateY(0)';
        content.style.opacity = '1';
      }
    }, 10);
  }
  
  // Cerrar modal - CORREGIDO
  static closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    const content = modal.querySelector('.modal-content');
    if (content) {
      content.style.transform = 'scale(0.95) translateY(20px)';
      content.style.opacity = '0';
    }
    
    setTimeout(() => {
      modal.classList.remove('active');
      document.body.classList.remove('modal-open');
    }, 150);
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
  
  // Renderizar grid de vehículos - CORREGIDO
  static renderVehiculosGrid(vehiculos) {
    const container = document.getElementById('vehiclesContainer');
    if (!container) return;
    
    if (!vehiculos || vehiculos.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
          <div style="font-size: 48px; margin-bottom: 20px; color: var(--text-tertiary);">
            <i class="fas fa-car"></i>
          </div>
          <h3 style="font-size: 21px; font-weight: 600; margin-bottom: 12px; color: var(--text-primary);">
            No hay vehículos disponibles
          </h3>
          <p style="color: var(--text-secondary); margin-bottom: 20px;">
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
            <p style="color: var(--text-secondary); font-size: 15px; margin-bottom: 16px; line-height: 1.5; min-height: 45px;">
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
  
  // Lógica del Slider - CORREGIDO
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
    sliderElement.classList.toggle('single-image', totalSlides <= 1);
    
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
  
  // Mostrar detalles del vehículo (Modal principal) - CORREGIDO
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
    
    // Inyectar el HTML del modal con el contenedor del slider
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
  
// Mostrar modal de personalización - CORREGIDO
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
  
  // ⚠️ REEMPLAZA DESDE AQUÍ (línea ~480)
  modalContent.innerHTML = `
    <div class="customization-header">
      <h3>Personaliza tu ${vehiculo.nombre || 'Vehículo'}</h3>
      <p>Selecciona un paquete de mejora para ver la comparación visual</p>
    </div>

    <div class="comparison-container">
      <div class="comparison-panel original-vehicle">
        <h3>Vehículo Base</h3>
        <img id="originalVehicleImage" src="${imagenPrincipal}" alt="Vehículo Original"
             onerror="this.src='${CONFIG.app.defaultImage}'; this.onerror=null">
      </div>
      <div class="comparison-panel customized-vehicle">
        <h3>Con Kit <span id="selectedKitName">Standard</span></h3>
        <img id="customizedVehicleImage" src="${imagenPrincipal}" alt="Vehículo Personalizado"
             onerror="this.src='${CONFIG.app.defaultImage}'; this.onerror=null">
      </div>
    </div>

    <div style="margin: var(--space-3xl) 0 var(--space-2xl);">
      <h4 style="font-size: 17px; font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-lg); text-align: center;">
        Seleccionar Paquete de Mejora
      </h4>
      <div id="kitSelectionContainer" class="kit-selection-controls">
        ${kits.map(kit => `
          <button class="button kit-button" 
                  data-kit-id="${kit.id}" 
                  data-vehiculo-id="${vehiculo.id}"
                  data-kit-precio="${kit.precio}"
                  data-kit-nombre="${kit.nombre}"
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
  `;
  // ⚠️ HASTA AQUÍ
  
  // El resto del código se mantiene igual...
  // 1. Asignar Event Listeners a los botones de kits
  const kitSelectionContainer = document.getElementById('kitSelectionContainer');
  if (kitSelectionContainer) {
    kitSelectionContainer.querySelectorAll('.kit-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const kitId = e.currentTarget.dataset.kitId;
        const kitNombre = e.currentTarget.dataset.kitNombre;
        const kitPrecio = parseFloat(e.currentTarget.dataset.kitPrecio);
        
        // Llama a la lógica de selección y comparación
        this.selectKit(vehiculo, kitId, kitNombre, kitPrecio);
        
        // Actualizar clase active inmediatamente
        kitSelectionContainer.querySelectorAll('.kit-button').forEach(btn => btn.classList.remove('active'));
        e.currentTarget.classList.add('active');
      });
    });

    // 2. Inicializar con el kit Standard (o el primero)
    const defaultKitButton = kitSelectionContainer.querySelector('.kit-button[data-default-kit="true"]') || 
                            kitSelectionContainer.querySelector('.kit-button');
    if (defaultKitButton) {
      defaultKitButton.click();
    }
  }
  
  // 3. Evento para solicitar cotización
  document.getElementById('requestQuote')?.addEventListener('click', () => {
    // Obtener el kit seleccionado
    const selectedButton = kitSelectionContainer?.querySelector('.kit-button.active');
    const selectedKit = selectedButton ? 
      productosManager.getKitsForDisplay().find(k => k.id === selectedButton.dataset.kitId) : 
      kits[0];
    
    this.contactVehicle(vehiculo.id, selectedKit);
  });
  
  this.showModal('customizationModal');
}

  // CORREGIDO: Lógica para seleccionar un kit y actualizar la imagen de comparación
  static async selectKit(vehiculo, kitId, kitNombre, kitPrecio) {
    const originalImageUrl = vehiculo.imagen_principal_card || vehiculo.imagenes?.[0] || CONFIG.app.defaultImage;
    const customizedImageElement = document.getElementById('customizedVehicleImage');
    const selectedKitNameElement = document.getElementById('selectedKitName');
    const kitPriceValueElement = document.getElementById('kitPriceValue');
    const totalPriceValueElement = document.getElementById('totalPriceValue');
    
    if (!customizedImageElement || !selectedKitNameElement || !kitPriceValueElement || !totalPriceValueElement) {
      console.error('❌ Elementos del DOM no encontrados en selectKit');
      return;
    }
    
    // Mostrar loading
    customizedImageElement.style.opacity = '0.7';
    
    // Actualizar nombres y precios inmediatamente
    selectedKitNameElement.textContent = kitNombre;
    kitPriceValueElement.textContent = kitPrecio > 0 ? `+${productosManager.formatPrice(kitPrecio)}` : 'INCLUIDO';
    const totalPrice = (vehiculo.precio || 0) + kitPrecio;
    totalPriceValueElement.textContent = `${productosManager.formatPrice(totalPrice)}`;

    // Si es el kit "Standard" (precio 0), usar imagen original
    if (kitPrecio === 0) {
      customizedImageElement.src = originalImageUrl;
      customizedImageElement.style.opacity = '1';
      return;
    }
    
    try {
      // Intentar obtener la imagen personalizada de Supabase
      let imageUrl = await productosManager.getCustomizationImage(vehiculo.id, kitId);
      
      // Si no hay imagen personalizada, usar la imagen base
      if (!imageUrl) {
        console.log(`ℹ️ No hay imagen personalizada para ${kitNombre}. Usando imagen base.`);
        imageUrl = originalImageUrl;
      }
      
      // Precargar la imagen
      const img = new Image();
      img.onload = () => {
        customizedImageElement.src = imageUrl;
        customizedImageElement.style.opacity = '1';
      };
      img.onerror = () => {
        console.warn(`⚠️ Error al cargar imagen personalizada: ${imageUrl}`);
        customizedImageElement.src = originalImageUrl;
        customizedImageElement.style.opacity = '1';
      };
      img.src = imageUrl;
      
    } catch (error) {
      console.error('❌ Error al cargar imagen de kit:', error);
      customizedImageElement.src = originalImageUrl;
      customizedImageElement.style.opacity = '1';
    }
  }

  // Mostrar todos los vehículos para personalización
  static showAllVehiclesForCustomization() {
    this.closeModal('vehicleModal');
    this.closeModal('customizationModal');
    
    window.scrollTo({ top: document.getElementById('vehicles').offsetTop - 80, behavior: 'smooth' });
    this.showNotification("Selecciona un vehículo para personalizarlo.", "info");
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
