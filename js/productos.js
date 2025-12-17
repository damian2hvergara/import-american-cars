[file name]: productos.js
[file content begin]
import { CONFIG } from './config.js';
import { supabaseService } from './supabase.js';
import { UI } from './ui.js';

// Gestión de productos/vehículos
export class ProductosManager {
  constructor() {
    this.vehiculos = [];
    this.kits = [];
    this.currentFilter = "all";
  }
  
  // Cargar vehículos y kits desde Supabase
  async cargarVehiculos() {
    try {
      console.log('🚗 === INICIANDO CARGA DE VEHÍCULOS ===');
      UI.showLoading();
      
      // 1. Cargar Vehículos con imágenes y kits
      this.vehiculos = await supabaseService.getVehiculos();
      
      console.log(`📦 Vehículos cargados en memoria: ${this.vehiculos.length}`);
      
      if (!this.vehiculos || this.vehiculos.length === 0) {
        console.warn('⚠️ No se encontraron vehículos en la base de datos');
        this.mostrarMensajeSinVehiculos();
        UI.hideLoading();
        return;
      }
      
      console.log('🖼️ Procesando datos de vehículos...');
      this.vehiculos = this.vehiculos.map(vehiculo => {
        return this.procesarVehiculo(vehiculo);
      });
      
      this.actualizarContadores();
      this.renderVehiculos();
      UI.hideLoading();
      
      console.log('✅ === CARGA DE VEHÍCULOS COMPLETADA ===');
      
    } catch (error) {
      console.error('❌ Error cargando vehículos:', error);
      UI.showError('Error al cargar los vehículos. Por favor, intenta nuevamente.');
      UI.hideLoading();
    }
  }
  
