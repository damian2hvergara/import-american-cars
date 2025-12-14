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
  
  async cargarVehiculos() {
    try {
      console.log('🚗 === INICIANDO CARGA DE VEHÍCULOS Y KITS ===');
      UI.showLoading();
      
      this.vehiculos = await supabaseService.getVehiculos();
      this.kits = await supabaseService.getKits();
      
      console.log(`📦 Vehículos cargados: ${this.vehiculos.length}`);
      console.log(`📦 Kits cargados: ${this.kits.length}`);
      
      if (!this.vehiculos || this.vehiculos.length === 0) {
        this.mostrarMensajeSinVehiculos();
        UI.hideLoading();
        return;
      }
      
      this.vehiculos = this.vehiculos.map(vehiculo => {
        return this.procesarVehiculo(vehiculo);
      });
      
      this.actualizarContadores();
      this.renderVehiculos();
      UI.hideLoading();
      
      console.log('✅ === CARGA COMPLETADA ===');
      
    } catch (error) {
      console.error('❌ Error cargando vehículos:', error);
      UI.showError('Error al cargar los vehículos. Por favor, intenta nuevamente.');
      UI.hideLoading();
    }
  }
  
  mostrarMensajeSinVehiculos() {
    const container = document.getElementById('vehiclesContainer');
    if (container) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
          <div style="font-size: 48px; margin-bottom: 20px; color: #86868b;">
            <i class="fas fa-car"></i>
          </div>
          <h3 style="font-size: 21px; font-weight: 600; margin-bottom: 12px; color: var(--text-primary);">
            No hay vehículos disponibles
          </h3>
          <p style="color: #86868b; margin-bottom: 20px;">
            Por el momento no tenemos vehículos en stock.<br>
            Contáctanos para consultar por próximos arribos.
          </p>
          <a href="https://wa.me/${CONFIG.contacto.whatsapp}" target="_blank" class="button whatsapp-btn" style="width: auto; padding: 12px 24px;">
            <i class="fab fa-whatsapp"></i> Consultar Disponibilidad
          </a>
        </div>
      `;
    }
  }
  
  procesarVehiculo(vehiculo) {
    vehiculo.id = vehiculo.id || 'temp_id_' + Math.random(); 
    vehiculo.precio = supabaseService.findVehiclePrice(vehiculo);
    
    const imagenes = [];
    
    if (Array.isArray(vehiculo.imagenes) && vehiculo.imagenes.length > 0) {
      const imagenesValidas = vehiculo.imagenes
        .map(url => this.getCloudinaryUrl(url))
        .filter(url => url && !url.includes('ejemplo-imagen.com'));
      
      imagenes.push(...imagenesValidas);
    }
    
    if (imagenes.length === 0) {
      const posiblesColumnas = [
        'imagen_1', 'imagen_2', 'imagen_3', 'imagen_4', 'imagen_5',
        'foto_principal', 'foto_1', 'foto_2', 'foto_3',
        'imagen_principal', 'url_imagen', 'url_foto', 
        'image_url', 'main_image', 'photo_url', 'img_url'
      ];
      
      for (const columna of posiblesColumnas) {
        if (vehiculo[columna] && typeof vehiculo[columna] === 'string' && vehiculo[columna].trim()) {
          const url = this.getCloudinaryUrl(vehiculo[columna]);
          if (url && !url.includes('ejemplo-imagen.com') && !imagenes.includes(url)) {
            imagenes.push(url);
          }
        }
      }
    }

    if (imagenes.length === 0) {
      imagenes.push(
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1580274455191-1c62238fa333?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      );
    }
    
    vehiculo.imagenes = imagenes;
    vehiculo.imagen_principal_card = imagenes[0];
    
    vehiculo.estado = vehiculo.estado?.toLowerCase() === 'stock' ? 'stock' : 
                      vehiculo.estado?.toLowerCase() === 'transit' ? 'transit' : 
                      'reserve';

    return vehiculo;
  }
  
  getKitsForDisplay() {
    const standarKit = this.kits.find(k => k.nivel === 'standar');
    const otherKits = this.kits.filter(k => k.nivel !== 'standar');
    return standarKit ? [standarKit, ...otherKits] : this.kits;
  }

  async getCustomizationImage(vehiculoId, kitId) {
    return supabaseService.getKitImageForVehicle(vehiculoId, kitId);
  }
  
  getCloudinaryUrl(publicId) {
    if (!publicId) return null;
    
    if (publicId.startsWith('http')) {
      if (publicId.includes('ejemplo-imagen.com')) {
        return null;
      }
      return publicId;
    }
    
    let cleanId = publicId.trim();
    
    const extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    for (const ext of extensions) {
      if (cleanId.toLowerCase().endsWith(ext)) {
        cleanId = cleanId.substring(0, cleanId.length - ext.length);
        break;
      }
    }
    
    if (cleanId.includes('/')) {
      const parts = cleanId.split('/');
      const filename = parts[parts.length - 1];
      return `https://res.cloudinary.com/${CONFIG.cloudinary.cloudName}/image/upload/v1/vehiculos/${filename}`;
    }
    
    return `https://res.cloudinary.com/${CONFIG.cloudinary.cloudName}/image/upload/v1/vehiculos/${cleanId}`;
  }
  
  getVehiculoById(id) {
    return this.vehiculos.find(v => v.id === id) || null;
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
    if (CONFIG.app.mostrarPrecios === false || !price && price !== 0) {
      return 'Consultar';
    }
    
    const num = parseInt(price);
    if (isNaN(num) || num === 0) {
      return 'Consultar';
    }
    
    return '$' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  
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
    
    if (kit) {
      message += `\n*Kit Upgrade seleccionado:* ${kit.nombre}\n`;
      if (kit.precio > 0) {
        message += `*Precio Kit:* +${this.formatPrice(kit.precio)}\n`;
        const total = (vehiculo.precio || 0) + kit.precio;
        if (total > 0) {
          message += `*Precio Total Estimado:* ${this.formatPrice(total)} ${CONFIG.app.moneda}\n`;
        }
      }
    }
    
    message += `\nURL de referencia: ${window.location.href}`;
    
    return `https://wa.me/${CONFIG.contacto.whatsapp}?text=${encodeURIComponent(message)}`;
  }
}

export const productosManager = new ProductosManager();
