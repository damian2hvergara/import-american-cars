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
        this.customizeVehicle(id);
      });
    });
  }
  
  // Mostrar detalles del vehículo
  static async showVehicleDetails(vehicleId) {
    const vehiculo = productosManager.getVehiculoById(vehicleId);
    if (!vehiculo) {
      this.showNotification("Vehículo no encontrado", "error");
      return;
    }
    
    const modalContent = document.getElementById('vehicleModalContent');
    
    modalContent.innerHTML = `
      <div style="padding: 0;">
        <div style="width: 100%; height: 400px; overflow: hidden; background: var(--gray-50);">
          <img src="${vehiculo.imagenes[0]}" 
               alt="${vehiculo.nombre}" 
               style="width: 100%; height: 100%; object-fit: contain;"
               onerror="this.src='${CONFIG.app.defaultImage}'">
        </div>
        
        ${vehiculo.imagenes.length > 1 ? `
        <div style="display: flex; gap: 12px; padding: 20px; justify-content: center; background: var(--white); border-top: var(--border);">
          ${vehiculo.imagenes.map((img, index) => `
            <img src="${img}" 
                 alt="Vista ${index + 1}" 
                 style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: var(--border);"
                 onclick="document.querySelector('#vehicleModalContent img').src='${img}'"
                 onerror="this.src='${CONFIG.app.defaultImage}'">
          `).join('')}
        </div>
        ` : ''}
        
        <div style="padding: 32px;">
          <h2 style="font-size: 28px; font-weight: 700; margin-bottom: 8px;">${vehiculo.nombre}</h2>
          <div class="vehicle-status" style="margin-bottom: 16px;">
            ${vehiculo.estado === 'stock' ? 'En Stock Arica' : 
              vehiculo.estado === 'transit' ? 'En Tránsito' : 
              'Para Reservar'}
          </div>
          
          <p style="color: #86868b; margin-bottom: 24px; font-size: 15px; line-height: 1.5;">
            ${vehiculo.descripcion}
          </p>
          
          <div style="background: var(--gray-50); padding: 20px; border-radius: var(--radius); margin-bottom: 32px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 32px; font-weight: 700;">${productosManager.formatPrice(vehiculo.precio)} CLP</div>
                <div style="color: #86868b; font-size: 14px;">
                  ${vehiculo.ubicacion} • ${vehiculo.eta || 'Disponible'}
                </div>
              </div>
              <button class="button" id="customizeFromModal" style="width: auto; padding: 12px 24px;">
                <i class="fas fa-crown"></i> Ver Kits Upgrade
              </button>
            </div>
          </div>
          
          <div style="display: flex; gap: 12px;">
            <button class="button" id="whatsappFromModal" style="flex: 1;">
              <i class="fab fa-whatsapp"></i> Reservar Ahora
            </button>
            <button class="button button-outline" id="customizeBtn" style="flex: 1;">
              <i class="fas fa-crown"></i> Personalizar
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Asignar eventos dentro del modal
    document.getElementById('customizeFromModal')?.addEventListener('click', () => {
      this.customizeVehicle(vehicleId);
    });
    
    document.getElementById('whatsappFromModal')?.addEventListener('click', () => {
      this.contactVehicle(vehicleId);
    });
    
    document.getElementById('customizeBtn')?.addEventListener('click', () => {
      this.customizeVehicle(vehicleId);
    });
    
    this.showModal('vehicleModal');
  }
  
  // Mostrar modal de personalización
  static async customizeVehicle(vehicleId) {
    const vehiculo = productosManager.getVehiculoById(vehicleId);
    if (!vehiculo) {
      this.showNotification("Vehículo no encontrado", "error");
      return;
    }
    
    try {
      const kits = await supabaseService.getKitsByVehiculo(vehiculo.id);
      
      const modalContent = document.getElementById('customizationContent');
      
      modalContent.innerHTML = `
        <div style="padding: 32px; background: var(--gray-50); display: flex; align-items: center; justify-content: center;">
          <div style="text-align: center; width: 100%;">
            <div id="comparisonVisual" style="max-width: 100%;">
              <img src="${vehiculo.imagenes[0]}" 
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
              ${kits.map(kit => `
                <div class="option-item ${kit.id === 'standar' ? 'selected' : ''}" 
                     data-kit="${kit.id}"
                     style="cursor: pointer; border: var(--border); border-radius: var(--radius); padding: 16px; transition: all 0.3s; text-align: center; background: var(--white);">
                  <div style="width: 60px; height: 60px; background: ${kit.id === 'full' ? 'var(--gold)' : kit.id === 'medium' ? 'var(--silver)' : 'var(--bronze)'}; 
                       border-radius: 30px; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; color: ${kit.id === 'full' ? 'black' : 'white'};">
                    ${kit.id === 'full' ? '<i class="fas fa-crown"></i>' : 
                      kit.id === 'medium' ? '<i class="fas fa-medal"></i>' : 
                      '<i class="fas fa-star"></i>'}
                  </div>
                  <div style="font-size: 16px; font-weight: 600; margin-bottom: 6px;">${kit.nombre}</div>
                  <div style="font-size: 14px; font-weight: 500; margin-bottom: 8px; color: ${kit.id === 'full' ? 'var(--gold)' : kit.id === 'medium' ? 'var(--silver)' : 'var(--bronze)'};">
                    ${kit.precio > 0 ? `+${productosManager.formatPrice(kit.precio)}` : '<span style="color: var(--success);">INCLUIDO</span>'}
                  </div>
                  <div style="font-size: 12px; color: #86868b; line-height: 1.4;">${kit.descripcion}</div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div style="margin-top: 32px; padding: 24px; background: var(--gray-50); border-radius: var(--radius); border: var(--border);">
            <div style="margin-bottom: 16px;">
              <div style="font-size: 13px; color: #86868b; margin-bottom: 8px;">Vehículo base</div>
              <div style="font-weight: 500; margin-bottom: 4px;">${vehiculo.nombre}</div>
              <div style="font-size: 24px; font-weight: 700;">${productosManager.formatPrice(vehiculo.precio)} CLP</div>
            </div>
            
            <div id="selectedOptionsList" style="margin-bottom: 16px;"></div>
            
            <div style="border-top: var(--border); padding-top: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="font-weight: 600;">Total con Upgrade</div>
                <div style="font-size: 28px; font-weight: 700;" id="totalPrice">${productosManager.formatPrice(vehiculo.precio)} CLP</div>
              </div>
            </div>
            
            <button class="button" id="requestQuote" style="margin-top: 24px;">
              <i class="fab fa-whatsapp"></i> Solicitar Cotización
            </button>
          </div>
        </div>
      `;
      
      // Inicializar con kit standar seleccionado
      this.updateKitSelection(vehiculo, kits[0]);
      
      // Asignar eventos a los kits
      document.querySelectorAll('#kitsOptions .option-item').forEach(item => {
        item.addEventListener('click', () => {
          const kitId = item.dataset.kit;
          const kit = kits.find(k => k.id === kitId);
          if (kit) {
            this.updateKitSelection(vehiculo, kit);
            
            // Actualizar selección visual
            document.querySelectorAll('#kitsOptions .option-item').forEach(i => {
              i.classList.remove('selected');
            });
            item.classList.add('selected');
          }
        });
      });
      
      // Evento para solicitar cotización
      document.getElementById('requestQuote')?.addEventListener('click', () => {
        const selectedKitElement = document.querySelector('#kitsOptions .option-item.selected');
        const kitId = selectedKitElement?.dataset.kit;
        const kit = kits.find(k => k.id === kitId) || kits[0];
        
        window.open(productosManager.getWhatsAppUrl(vehiculo, kit), '_blank');
        this.closeModal('customizationModal');
      });
      
      this.showModal('customizationModal');
      
    } catch (error) {
      console.error('Error cargando kits:', error);
      this.showNotification('Error al cargar los kits de personalización', 'error');
    }
  }
  
  // Actualizar selección de kit
  static updateKitSelection(vehiculo, kit) {
    const badgeColor = kit.id === 'full' ? 'var(--gold)' : 
                      kit.id === 'medium' ? 'var(--silver)' : 'var(--bronze)';
    const textColor = kit.id === 'full' ? 'black' : 'white';
    const icon = kit.id === 'full' ? 'fa-crown' : 
                kit.id === 'medium' ? 'fa-medal' : 'fa-star';
    
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
            <div style="font-size: 13px; color: #86868b;">${kit.descripcion}</div>
          </div>
          <div style="font-weight: 700; color: var(--black); font-size: 16px;">
            ${kit.precio > 0 ? `+${productosManager.formatPrice(kit.precio)}` : '<span style="color: var(--success);">INCLUIDO</span>'}
          </div>
        </div>
      `;
    }
    
    const totalPrice = document.getElementById('totalPrice');
    if (totalPrice) {
      const basePrice = vehiculo.precio || 0;
      const kitPrice = kit.precio || 0;
      const total = basePrice + kitPrice;
      
      if (kitPrice > 0) {
        totalPrice.innerHTML = `
          ${productosManager.formatPrice(total)} 
          <span style="font-size: 14px; color: var(--success); margin-left: 4px;">
            (+${productosManager.formatPrice(kitPrice)})
          </span>
        `;
      } else {
        totalPrice.textContent = `${productosManager.formatPrice(total)} CLP`;
      }
    }
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
          ${vehiculos.map(vehiculo => `
            <div data-id="${vehiculo.id}" 
                 style="cursor: pointer; border: var(--border); border-radius: var(--radius); padding: 20px; text-align: center; transition: all 0.3s; background: var(--white);">
              <img src="${vehiculo.imagenes[0]}" 
                   style="width: 100%; height: 120px; object-fit: cover; border-radius: 6px; margin-bottom: 12px;"
                   onerror="this.src='${CONFIG.app.defaultImage}'">
              <div style="font-weight: 500; margin-bottom: 4px; font-size: 15px; color: var(--black);">${vehiculo.nombre}</div>
              <div style="font-size: 13px; color: #86868b; margin-bottom: 8px;">
                ${vehiculo.descripcion.substring(0, 60)}${vehiculo.descripcion.length > 60 ? '...' : ''}
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
                <div style="font-size: 17px; font-weight: 600;">${productosManager.formatPrice(vehiculo.precio)}</div>
                <div class="vehicle-status" style="font-size: 11px; padding: 4px 8px;">
                  ${vehiculo.estado === 'stock' ? 'En Stock' : 
                    vehiculo.estado === 'transit' ? 'En Tránsito' : 
                    'Reserva'}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    // Asignar eventos
    modalContent.querySelectorAll('[data-id]').forEach(card => {
      card.addEventListener('click', () => {
        const vehicleId = card.dataset.id;
        this.customizeVehicle(vehicleId);
      });
      
      card.addEventListener('mouseover', () => {
        card.style.transform = 'translateY(-2px)';
        card.style.boxShadow = 'var(--shadow)';
      });
      
      card.addEventListener('mouseout', () => {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = 'none';
      });
    });
    
    this.showModal('customizationModal');
  }
  
  // Contactar por WhatsApp
  static contactVehicle(vehicleId) {
    const vehiculo = productosManager.getVehiculoById(vehicleId);
    if (!vehiculo) return;
    
    window.open(productosManager.getWhatsAppUrl(vehiculo), '_blank');
  }
  
  // Mostrar modal
  static showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'block';
      document.body.style.overflow = 'hidden';
    }
  }
  
  // Cerrar modal
  static closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
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
  
  // Mostrar mensaje
  static showMessage(message) {
    this.showNotification(message, 'info');
  }
  
  // Mostrar error
  static showError(message) {
    this.showNotification(message, 'error');
  }
}