  // Mostrar mensaje cuando no hay vehículos
  mostrarMensajeSinVehiculos() {
    UI.showNotification('No hay vehículos disponibles en este momento. Puedes contactarnos directamente.', 'info');
    
    const container = document.getElementById('vehiclesContainer');
    if (container) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
          <div style="font-size: 48px; margin-bottom: 20px; color: #86868b;">
            <i class="fas fa-car"></i>
          </div>
          <h3 style="font-size: 21px; font-weight: 600; margin-bottom: 12px; color: var(--black);">
            Inventario en actualización
          </h3>
          <p style="color: #86868b; margin-bottom: 20px;">
            Estamos actualizando nuestro inventario.<br>
            Contáctanos para conocer disponibilidad inmediata.
          </p>
          <a href="https://wa.me/${CONFIG.contacto.whatsapp}" target="_blank" class="button whatsapp-btn" style="width: auto; padding: 12px 24px;">
            <i class="fab fa-whatsapp"></i> Consultar Stock Disponible
          </a>
        </div>
      `;
    }
  }
  
  // Procesar datos del vehículo
  procesarVehiculo(vehiculo) {
    // 1. Asegurar ID
    vehiculo.id = vehiculo.id || 'temp_id_' + Math.random();
    
    // 2. Manejar imágenes (6-8 imágenes)
    if (!vehiculo.imagenes || !Array.isArray(vehiculo.imagenes)) {
      vehiculo.imagenes = [];
    }
    
    // Limitar a máximo 8 imágenes
    const maxImagenes = CONFIG.app.maxImagenesVehículo || 8;
    vehiculo.imagenes = vehiculo.imagenes.slice(0, maxImagenes);
    
    // 3. Si no hay imágenes, usar imágenes por defecto
    if (vehiculo.imagenes.length === 0) {
      vehiculo.imagenes = CONFIG.app.placeholderImages.slice(0, 4);
    }
    
    // 4. Imagen principal para cards
    vehiculo.imagen_principal_card = vehiculo.imagenes[0] || CONFIG.app.defaultImage;
    
    // 5. Asignar estado
    vehiculo.estado = vehiculo.estado?.toLowerCase() === 'stock' ? 'stock' : 
                      vehiculo.estado?.toLowerCase() === 'transit' ? 'transit' : 
                      'reserve';

    // 6. Procesar kits (ya vienen procesados desde Supabase)
    if (!vehiculo.kits || !Array.isArray(vehiculo.kits)) {
      vehiculo.kits = this.getDefaultKitsForVehicle(vehiculo);
    }

    // 7. Asegurar que el kit Standard esté primero
    vehiculo.kits.sort((a, b) => {
      if (a.nivel === 'standar') return -1;
      if (b.nivel === 'standar') return 1;
      return (a.precio || 0) - (b.precio || 0);
    });

    return vehiculo;
  }
  
  // Obtener kits por defecto para un vehículo
  getDefaultKitsForVehicle(vehiculo) {
    const defaultKits = supabaseService.getDefaultKits();
    
    return defaultKits.map(kit => {
      // Asignar includes si no existen
      if (!kit.includes) {
        kit.includes = supabaseService.getDefaultIncludesForKit(kit.nivel);
      }
      
      // Asignar imagen si no hay
      if (!kit.imagen_kit) {
        kit.imagen_kit = vehiculo.imagen_principal_card;
      }
      
      return { ...kit };
    });
  }
  
  // Obtener los kits cargados
  getKitsForDisplay() {
    return this.kits;
  }

  // Obtener la imagen de personalización desde Supabase
  async getCustomizationImage(vehiculoId, kitId) {
    // Intentar obtener imagen específica de Supabase
    const imagenEspecifica = await supabaseService.getKitImageForVehicle(vehiculoId, kitId);
    
    if (imagenEspecifica) {
      return imagenEspecifica;
    }
    
    // Si no hay imagen específica, buscar en los kits del vehículo
    const vehiculo = this.getVehiculoById(vehiculoId);
    if (vehiculo && vehiculo.kits) {
      const kitVehiculo = vehiculo.kits.find(k => k.id === kitId);
      if (kitVehiculo && kitVehiculo.imagen_kit) {
        return kitVehiculo.imagen_kit;
      }
    }
    
    // Si no hay imagen del kit, usar la imagen del vehículo
    if (vehiculo) {
      return vehiculo.imagen_principal_card || vehiculo.imagenes?.[0] || CONFIG.app.defaultImage;
    }
    
    return null;
  }
  
  // Obtener vehículo por ID
  getVehiculoById(id) {
    let vehiculo = this.vehiculos.find(v => v.id === id);
    if (vehiculo) {
      return vehiculo;
    }
    
    // Intentar buscar por ID como número
    vehiculo = this.vehiculos.find(v => String(v.id) === String(id));
    return vehiculo || null;
  }
  
  // Actualizar contadores
  actualizarContadores() {
    const stockCount = this.vehiculos.filter(v => v.estado === 'stock').length;
    const transitCount = this.vehiculos.filter(v => v.estado === 'transit').length;
    const reserveCount = this.vehiculos.filter(v => v.estado === 'reserve').length;

    UI.updateCounter('stockCount', stockCount);
    UI.updateCounter('transitCount', transitCount);
    UI.updateCounter('reserveCount', reserveCount);
  }
  
  // Renderizar vehículos
  renderVehiculos() {
    this.filtrarVehiculos(this.currentFilter);
  }
  
  // Filtrar vehículos
  filtrarVehiculos(filter) {
    this.currentFilter = filter;
    let vehiculosFiltrados = this.vehiculos;
    
    if (filter !== 'all') {
      vehiculosFiltrados = this.vehiculos.filter(v => v.estado === filter);
    }
    
    UI.updateFilterButtons(filter);
    UI.renderVehiculosGrid(vehiculosFiltrados);
  }
  
  // Formatear precio
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
  
  // Obtener WhatsApp URL
  getWhatsAppUrl(vehiculo, kit = null) {
    const statusText = 
      vehiculo.estado === 'stock' ? 'En Stock Arica' : 
      vehiculo.estado === 'transit' ? 'En Tránsito' : 
      'Para Reservar';
    
    let message = `Hola, estoy interesado en el vehículo:\n\n`;
    message += `*${vehiculo.nombre}*\n`;
    
    if (vehiculo.precio > 0) {
      message += `*Precio:* ${this.formatPrice(vehiculo.precio)} ${CONFIG.app.moneda}\n`;
    } else {
      message += `*Precio:* Consultar\n`;
    }
    
    message += `*Estado:* ${statusText}\n`;
    
    // Agregar especificaciones si existen
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
      } else {
        message += `*Kit:* Básico Incluido\n`;
      }
      
      // Agregar detalles del kit si existen
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
  
  // Obtener kit por ID
  getKitById(kitId) {
    return this.kits.find(k => k.id === kitId) || null;
  }
  
  // Obtener todos los vehículos
  getVehiculos() {
    return this.vehiculos;
  }
  
  // Obtener kits de un vehículo específico
  getKitsForVehicle(vehicleId) {
    const vehiculo = this.getVehiculoById(vehicleId);
    if (!vehiculo) return [];
    
    return vehiculo.kits || [];
  }
}

// Instancia global
export const productosManager = new ProductosManager();
[file content end]
