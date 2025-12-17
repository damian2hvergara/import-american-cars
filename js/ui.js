import { CONFIG } from './config.js';
import { productosManager } from './productos.js';

// CLASE PARA GESTIONAR LA INTERFAZ DE USUARIO
export class UI {
  
  // INICIALIZAR EVENTOS Y CONFIGURACIONES
  static init() {
    console.log('🎨 Inicializando interfaz de usuario...');
    this.initEventListeners();
    this.initMobileMenu();
  }
  
  // CONFIGURAR TODOS LOS EVENT LISTENERS
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
          // Desplazar suavemente a la sección de vehículos
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
  
  // CONFIGURAR MENÚ MÓVIL
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
  
  // MOSTRAR INDICADOR DE CARGA
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
  
  // OCULTAR INDICADOR DE CARGA
  static hideLoading() {
    // Se maneja automáticamente en renderVehiculosGrid
  }
  
  // MOSTRAR NOTIFICACIÓN TEMPORAL
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
      background: ${type === 'success' ? '#34C759' : type === 'error' ? '#FF3B30' : '#007AFF'};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      margin-bottom: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
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
  
  // MOSTRAR ERROR
  static showError(message) {
    this.showNotification(message, 'error');
  }
  
  // ACTUALIZAR CONTADORES EN LA PANTALLA
  static updateCounter(elementId, count) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = count;
      console.log(`🔢 Contador ${elementId}: ${count}`);
    }
  }
  
  // ACTUALIZAR BOTONES DE FILTRO ACTIVO
  static updateFilterButtons(activeFilter) {
    document.querySelectorAll('.filter-button').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.filter === activeFilter) {
        btn.classList.add('active');
      }
    });
  }
  
  // RENDERIZAR GRID DE VEHÍCULOS
  static renderVehiculosGrid(vehiculos) {
    const container = document.getElementById('vehiclesContainer');
    if (!container) {
      console.error('❌ No se encontró el contenedor de vehículos');
      return;
    }
    
    console.log(`🎨 Renderizando ${vehiculos.length} vehículos...`);
    
    // Si no hay vehículos que mostrar
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
    
    // Crear HTML para cada vehículo
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
                <i class="fas fa-crown"></i> Personalizar
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    // ASIGNAR EVENTOS A LAS TARJETAS
    console.log('🔗 Asignando eventos a tarjetas...');
    
    // Evento para abrir detalles al hacer click en la tarjeta
    container.querySelectorAll('.vehicle-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
          const id = card.dataset.id;
          console.log(`📄 Abriendo detalles del vehículo: ${id}`);
          this.showVehicleDetails(id);
        }
      });
    });
    
    // Evento para botón "Consultar" (WhatsApp)
    container.querySelectorAll('button[data-action="consultar"]').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = button.dataset.id;
        console.log(`💬 Consultando vehículo: ${id}`);
        this.contactVehicle(id);
      });
    });
    
    // Evento para botón "Personalizar" (Kits)
    container.querySelectorAll('button[data-action="kits"]').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = button.dataset.id;
        console.log(`🎨 Personalizando vehículo: ${id}`);
        this.customizeVehicle(id);
      });
    });
    
    console.log('✅ Grid de vehículos renderizado');
  }
  
  // MOSTRAR DETALLES DE UN VEHÍCULO (MODAL)
  static showVehicleDetails(vehicleId) {
    console.log(`🔍 Mostrando detalles del vehículo ${vehicleId}...`);
    
    const vehiculo = productosManager.getVehiculoById(vehicleId);
    if (!vehiculo) {
      this.showError("Vehículo no encontrado");
      return;
    }
    
    // Aquí iría el código para el modal de detalles
    this.showNotification(`Detalles de ${vehiculo.nombre} - Función en desarrollo`, 'info');
  }
  
  // PERSONALIZAR VEHÍCULO CON KITS
  static customizeVehicle(vehicleId) {
    console.log(`🛠️ Personalizando vehículo ${vehicleId}...`);
    
    const vehiculo = productosManager.getVehiculoById(vehicleId);
    if (!vehiculo) {
      this.showError("Vehículo no encontrado");
      return;
    }
    
    // Aquí iría el código para el modal de personalización
    this.showNotification(`Personalizando ${vehiculo.nombre} - Función en desarrollo`, 'info');
  }
  
  // CONTACTAR VEHÍCULO VÍA WHATSAPP
  static contactVehicle(vehicleId, kit = null) {
    console.log(`📱 Contactando vehículo ${vehicleId}...`);
    
    const vehiculo = productosManager.getVehiculoById(vehicleId);
    if (!vehiculo) {
      this.showError("Vehículo no encontrado");
      return;
    }
    
    const whatsappUrl = productosManager.getWhatsAppUrl(vehiculo, kit);
    console.log(`🌐 Abriendo WhatsApp: ${whatsappUrl.substring(0, 100)}...`);
    window.open(whatsappUrl, '_blank');
  }
  
  // MOSTRAR TODOS LOS VEHÍCULOS PARA PERSONALIZACIÓN
  static showAllVehiclesForCustomization() {
    console.log('🚗 Mostrando todos los vehículos para personalización...');
    
    const vehiculos = productosManager.vehiculos;
    if (!vehiculos || vehiculos.length === 0) {
      this.showError("Primero carga los vehículos");
      return;
    }
    
    // Aquí iría el código para el modal de selección
    this.showNotification(`Seleccionar vehículo para personalizar - Función en desarrollo`, 'info');
  }
}

// HACER LA CLASE DISPONIBLE GLOBALMENTE
window.UI = UI;
