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
      console.log('🚗 Iniciando carga de vehículos...');
      UI.showLoading();
      
      this.vehiculos = await supabaseService.getVehiculos();
      
      console.log(`📦 Vehículos cargados en memoria: ${this.vehiculos.length}`);
      
      if (!this.vehiculos || this.vehiculos.length === 0) {
        console.warn('⚠️ No se encontraron vehículos en la base de datos');
        UI.showMessage('No hay vehículos disponibles en este momento. Puedes contactarnos directamente.');
        
        // Mostrar mensaje en la UI
        const container = document.getElementById('vehiclesContainer');
        if (container) {
          container.innerHTML = `
            <div class="no-vehicles-message">
              <div style="font-size: 48px; margin-bottom: 20px; color: #86868b;">
                <i class="fas fa-car"></i>
              </div>
              <h3 style="font-size: 21px; font-weight: 600; margin-bottom: 12px; color: var(--black);">
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
        
        UI.hideLoading();
        return;
      }
      
      // Procesar imágenes de Cloudinary
      console.log('🖼️ Procesando imágenes de vehículos...');
      this.vehiculos = this.vehiculos.map(vehiculo => {
        return this.procesarVehiculo(vehiculo);
      });
      
      this.actualizarContadores();
      this.renderVehiculos();
      UI.hideLoading();
      
      console.log('✅ Vehículos cargados y renderizados correctamente');
      
    } catch (error) {
      console.error('❌ Error cargando vehículos:', error);
      UI.showError('Error al cargar los vehículos. Por favor, intenta nuevamente.');
      UI.hideLoading();
    }
  }
  
  // Procesar datos del vehículo
  procesarVehiculo(vehiculo) {
    console.log(`Procesando vehículo: ${vehiculo.id} - ${vehiculo.nombre}`);
    
    // Procesar imágenes
    const imagenes = [];
    
    // Columnas posibles de imágenes
    const posiblesColumnasImagen = [
      'imagen_url', 'imagen_1', 'imagen_2', 'imagen_3',
      'foto_principal', 'foto_1', 'foto_2', 'foto_3',
      'imagen_principal', 'url_imagen', 'url_foto',
      'image_url', 'main_image', 'photo_url'
    ];
    
    // Buscar imágenes en todas las columnas posibles
    for (const columna of posiblesColumnasImagen) {
      if (vehiculo[columna] && typeof vehiculo[columna] === 'string' && vehiculo[columna].trim()) {
        const url = this.getCloudinaryUrl(vehiculo[columna]);
        if (url && !imagenes.includes(url)) {
          imagenes.push(url);
          console.log(`  ✅ Imagen encontrada en columna ${columna}: ${url.substring(0, 80)}...`);
        }
      }
    }
    
    // Si no hay imágenes, usar una por defecto
    if (imagenes.length === 0) {
      console.log(`  ⚠️ No se encontraron imágenes para ${vehiculo.nombre}, usando imagen por defecto`);
      imagenes.push(CONFIG.app.defaultImage);
    }
    
    // Procesar estado
    let estado = 'reserve';
    if (vehiculo.estado) {
      const estadoLower = vehiculo.estado.toString().toLowerCase();
      if (estadoLower.includes('stock') || estadoLower === 'en stock' || estadoLower === 'disponible') {
        estado = 'stock';
      } else if (estadoLower.includes('transito') || estadoLower.includes('tránsito') || estadoLower.includes('transit')) {
        estado = 'transit';
      } else if (estadoLower.includes('reserva') || estadoLower.includes('reserve')) {
        estado = 'reserve';
      }
    }
    
    // Procesar precio
    let precio = 0;
    if (vehiculo.precio) {
      precio = parseFloat(vehiculo.precio);
      if (isNaN(precio)) precio = 0;
    }
    
    // Procesar ubicación
    let ubicacion = vehiculo.ubicacion || vehiculo.ciudad || vehiculo.location || 'Arica, Chile';
    
    // Procesar descripción
    let descripcion = vehiculo.descripcion || vehiculo.descripcion_corta || vehiculo.description || 'Vehículo importado desde USA. Consulta por más detalles.';
    
    const vehiculoProcesado = {
      ...vehiculo,
      imagenes: imagenes,
      precio: precio,
      estado: estado,
      ubicacion: ubicacion,
      descripcion: descripcion
    };
    
    console.log(`  ✅ Vehículo procesado: ${vehiculoProcesado.nombre} - ${estado} - $${precio}`);
    return vehiculoProcesado;
  }
  
  // Generar URL de Cloudinary
  getCloudinaryUrl(imagePath) {
    if (!imagePath || imagePath.trim() === '') {
      return CONFIG.app.defaultImage;
    }
    
    // Si ya es una URL completa
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Si es un path de Cloudinary pero incompleto
    if (imagePath.includes('cloudinary.com')) {
      // Ya es una URL completa de Cloudinary
      return imagePath;
    }
    
    // Si es solo un nombre de archivo o path relativo
    // Remover espacios y caracteres especiales
    const cleanPath = imagePath.trim().replace(/^\/+/, '');
    
    // Construir URL de Cloudinary
    // Nota: Cloudinary puede tener diferentes formatos de URL
    // Intentar varios formatos comunes
    
    // Formato 1: URL directa con folder
    const url1 = `https://res.cloudinary.com/${CONFIG.cloudinary.cloudName}/image/upload/${CONFIG.cloudinary.folder}/${cleanPath}`;
    
    // Formato 2: URL sin folder (si el path ya incluye folder)
    const url2 = `https://res.cloudinary.com/${CONFIG.cloudinary.cloudName}/image/upload/${cleanPath}`;
    
    // Formato 3: URL con transformaciones básicas
    const url3 = `https://res.cloudinary.com/${CONFIG.cloudinary.cloudName}/image/upload/w_800,c_fill/${CONFIG.cloudinary.folder}/${cleanPath}`;
    
    console.log(`  🔗 Probando URL Cloudinary para: ${cleanPath}`);
    console.log(`     URL1: ${url1.substring(0, 100)}...`);
    
    return url1; // Usar el primer formato por defecto
  }
  
  // Actualizar contadores de stock
  actualizarContadores() {
    const stock = this.vehiculos.filter(v => v.estado === 'stock').length;
    const transit = this.vehiculos.filter(v => v.estado === 'transit').length;
    const reserve = this.vehiculos.filter(v => v.estado === 'reserve').length;
    
    console.log(`📊 Contadores: Stock=${stock}, Tránsito=${transit}, Reserva=${reserve}`);
    
    document.getElementById('stockCount').textContent = stock;
    document.getElementById('transitCount').textContent = transit;
    document.getElementById('reserveCount').textContent = reserve;
  }
  
  // Renderizar vehículos en la grid
  renderVehiculos(filter = this.currentFilter) {
    console.log(`🎨 Renderizando vehículos con filtro: ${filter}`);
    this.currentFilter = filter;
    
    let vehiculosFiltrados = this.vehiculos;
    
    if (filter !== "all") {
      vehiculosFiltrados = this.vehiculos.filter(v => v.estado === filter);
      console.log(`  🔍 Filtrado: ${vehiculosFiltrados.length} vehículos con estado ${filter}`);
    }
    
    UI.updateFilterButtons(filter);
    UI.renderVehiculosGrid(vehiculosFiltrados);
  }
  
  // Filtrar vehículos
  filtrarVehiculos(filter) {
    console.log(`🔘 Aplicando filtro: ${filter}`);
    this.renderVehiculos(filter);
  }
  
  // Obtener vehículo por ID
  getVehiculoById(id) {
    const vehiculo = this.vehiculos.find(v => v.id === id);
    if (!vehiculo) {
      console.log(`⚠️ Vehículo con ID ${id} no encontrado en memoria`);
    }
    return vehiculo;
  }
  
  // Formatear precio
  formatPrice(price) {
    if (!price && price !== 0) {
      return 'Consultar';
    }
    
    const num = parseInt(price);
    if (isNaN(num)) {
      return 'Consultar';
    }
    
    // Si el precio es 0, mostrar "Consultar"
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
    
    if (kit) {
      message += `\n*Kit Upgrade seleccionado:* ${kit.nombre}\n`;
      if (kit.precio > 0) {
        message += `*Precio Kit:* +${this.formatPrice(kit.precio)}\n`;
        const total = (vehiculo.precio || 0) + kit.precio;
        if (total > 0) {
          message += `*Total:* ${this.formatPrice(total)}\n`;
        }
      }
    }
    
    message += `\n¿Podrían darme más información?`;
    
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${CONFIG.contacto.whatsapp}?text=${encodedMessage}`;
  }
}

// Instancia global
export const productosManager = new ProductosManager();
