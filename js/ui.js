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
          window.scrollTo({ top: document.getElementById('vehicles').offsetTop - 44, behavior: 'smooth' });
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
  }
  
  // Mostrar loading
  static showLoading() {
    const container = document.getElementById('vehiclesContainer');
    if (container) {
      container.innerHTML = `
        <div class="loading-message">
          <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
          <p>Cargando vehículos desde la base de datos...</p>
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
    notification.className = 'notification';
    notification.innerHTML = `
      <div style="color: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--error)' : 'var(--warning)'};">
        ${type === 'success' ? '✓' : type === 'error' ? '✗' : '⚠'}
      </div>
      <div style="flex: 1;">
        <div style="font-weight: 500; font-size: 14px; margin-bottom: 4px; color: var(--black);">
          ${type === 'success' ? 'Éxito' : type === 'error' ? 'Error' : 'Advertencia'}
        </div>
        <div style="font-size: 13px; color: #86868b;">${message}</div>
      </div>
      <button style="background: none; border: none; color: #86868b; cursor: pointer; padding: 0;">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    container.appendChild(notification);
    
    // Asignar evento para cerrar
    notification.querySelector('button').addEventListener('click', () => {
      notification.remove();
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
    document.getElementById(modalId)?.classList.add('active');
    document.body.classList.add('modal-open');
  }
  
  // Cerrar modal
  static closeModal(modalId) {
    document.getElementById(modalId)?.classList.remove('active');
    document.body.classList.remove('modal-open');
  }
  
  // Actualizar contador
  static updateCounter(elementId, count) {
    document.getElementById(elementId).textContent = count;
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
    
    container.innerHTML = vehiculos.map(vehiculo => `
      <div class="vehicle-card fade-in" data-id="${vehiculo.id}">
        <img src="${vehiculo.imagenes[0]}" 
             alt="${vehiculo.nombre}" 
             class="vehicle-image"
             onerror="this.src='${CONFIG.app.defaultImage}'">
        <div class="vehicle-info">
          <div class="vehicle-status">
            ${vehiculo.estado === 'stock' ? 'En Stock Arica' : 
              vehiculo.estado === 'transit' ? 'En Tránsito' : 
              'Para Reservar'}
          </div>
          <h3 class="vehicle-title">${vehiculo.nombre}</h3>
          <div class="vehicle-price">${productosManager.formatPrice(vehiculo.precio)} CLP</div>
          <p style="color: #86868b; font-size: 14px; margin-bottom: 16px;">
            ${vehiculo.descripcion.substring(0, 80)}${vehiculo.descripcion.length > 80 ? '...' : ''}
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
    `).join('');
    
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
        this.customizeVehicle(id); // Abrir modal de personalización
      });
    });
  }
  
  // Lógica del Slider (NUEVO REQUISITO 1)
  static initImageSlider(sliderElement, images, vehiculoNombre) {
      const wrapper = sliderElement.querySelector('.slider-wrapper');
      const prevButton = sliderElement.querySelector('.slider-button-prev');
      const nextButton = sliderElement.querySelector('.slider-button-next');
      const totalSlides = images.length;
      let currentSlide = 0;
      
      // Limpiar y re-inyectar imágenes
      wrapper.innerHTML = images.map(url => `
          <div class="slider-slide">
            <img src="${url}" alt="Imagen de ${vehiculoNombre}" loading="lazy" onerror="this.src='${CONFIG.app.defaultImage}'">
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
  
  // Mostrar detalles del vehículo (Modal principal)
  static showVehicleDetails(vehicleId) {
    const vehiculo = productosManager.getVehiculoById(vehicleId);
    if (!vehiculo) {
      this.showNotification("Vehículo no encontrado", "error");
      return;
    }
    
    const modalContent = document.getElementById('vehicleModalContent');
    
    // Inyectar el HTML del modal con el contenedor del slider
    modalContent.innerHTML = `
      <div class="vehicle-details">
        
        <div class="image-gallery-container">
            <div id="vehicleImageSlider" class="slider-container">
                <div class="slider-wrapper">
                    </div>
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
          <h2 class="detail-title">${vehiculo.nombre}</h2>
          <div class="detail-price">${productosManager.formatPrice(vehiculo.precio)} CLP</div>
          <p class="detail-description">${vehiculo.descripcion}</p>
          
          <div class="detail-features">
            ${vehiculo.motor ? `<div><i class="fas fa-engine"></i> Motor: ${vehiculo.motor}</div>` : ''}
            ${vehiculo.kilometraje ? `<div><i class="fas fa-road"></i> KM: ${vehiculo.kilometraje}</div>` : ''}
            ${vehiculo.ano ? `<div><i class="fas fa-calendar"></i> Año: ${vehiculo.ano}</div>` : ''}
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
    this.initImageSlider(sliderElement, vehiculo.imagenes, vehiculo.nombre);
    
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
  
  // Mostrar modal de personalización (NUEVO REQUISITO 2 & 3)
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
    modalContent.innerHTML = `
        <div class="customization-header">
            <h3>Personaliza tu ${vehiculo.nombre}</h3>
            <p>Selecciona un paquete de mejora para ver la comparación visual.</p>
        </div>

        <div class="comparison-container">
            <div class="comparison-panel original-vehicle">
                <h3>Vehículo Base</h3>
                <img id="originalVehicleImage" src="${vehiculo.imagen_principal_card}" alt="Vehículo Original">
            </div>
            <div class="comparison-panel customized-vehicle">
                <h3>Con Kit <span id="selectedKitName">...</span></h3>
                <img id="customizedVehicleImage" src="${vehiculo.imagen_principal_card}" alt="Vehículo Personalizado">
            </div>
        </div>

        <h4>Seleccionar Paquete de Mejora:</h4>
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
        
        <div class="customization-summary">
            <div class="summary-line">
                <span>Precio Vehículo Base:</span>
                <span class="price-value">${productosManager.formatPrice(vehiculo.precio)} CLP</span>
            </div>
            <div class="summary-line">
                <span>Costo Kit Seleccionado:</span>
                <span class="price-value" id="kitPriceValue">...</span>
            </div>
            <div class="summary-total">
                <span>Precio Total Estimado:</span>
                <span class="price-value" id="totalPriceValue">...</span>
            </div>
        </div>

        <button class="button whatsapp-btn" id="requestQuote" style="margin-top: 24px;">
            <i class="fab fa-whatsapp"></i> Solicitar Cotización con este Kit
        </button>
    `;
    
    // 1. Asignar Event Listeners a los botones de kits
    const kitSelectionContainer = document.getElementById('kitSelectionContainer');
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

    // 2. Inicializar con el kit Standar (o el primero)
    const defaultKitButton = kitSelectionContainer.querySelector('.kit-button[data-default-kit="true"]') || kitSelectionContainer.querySelector('.kit-button');
    if (defaultKitButton) {
        defaultKitButton.click();
    }
    
    // 3. Evento para solicitar cotización
    document.getElementById('requestQuote')?.addEventListener('click', () => {
        // Obtener el kit seleccionado
        const selectedButton = kitSelectionContainer.querySelector('.kit-button.active');
        const selectedKit = productosManager.getKitsForDisplay().find(k => k.id === selectedButton?.dataset.kitId);
        
        this.contactVehicle(vehiculo.id, selectedKit);
    });
    
    this.showModal('customizationModal');
  }

  // Lógica para seleccionar un kit y actualizar la imagen de comparación
  static async selectKit(vehiculo, kitId, kitNombre, kitPrecio) {
      const originalImageUrl = vehiculo.imagen_principal_card;
      const customizedImageElement = document.getElementById('customizedVehicleImage');
      const selectedKitNameElement = document.getElementById('selectedKitName');
      const kitPriceValueElement = document.getElementById('kitPriceValue');
      const totalPriceValueElement = document.getElementById('totalPriceValue');
      
      // Actualizar nombres y precios inmediatamente
      selectedKitNameElement.textContent = kitNombre;
      kitPriceValueElement.textContent = `+${productosManager.formatPrice(kitPrecio)} CLP`;
      const totalPrice = (vehiculo.precio || 0) + kitPrecio;
      totalPriceValueElement.textContent = `${productosManager.formatPrice(totalPrice)} CLP`;

      // Si es el kit "Standar" (precio 0), usamos la imagen original inmediatamente
      if (kitPrecio === 0 || vehiculo.id === kitId) {
          customizedImageElement.src = originalImageUrl;
          return;
      }
      
      // Intentar obtener la imagen personalizada de Supabase
      // Puedes añadir un spinner visual en tu HTML/CSS mientras carga
      let imageUrl = await productosManager.getCustomizationImage(vehiculo.id, kitId);
      
      // Si se encuentra la imagen, úsala. Si no, usa la imagen original como fallback.
      customizedImageElement.src = imageUrl || originalImageUrl; 
  }

  // Mostrar todos los vehículos para personalización (se mantiene)
  static showAllVehiclesForCustomization() {
    this.closeModal('vehicleModal');
    this.closeModal('customizationModal');
    
    // Para simplificar, simplemente navegaremos a la sección de vehículos
    window.scrollTo({ top: document.getElementById('vehicles').offsetTop - 44, behavior: 'smooth' });
    this.showNotification("Selecciona un vehículo para personalizarlo.", "info");
  }

  // Contactar vehículo (se mantiene, pero ahora acepta el objeto kit)
  static contactVehicle(vehicleId, kit = null) {
    const vehiculo = productosManager.getVehiculoById(vehicleId);
    if (!vehiculo) {
      this.showNotification("Vehículo no encontrado", "error");
      return;
    }
    
    const whatsappUrl = productosManager.getWhatsAppUrl(vehiculo, kit);
    window.open(whatsappUrl, '_blank');
  }
}
