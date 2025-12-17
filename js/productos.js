import { CONFIG } from './config.js';
import { supabaseService } from './supabase.js';

// Gestión de productos/vehículos
export class ProductosManager {
  constructor() {
    this.vehiculos = [];
    this.kits = [];
    this.currentFilter = "all";
    this.UI = null; // Referencia a UI (se asignará después)
  }
  
  // Método para asignar UI después de cargada
  setUI(uiInstance) {
    this.UI = uiInstance;
  }
  
  // Cargar vehículos y kits desde Supabase
  async cargarVehiculos() {
    try {
      console.log('🚗 === INICIANDO CARGA DE VEHÍCULOS Y KITS ===');
      this.mostrarLoading();
      
      // 1. Cargar Vehículos
      this.vehiculos = await supabaseService.getVehiculos();
      
      // 2. Cargar Kits
      this.kits = await supabaseService.getKits();
      
      console.log(`📦 Vehículos: ${this.vehiculos.length}, Kits: ${this.kits.length}`);
      
      if (!this.vehiculos || this.vehiculos.length === 0) {
        this.mostrarMensajeSinVehiculos();
        this.ocultarLoading();
        return;
      }
      
      this.vehiculos = this.vehiculos.map(vehiculo => {
        return this.procesarVehiculo(vehiculo);
      });
      
      this.actualizarContadores();
      this.renderVehiculos();
      this.ocultarLoading();
      
      console.log('✅ === CARGA COMPLETADA ===');
      
    } catch (error) {
      console.error('❌ Error cargando vehículos:', error);
      this.mostrarError('Error al cargar los vehículos. Intenta nuevamente.');
    }
  }
  
