import { CONFIG } from './config.js';
import { supabaseService } from './supabase.js';

// Gestión de productos/vehículos
export class ProductosManager {
  constructor() {
    this.vehiculos = [];
    this.kits = [];
    this.currentFilter = "all";
    this.uiManager = null;
  }
  
  // Inyectar UIManager
  setUIManager(uiManager) {
    this.uiManager = uiManager;
  }
  
  // Cargar vehículos desde Supabase
  async cargarVehiculos() {
    try {
      console.log('🚗 === INICIANDO CARGA DE VEHÍCULOS ===');
      this.mostrarLoading();
      
      // 1. Cargar Vehículos desde Supabase
      this.vehiculos = await supabaseService.getVehiculos();
      
      console.log(`📦 Vehículos cargados: ${this.vehiculos.length}`);
      
      if (!this.vehiculos || this.vehiculos.length === 0) {
        this.mostrarMensajeSinVehiculos();
        this.ocultarLoading();
        return;
      }
      
      // 2. Procesar vehículos
      this.vehiculos = this.vehiculos.map(vehiculo => {
        return this.procesarVehiculo(vehiculo);
      });
      
      // 3. Cargar Kits
      this.kits = this.getKitsForDisplay();
      console.log(`🔧 Kits cargados: ${this.kits.length}`);
      
      // 4. Actualizar UI
      this.actualizarContadores();
      this.renderVehiculos();
      this.ocultarLoading();
      
      console.log('✅ === CARGA COMPLETADA ===');
      
    } catch (error) {
      console.error('❌ Error cargando vehículos:', error);
      this.mostrarError('Error al cargar los vehículos. Intenta nuevamente.');
    }
  }
  
