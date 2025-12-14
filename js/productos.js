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
      console.log('🚗 === INICIANDO CARGA DE VEHÍCULOS ===');
      UI.showLoading();
      
      this.vehiculos = await supabaseService.getVehiculos();
      
      console.log(`📦 Vehículos cargados en memoria: ${this.vehiculos.length}`);
      
      if (!this.vehiculos || this.vehiculos.length === 0) {
        console.warn('⚠️ No se encontraron vehículos en la base de datos');
        this.mostrarMensajeSinVehiculos();
        UI.hideLoading();
        return;
      }
      
      console.log('🖼️ Procesando imágenes y datos de vehículos...');
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
    UI.showMessage('No hay vehículos disponibles en este momento. Puedes contactarnos directamente.');
    
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
  
  // Procesar datos del vehículo
  procesarVehiculo(vehiculo) {
    console.log(`  🔧 Procesando: ${vehiculo.id} - ${vehiculo.nombre || 'Sin nombre'}`);
    
    // 1. Procesar imágenes
    const imagenes = this.procesarImagenes(vehiculo);
    
    // 2. Procesar estado
    const estado = this.procesarEstado(vehiculo.estado);
    
    // 3. Procesar precio
    const precio = this.procesarPrecio(vehiculo.precio);
    
    // 4. Procesar ubicación
    const ubicacion = vehiculo.ubicacion || vehiculo.ciudad || vehiculo.location || 'Arica, Chile';
    
    // 5. Procesar descripción
    const descripcion = this.procesarDescripcion(vehiculo);
    
    const vehiculoProcesado = {
      id: vehiculo.id,
      nombre: vehiculo.nombre || 'Vehículo sin nombre',
      imagenes: imagenes,
      precio: precio,
      estado: estado,
      ubicacion: ubicacion,
      descripcion: descripcion,
      // Mantener todos los datos originales
      ...vehiculo
    };
    
    console.log(`    ✅ Procesado: ${vehiculoProcesado.nombre} - ${estado} - $${precio}`);
    return vehiculoProcesado;
  }
  
  // Procesar imágenes
  procesarImagenes(vehiculo) {
    const imagenes = [];
    
    // Lista de posibles columnas de imágenes
    const posiblesColumnas = [
      'imagen_url', 'imagen_1', 'imagen_2', 'imagen_3',
      'foto_principal', 'foto_1', 'foto_2', 'foto_3',
      'imagen_principal', 'url_imagen', 'url_foto',
      'image_url', 'main_image', 'photo_url', 'img_url'
    ];
    
    // Buscar en todas las columnas posibles
    for (const columna of posiblesColumnas) {
      if (vehiculo[columna] && typeof vehiculo[columna] === 'string' && vehiculo[columna].trim()) {
        const url = this.getCloudinaryUrl(vehiculo[columna]);
        if (url && !imagenes.includes(url)) {
          imagenes.push(url);
          console.log(`    📸 Imagen de ${columna}: ${url.substring(0, 60)}...`);
        }
      }
    }
    
    // Si no hay imágenes, usar una por defecto
    if (imagenes.length === 0) {
      console.log(`    ⚠️ Sin imágenes, usando por defecto`);
      imagenes.push(CONFIG.app.defaultImage);
    }
    
    return imagenes;
  }
  
  // Procesar estado
  procesarEstado(estadoOriginal) {
    if (!estadoOriginal) return 'reserve';
    
    const estado = estadoOriginal.toString().toLowerCase();
    
    if (estado.includes('stock') || estado === 'en stock' || estado === 'disponible') {
      return 'stock';
    } else if (estado.includes('transito') || estado.includes('tránsito') || estado.includes('transit')) {
      return 'transit';
    } else if (estado.includes('reserva') || estado.includes('reserve')) {
      return 'reserve';
    }
    
    return 'reserve';
  }
  
  // Procesar precio
  procesarPrecio(precioOriginal) {
    if (!precioOriginal) return 0;
    
    const precio = parseFloat(precioOriginal);
    return isNaN(precio) ? 0 : precio;
  }
  
  // Procesar descripción
  procesarDescripcion(vehiculo) {
    const descripciones = [
      vehiculo.descripcion,
      vehiculo.descripcion_corta,
      vehiculo.description,
      vehiculo.descripcion_larga,
      'Vehículo importado desde USA. Consulta por más detalles.'
    ];
    
    for (const desc of descripciones) {
      if (desc && typeof desc === 'string' && desc.trim()) {
        return desc;
      }
    }
    
    return 'Vehículo importado desde USA. Consulta por más detalles.';
  }
  
  // Generar URL de Cloudinary
  getCloudinaryUrl(imagePath) {
    if (!imagePath || imagePath.trim() === '') {
      return CONFIG.app.defaultImage;
    }
    
    const path = imagePath.trim();
    
    // Si ya es una URL completa, usarla directamente
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // Si ya es una URL de Cloudinary completa
    if (path.includes('cloudinary.com')) {
      return path;
    }
    
    // Construir URL de Cloudinary
    // Remover / al inicio si existe
    const cleanPath = path.replace(/^\//, '');
    
    // URL base de Cloudinary
    return `https://res.cloudinary.com/${CONFIG.cloudinary.cloudName}/image/upload/${CONFIG.cloudinary.folder}/${cleanPath}`;
  }
  
  // Actualizar contadores de stock
  actualizarContadores() {
    const stock = this.vehiculos.filter(v => v.estado === 'stock').length;
    const transit = this.vehiculos.filter(v => v.estado === 'transit').length;
    const reserve = this.vehiculos.filter(v => v.estado === 'reserve').length;
    
    console.log(`📊 Contadores actualizados: Stock=${stock}, Tránsito=${transit}, Reserva=${reserve}`);
    
    document.getElementById('stockCount').textContent = stock;
    document.getElementById('transitCount').textContent = transit;
    document.getElementById('reserveCount').textContent = reserve;
  }
  
  // Renderizar vehículos en la grid
  renderVehiculos(filter = this.currentFilter) {
    console.log(`🎨 Renderizando con filtro: ${filter}`);
    this.currentFilter = filter;
    
    let vehiculosFiltrados = this.vehiculos;
    
    if (filter !== "all") {
      vehiculosFiltrados = this.vehiculos.filter(v => v.estado === filter);
      console.log(`  🔍 Filtrados ${vehiculosFiltrados.length} vehículos`);
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
    return this.vehiculos.find(v => v.id === id);
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
