import { CONFIG } from './config.js';
import { supabaseService } from './supabase.js';
import { UI } from './ui.js';

export class ProductosManager {
  constructor() {
    this.vehiculos = [];
    this.currentFilter = "all";
  }
  
  async cargarVehiculos() {
    try {
      console.log('🚗 === INICIANDO CARGA ===');
      UI.showLoading();
      
      this.vehiculos = await supabaseService.getVehiculos();
      
      console.log(`📦 Vehículos cargados: ${this.vehiculos.length}`);
      
      if (!this.vehiculos || this.vehiculos.length === 0) {
        this.mostrarMensajeSinVehiculos();
        UI.hideLoading();
        return;
      }
      
      this.vehiculos = this.vehiculos.map(vehiculo => this.procesarVehiculo(vehiculo));
      
      this.actualizarContadores();
      this.renderVehiculos();
      UI.hideLoading();
      
      console.log('✅ === CARGA COMPLETADA ===');
      
    } catch (error) {
      console.error('❌ Error cargando vehículos:', error);
      UI.showError('Error al cargar los vehículos.');
      UI.hideLoading();
    }
  }
  
  procesarVehiculo(vehiculo) {
    vehiculo.id = vehiculo.id || 'temp_id_' + Math.random();
    
    if (!vehiculo.imagenes || !Array.isArray(vehiculo.imagenes)) {
      vehiculo.imagenes = [];
    }
    
    const maxImagenes = CONFIG.app.maxImagenesVehículo || 8;
    vehiculo.imagenes = vehiculo.imagenes.slice(0, maxImagenes);
    
    if (vehiculo.imagenes.length === 0) {
      vehiculo.imagenes = CONFIG.app.placeholderImages.slice(0, 4);
    }
    
    vehiculo.imagen_principal_card = vehiculo.imagen_principal || vehiculo.imagenes[0] || CONFIG.app.defaultImage;
    
    vehiculo.estado = vehiculo.estado?.toLowerCase() === 'stock' ? 'stock' : 
                      vehiculo.estado?.toLowerCase() === 'transit' ? 'transit' : 
                      'reserve';
    
    // Crear kits desde los precios en la tabla
    vehiculo.kits = this.crearKitsDesdeVehiculo(vehiculo);
    
    return vehiculo;
  }
  
  crearKitsDesdeVehiculo(vehiculo) {
    return [
      {
        id: "standar",
        nombre: "Standard",
        precio: vehiculo.kit_standar_precio || 0,
        descripcion: "Preparación básica incluida",
        nivel: "standar",
        includes: [
          "Limpieza completa exterior e interior",
          "Revisión mecánica general",
          "Documentación en regla Zona Franca",
          "Cambio de aceite y filtros básicos"
        ]
      },
      {
        id: "medium",
        nombre: "Medium",
        precio: vehiculo.kit_medium_precio || 1200000,
        descripcion: "Mejoras estéticas y funcionales",
        nivel: "medium",
        includes: [
          "Todo lo del Kit Standard",
          "Llantas deportivas 20\" nuevas",
          "Tinte de ventanas premium",
          "Step bar laterales cromados"
        ]
      },
      {
        id: "full",
        nombre: "Full",
        precio: vehiculo.kit_full_precio || 2500000,
        descripcion: "Transformación premium completa",
        nivel: "full",
        includes: [
          "Todo lo del Kit Medium",
          "Suspensión deportiva nivelada 2\"",
          "Rines Fuel Off-Road 22\"",
          "Neumáticos todo terreno 35\""
        ]
      }
    ];
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
          <a href="https://wa.me/${CONFIG.contacto.whatsapp}" target="_blank" class="button whatsapp-btn" style="width: auto; padding: 12px 24px;">
            <i class="fab fa-whatsapp"></i> Consultar Disponibilidad
          </a>
        </div>
      `;
    }
  }
  
  actualizarContadores() {
    const stockCount = this.vehiculos.filter(v => v.estado === 'stock').length;
    const transitCount = this.vehiculos.filter(v => v.estado === 'transit').length;
    const reserveCount = this.vehiculos.filter(v => v.estado === 'reserve').length;

    UI.updateCounter('stockCount', stockCount);
    UI.updateCounter('transitCount', transitCount);
    UI.updateCounter('reserveCount', reserveCount);
  }
  
  renderVehiculos() {
    this.filtrarVehiculos(this.currentFilter);
  }
  
  filtrarVehiculos(filter) {
    this.currentFilter = filter;
    let vehiculosFiltrados = this.vehiculos;
    
    if (filter !== 'all') {
      vehiculosFiltrados = this.vehiculos.filter(v => v.estado === filter);
    }
    
    UI.updateFilterButtons(filter);
    UI.renderVehiculosGrid(vehiculosFiltrados);
  }
  
  formatPrice(price) {
    if (CONFIG.app.mostrarPrecios === false) {
      return 'Consultar';
    }
    
    if (!price && price !== 0) {
      return 'Consultar';
    }
    
    const num = parseInt(price);
    if (isNaN(num)) {
      return 'Consultar';
    }
    
    if (num === 0) {
      return 'Consultar';
    }
    
    return '$' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  
  getVehiculoById(id) {
    return this.vehiculos.find(v => v.id === id) || null;
  }
  
  getWhatsAppUrl(vehiculo, kit = null) {
    const statusText = 
      vehiculo.estado === 'stock' ? 'En Stock Arica' : 
      vehiculo.estado === 'transit' ? 'En Tránsito' : 
      'Para Reservar';
    
    let message = `Hola, estoy interesado en el vehículo:\n\n`;
    message += `*${vehiculo.nombre}*\n`;
    message += `*Precio:* ${this.formatPrice(vehiculo.precio)} ${CONFIG.app.moneda}\n`;
    message += `*Estado:* ${statusText}\n`;
    
    if (vehiculo.ano) message += `*Año:* ${vehiculo.ano}\n`;
    if (vehiculo.motor) message += `*Motor:* ${vehiculo.motor}\n`;
    if (vehiculo.color) message += `*Color:* ${vehiculo.color}\n`;
    if (vehiculo.kilometraje) message += `*Kilometraje:* ${vehiculo.kilometraje.toLocaleString()} km\n`;
    
    if (kit) {
      message += `\n*Kit Upgrade seleccionado:* ${kit.nombre}\n`;
      if (kit.precio > 0) {
        message += `*Precio Kit:* +${this.formatPrice(kit.precio)}\n`;
        const total = (vehiculo.precio || 0) + kit.precio;
        if (total > 0) {
          message += `*Precio Total Estimado:* ${this.formatPrice(total)} ${CONFIG.app.moneda}\n`;
        }
      }
      
      if (kit.includes && kit.includes.length > 0) {
        message += `\n*Incluye:*\n`;
        kit.includes.forEach(item => {
          message += `   ✅ ${item}\n`;
        });
      }
    }
    
    message += `\nURL de referencia: ${window.location.href}`;
    
    return `https://wa.me/${CONFIG.contacto.whatsapp}?text=${encodeURIComponent(message)}`;
  }
  
  getKitsForVehicle(vehicleId) {
    const vehiculo = this.getVehiculoById(vehicleId);
    if (!vehiculo) return [];
    
    return vehiculo.kits || [];
  }
}

export const productosManager = new ProductosManager();
