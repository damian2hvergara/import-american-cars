import { CONFIG } from './config.js';
import { supabaseService } from './supabase.js';
import { UI } from './ui.js';

// Gestión de productos/vehículos
export class ProductosManager {
  constructor() {
    this.vehiculos = [];
    this.currentFilter = "all";
  }
  
  // Cargar vehículos desde Supabase
  async cargarVehiculos() {
    try {
      UI.showLoading();
      
      this.vehiculos = await supabaseService.getVehiculos();
      
      if (!this.vehiculos || this.vehiculos.length === 0) {
        console.warn('⚠️ No se encontraron vehículos en la base de datos');
        UI.showMessage('No hay vehículos disponibles en este momento.');
        return;
      }
      
      // Procesar imágenes de Cloudinary
      this.vehiculos = this.vehiculos.map(vehiculo => {
        return this.procesarVehiculo(vehiculo);
      });
      
      this.actualizarContadores();
      this.renderVehiculos();
      UI.hideLoading();
      
    } catch (error) {
      console.error('Error cargando vehículos:', error);
      UI.showError('Error al cargar los vehículos. Por favor, intenta nuevamente.');
      UI.hideLoading();
    }
  }
  
  // Procesar datos del vehículo
  procesarVehiculo(vehiculo) {
    // Procesar imágenes
    const imagenes = [];
    
    // Imagen principal
    if (vehiculo.imagen_url) {
      imagenes.push(this.getCloudinaryUrl(vehiculo.imagen_url));
    }
    
    // Imágenes adicionales (si existen en el formato de tu tabla)
    for (let i = 1; i <= 3; i++) {
      const imgKey = `imagen_${i}`;
      if (vehiculo[imgKey]) {
        imagenes.push(this.getCloudinaryUrl(vehiculo[imgKey]));
      }
    }
    
    // Si no hay imágenes, usar una por defecto
    if (imagenes.length === 0) {
      imagenes.push(CONFIG.app.defaultImage);
    }
    
    return {
      ...vehiculo,
      imagenes: imagenes,
      precio: vehiculo.precio || 0,
      estado: vehiculo.estado || 'reserve',
      ubicacion: vehiculo.ubicacion || 'No disponible',
      descripcion: vehiculo.descripcion || 'Sin descripción disponible'
    };
  }
  
  // Generar URL de Cloudinary
  getCloudinaryUrl(imagePath) {
    if (!imagePath) return CONFIG.app.defaultImage;
    
    // Si ya es una URL completa
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Si es un path de Cloudinary, construir URL
    if (imagePath.includes('cloudinary')) {
      return imagePath;
    }
    
    // Construir URL desde el path
    return `https://res.cloudinary.com/${CONFIG.cloudinary.cloudName}/image/upload/${CONFIG.cloudinary.folder}/${imagePath}`;
  }
  
  // Actualizar contadores de stock
  actualizarContadores() {
    const stock = this.vehiculos.filter(v => v.estado === 'stock').length;
    const transit = this.vehiculos.filter(v => v.estado === 'transit').length;
    const reserve = this.vehiculos.filter(v => v.estado === 'reserve').length;
    
    document.getElementById('stockCount').textContent = stock;
    document.getElementById('transitCount').textContent = transit;
    document.getElementById('reserveCount').textContent = reserve;
  }
  
  // Renderizar vehículos en la grid
  renderVehiculos(filter = this.currentFilter) {
    this.currentFilter = filter;
    
    let vehiculosFiltrados = this.vehiculos;
    
    if (filter !== "all") {
      vehiculosFiltrados = this.vehiculos.filter(v => v.estado === filter);
    }
    
    UI.updateFilterButtons(filter);
    UI.renderVehiculosGrid(vehiculosFiltrados);
  }
  
  // Filtrar vehículos
  filtrarVehiculos(filter) {
    this.renderVehiculos(filter);
  }
  
  // Obtener vehículo por ID
  getVehiculoById(id) {
    return this.vehiculos.find(v => v.id === id);
  }
  
  // Formatear precio
  formatPrice(price) {
    if (!price && price !== 0) return '$0';
    const num = parseInt(price);
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
    message += `*Precio:* ${this.formatPrice(vehiculo.precio)} ${CONFIG.app.moneda}\n`;
    message += `*Estado:* ${statusText}\n`;
    
    if (kit) {
      message += `\n*Kit Upgrade seleccionado:* ${kit.nombre}\n`;
      if (kit.precio > 0) {
        message += `*Precio Kit:* +${this.formatPrice(kit.precio)}\n`;
        message += `*Total:* ${this.formatPrice(vehiculo.precio + kit.precio)}\n`;
      }
    }
    
    message += `\n¿Podrían darme más información?`;
    
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${CONFIG.contacto.whatsapp}?text=${encodedMessage}`;
  }
}

// Instancia global
export const productosManager = new ProductosManager();