  // ========== MÉTODOS DE UI ==========
  mostrarLoading() {
    const container = document.getElementById('vehiclesContainer');
    if (container) {
      container.innerHTML = `
        <div class="loading-placeholder">
          <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
          <p>Cargando vehículos desde la base de datos...</p>
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
        <div class="empty-state">
          <div class="empty-state-icon">
            <i class="fas fa-car"></i>
          </div>
          <h3 class="empty-state-title">No hay vehículos disponibles</h3>
          <p class="empty-state-message">
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
    // Usar UIManager si está disponible
    if (this.uiManager && this.uiManager.showError) {
      this.uiManager.showError(mensaje);
    } else if (window.UIManager && window.UIManager.showError) {
      window.UIManager.showError(mensaje);
    } else {
      console.error('Error:', mensaje);
    }
  }
  
  actualizarContadores() {
    const stockCount = this.vehiculos.filter(v => v.estado === 'stock').length;
    const transitCount = this.vehiculos.filter(v => v.estado === 'transit').length;
    const reservedCount = this.vehiculos.filter(v => v.estado === 'reserved').length;

    // Usar UIManager si está disponible
    if (this.uiManager && this.uiManager.updateCounter) {
      this.uiManager.updateCounter('stockCount', stockCount);
      this.uiManager.updateCounter('transitCount', transitCount);
      this.uiManager.updateCounter('reservedCount', reservedCount);
    } else if (window.UIManager && window.UIManager.updateCounter) {
      window.UIManager.updateCounter('stockCount', stockCount);
      window.UIManager.updateCounter('transitCount', transitCount);
      window.UIManager.updateCounter('reservedCount', reservedCount);
    } else {
      // Fallback manual
      this.actualizarElemento('stockCount', stockCount);
      this.actualizarElemento('transitCount', transitCount);
      this.actualizarElemento('reservedCount', reservedCount);
    }
  }
  
  actualizarElemento(id, valor) {
    const element = document.getElementById(id);
    if (element) element.textContent = valor;
  }
  
  // ========== MÉTODOS DE PROCESAMIENTO ==========
  procesarVehiculo(vehiculo) {
    // Asegurar que imagenes sea un array
    const imagenes = Array.isArray(vehiculo.imagenes) ? vehiculo.imagenes : [];
    
    // Determinar estado (usar 'reserved' en lugar de 'reserve')
    let estado = vehiculo.estado || 'stock';
    if (estado === 'reserve') estado = 'reserved'; // Corregir si viene como 'reserve'
    if (!['stock', 'transit', 'reserved'].includes(estado)) {
      estado = 'stock';
    }
    
    // Determinar imagen principal
    const imagenPrincipal = vehiculo.imagen_principal || 
      (imagenes.length > 0 ? imagenes[0] : CONFIG.app.defaultImage);
    
    return {
      id: vehiculo.id || Date.now().toString(),
      nombre: vehiculo.nombre || 'Vehículo',
      descripcion: vehiculo.descripcion || 'Vehículo americano importado',
      precio: vehiculo.precio || 0,
      estado: estado,
      imagenes: imagenes,
      imagen_principal: imagenPrincipal,
      ano: vehiculo.ano || '',
      color: vehiculo.color || '',
      motor: vehiculo.motor || '',
      kilometraje: vehiculo.kilometraje || 0,
      modelo: vehiculo.modelo || '',
      marca: vehiculo.marca || '',
      transmision: vehiculo.transmision || '',
      combustible: vehiculo.combustible || ''
    };
  }
  
  // ========== MÉTODOS DE FORMATO ==========
  formatPrice(price) {
    if (CONFIG.app.mostrarPrecios === false) return 'Consultar';
    if (!price && price !== 0) return 'Consultar';
    const num = parseInt(price);
    if (isNaN(num) || num === 0) return 'Consultar';
    return '$' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  
  getWhatsAppUrl(vehiculo, kit = null) {
    let mensaje = `Hola, estoy interesado en el vehículo:\n\n`;
    mensaje += `*${vehiculo.nombre || 'Vehículo'}*\n`;
    
    if (vehiculo.precio) {
      mensaje += `Precio: ${this.formatPrice(vehiculo.precio)}\n`;
    }
    
    if (vehiculo.estado) {
      const estadoText = CONFIG.app.textosEstado[vehiculo.estado] || vehiculo.estado;
      mensaje += `Disponibilidad: ${estadoText}\n`;
    }
    
    if (vehiculo.ano) {
      mensaje += `Año: ${vehiculo.ano}\n`;
    }
    
    if (vehiculo.kilometraje) {
      mensaje += `Kilometraje: ${vehiculo.kilometraje.toLocaleString()} km\n`;
    }
    
    if (kit) {
      mensaje += `\nKit seleccionado: ${kit.nombre}\n`;
      if (kit.precio > 0) {
        mensaje += `Precio kit: +${this.formatPrice(kit.precio)}\n`;
      }
    }
    
    mensaje += `\nMe gustaría obtener más información.`;
    
    return `https://wa.me/${CONFIG.contacto.whatsapp}?text=${encodeURIComponent(mensaje)}`;
  }
  
  getEstadoTexto(estado) {
    return CONFIG.app.textosEstado[estado] || estado;
  }
  
  getEstadoColor(estado) {
    return CONFIG.app.coloresEstado[estado] || '#86868b';
  }
  
  // ========== MÉTODOS DE KITS ==========
  getKitsForDisplay() {
    return [
      {
        id: "standard",
        nivel: "standard",
        nombre: "Standard",
        precio: 0,
        descripcion: "Preparación básica incluida",
        includes: [
          "Limpieza completa exterior e interior",
          "Revisión mecánica general",
          "Documentación en regla",
          "Cambio de aceite y filtros"
        ],
        color: "#CD7F32",
        icon: "fa-star"
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
        ],
        color: "#C0C0C0",
        icon: "fa-medal"
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
        ],
        color: "#FFD700",
        icon: "fa-crown"
      }
    ];
  }
  
  getKitById(kitId) {
    return this.kits.find(kit => kit.id === kitId) || null;
  }
  
  // ========== MÉTODOS DE BÚSQUEDA ==========
  getVehiculoById(id) {
    return this.vehiculos.find(v => v.id === id) || null;
  }
  
  filtrarVehiculos(filter) {
    this.currentFilter = filter;
    let vehiculosFiltrados = this.vehiculos;
    
    if (filter !== 'all') {
      vehiculosFiltrados = this.vehiculos.filter(v => v.estado === filter);
    }
    
    // Actualizar botones de filtro
    this.actualizarBotonesFiltro(filter);
    
    // Renderizar vehículos filtrados
    this.renderVehiculos(vehiculosFiltrados);
  }
  
  actualizarBotonesFiltro(filter) {
    // Usar UIManager si está disponible
    if (this.uiManager && this.uiManager.updateFilterButtons) {
      this.uiManager.updateFilterButtons(filter);
    } else if (window.UIManager && window.UIManager.updateFilterButtons) {
      window.UIManager.updateFilterButtons(filter);
    } else {
      // Fallback manual
      document.querySelectorAll('.filter-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
          btn.classList.add('active');
        }
      });
    }
  }
  
  // ========== MÉTODO DE RENDER ==========
  renderVehiculos(vehiculos = this.vehiculos) {
    const container = document.getElementById('vehiclesContainer');
    if (!container) return;
    
    if (!vehiculos || vehiculos.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <i class="fas fa-car"></i>
          </div>
          <h3 class="empty-state-title">No hay vehículos en esta categoría</h3>
          <p class="empty-state-message">
            Intenta con otro filtro o consulta disponibilidad.
          </p>
          <button class="button" onclick="window.productosManager.filtrarVehiculos('all')" style="width: auto; padding: 10px 20px;">
            Ver todos los vehículos
          </button>
        </div>
      `;
      return;
    }
    
    container.innerHTML = vehiculos.map(vehiculo => {
      const primeraImagen = vehiculo.imagenes?.[0] || vehiculo.imagen_principal || CONFIG.app.defaultImage;
      const estadoTexto = this.getEstadoTexto(vehiculo.estado);
      const estadoColor = this.getEstadoColor(vehiculo.estado);
      
      return `
        <div class="vehicle-card" data-id="${vehiculo.id}">
          <img src="${primeraImagen}" 
               alt="${vehiculo.nombre}" 
               class="vehicle-image"
               onerror="this.src='${CONFIG.app.defaultImage}'"
               loading="lazy">
          <div class="vehicle-info">
            <div class="vehicle-status" style="background: ${estadoColor}10; color: ${estadoColor};">
              ${estadoTexto}
            </div>
            <h3 class="vehicle-title">${vehiculo.nombre || 'Vehículo'}</h3>
            <div class="vehicle-price">${this.formatPrice(vehiculo.precio)}</div>
            <p style="color: #86868b; font-size: 14px; margin-bottom: 16px; min-height: 42px;">
              ${vehiculo.descripcion ? (vehiculo.descripcion.substring(0, 80) + (vehiculo.descripcion.length > 80 ? '...' : '')) : 'Sin descripción'}
            </p>
            <div style="display: flex; gap: 8px;">
              <button class="button" onclick="window.open('${this.getWhatsAppUrl(vehiculo)}', '_blank')" style="flex: 1;">
                <i class="fab fa-whatsapp"></i> Consultar
              </button>
              <button class="button button-outline" onclick="window.UIManager.mostrarDetallesVehiculo('${vehiculo.id}')" style="flex: 1;">
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