  // ========== MÉTODOS DE UI SIMPLIFICADOS ==========
  mostrarLoading() {
    const container = document.getElementById('vehiclesContainer');
    if (container) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
          <div style="font-size: 32px; margin-bottom: 16px; color: #86868b;">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
          <p style="color: #86868b;">Cargando vehículos...</p>
        </div>
      `;
    }
  }
  
  ocultarLoading() {
    // Se maneja automáticamente
  }
  
  mostrarMensajeSinVehiculos() {
    const container = document.getElementById('vehiclesContainer');
    if (container) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
          <div style="font-size: 48px; margin-bottom: 20px; color: #86868b;">
            <i class="fas fa-car"></i>
          </div>
          <h3 style="font-size: 21px; font-weight: 600; margin-bottom: 12px; color: var(--black);">
            No hay vehículos disponibles
          </h3>
          <p style="color: #86868b; margin-bottom: 20px;">
            Contáctanos para consultar disponibilidad.
          </p>
          <a href="https://wa.me/${CONFIG.contacto.whatsapp}" target="_blank" class="button whatsapp-btn" style="width: auto; padding: 12px 24px;">
            <i class="fab fa-whatsapp"></i> Consultar
          </a>
        </div>
      `;
    }
  }
  
  mostrarError(mensaje) {
    this.mostrarNotificacion(mensaje, 'error');
  }
  
  mostrarNotificacion(mensaje, tipo = 'info') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${tipo === 'error' ? '#FF3B30' : tipo === 'success' ? '#34C759' : '#007AFF'};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 9999;
      animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <i class="fas ${tipo === 'error' ? 'fa-exclamation-circle' : tipo === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
        <span>${mensaje}</span>
      </div>
    `;
    
    container.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
  }
  
  actualizarContadores() {
    const stockCount = this.vehiculos.filter(v => v.estado === 'stock').length;
    const transitCount = this.vehiculos.filter(v => v.estado === 'transit').length;
    const reserveCount = this.vehiculos.filter(v => v.estado === 'reserve').length;

    this.actualizarElemento('stockCount', stockCount);
    this.actualizarElemento('transitCount', transitCount);
    this.actualizarElemento('reserveCount', reserveCount);
  }
  
  actualizarElemento(id, valor) {
    const element = document.getElementById(id);
    if (element) element.textContent = valor;
  }
  
  // Resto de métodos (procesarVehiculo, formatPrice, etc.) se mantienen igual...
  procesarVehiculo(vehiculo) {
    // Tu código existente aquí...
    return vehiculo;
  }
  
  formatPrice(price) {
    if (CONFIG.app.mostrarPrecios === false) return 'Consultar';
    if (!price && price !== 0) return 'Consultar';
    const num = parseInt(price);
    if (isNaN(num) || num === 0) return 'Consultar';
    return '$' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  
  getWhatsAppUrl(vehiculo, kit = null) {
    // Tu código existente aquí...
    return `https://wa.me/${CONFIG.contacto.whatsapp}?text=${encodeURIComponent(mensaje)}`;
  }
  
  // ========== NUEVOS MÉTODOS FALTANTES ==========
  getKitsForDisplay() {
    // Kits por defecto si no hay en Supabase
    return [
      {
        id: "standar",
        nivel: "standar",
        nombre: "Standard",
        precio: 0,
        descripcion: "Preparación básica incluida",
        includes: [
          "Limpieza completa exterior e interior",
          "Revisión mecánica general",
          "Documentación en regla",
          "Cambio de aceite y filtros"
        ]
      },
      {
        id: "medium",
        nivel: "medium",
        nombre: "Medium",
        precio: 1200000,
        descripcion: "Mejoras estéticas y funcionales",
        includes: [
          "Todo lo del kit Standard",
          "Llantas deportivas 20\"",
          "Tinte de ventanas premium",
          "Step bar laterales"
        ]
      },
      {
        id: "full",
        nivel: "full",
        nombre: "Full",
        precio: 2500000,
        descripcion: "Transformación premium completa",
        includes: [
          "Todo lo del kit Medium",
          "Suspensión deportiva 2\"",
          "Rines Fuel 22\"",
          "Neumáticos Off-Road 35\""
        ]
      }
    ];
  }
  
  async getCustomizationImage(vehicleId, kitId) {
    // Por ahora devolver null (usará imagen por defecto)
    return null;
  }
  
  // Resto de métodos...
  getVehiculoById(id) {
    return this.vehiculos.find(v => v.id === id) || null;
  }
  
  filtrarVehiculos(filter) {
    this.currentFilter = filter;
    let vehiculosFiltrados = this.vehiculos;
    
    if (filter !== 'all') {
      vehiculosFiltrados = this.vehiculos.filter(v => v.estado === filter);
    }
    
    this.actualizarBotonesFiltro(filter);
    this.renderVehiculos(vehiculosFiltrados);
  }
  
  actualizarBotonesFiltro(filter) {
    document.querySelectorAll('.filter-button').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.filter === filter) {
        btn.classList.add('active');
      }
    });
  }
  
  renderVehiculos(vehiculos = this.vehiculos) {
    const container = document.getElementById('vehiclesContainer');
    if (!container) return;
    
    if (!vehiculos || vehiculos.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
          <div style="font-size: 48px; margin-bottom: 20px; color: #86868b;">
            <i class="fas fa-car"></i>
          </div>
          <h3 style="font-size: 21px; font-weight: 600; margin-bottom: 12px; color: var(--black);">
            No hay vehículos
          </h3>
          <button class="button" onclick="window.productosManager.filtrarVehiculos('all')" style="width: auto; padding: 10px 20px;">
            Ver todos
          </button>
        </div>
      `;
      return;
    }
    
    container.innerHTML = vehiculos.map(vehiculo => {
      const primeraImagen = vehiculo.imagenes?.[0] || CONFIG.app.defaultImage;
      
      return `
        <div class="vehicle-card" data-id="${vehiculo.id}">
          <img src="${primeraImagen}" 
               alt="${vehiculo.nombre}" 
               class="vehicle-image"
               onerror="this.src='${CONFIG.app.defaultImage}'">
          <div class="vehicle-info">
            <div class="vehicle-status">
              ${vehiculo.estado === 'stock' ? 'En Stock Arica' : 
                vehiculo.estado === 'transit' ? 'En Tránsito' : 
                'Para Reservar'}
            </div>
            <h3 class="vehicle-title">${vehiculo.nombre || 'Vehículo'}</h3>
            <div class="vehicle-price">${this.formatPrice(vehiculo.precio)}</div>
            <p style="color: #86868b; font-size: 14px; margin-bottom: 16px;">
              ${vehiculo.descripcion ? (vehiculo.descripcion.substring(0, 80) + '...') : 'Sin descripción'}
            </p>
            <div style="display: flex; gap: 8px;">
              <button class="button" onclick="window.open('${this.getWhatsAppUrl(vehiculo)}', '_blank')" style="flex: 1;">
                <i class="fab fa-whatsapp"></i> Consultar
              </button>
              <button class="button button-outline" onclick="window.UImanager.mostrarDetallesVehiculo('${vehiculo.id}')" style="flex: 1;">
                <i class="fas fa-eye"></i> Ver Detalles
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}

// Instancia global
export const productosManager = new ProductosManager();
