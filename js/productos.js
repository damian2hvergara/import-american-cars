import { CONFIG } from './config.js';
import { supabaseService } from './supabase.js';
import { UI } from './ui.js';

// Gestión de productos/vehículos
export class ProductosManager {
  constructor() {
    this.vehiculos = [];
    this.kits = []; // NUEVO: Almacenar los kits aquí
    this.currentFilter = "all";
  }
  
  // Cargar vehículos y kits desde Supabase
  async cargarVehiculos() {
    try {
      console.log('🚗 === INICIANDO CARGA DE VEHÍCULOS Y KITS ===');
      UI.showLoading();
      
      // 1. Cargar Vehículos
      this.vehiculos = await supabaseService.getVehiculos();
      
      // 2. Cargar Kits (NUEVO)
      this.kits = await supabaseService.getKits();
      
      console.log(`📦 Vehículos cargados en memoria: ${this.vehiculos.length}`);
      console.log(`📦 Kits cargados en memoria: ${this.kits.length}`);
      
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
      
      console.log('✅ === CARGA DE VEHÍCULOS Y KITS COMPLETADA ===');
      
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
    // 1. Asignar ID (si no tiene) y Precio
    vehiculo.id = vehiculo.id || 'temp_id_' + Math.random(); 
    vehiculo.precio = supabaseService.findVehiclePrice(vehiculo);
    
    // 2. Manejar el array de imágenes (NUEVO REQUISITO)
    const imagenes = [];
    
    // Si la columna 'imagenes' (text[]) existe y es un array, úsala.
    if (Array.isArray(vehiculo.imagenes) && vehiculo.imagenes.length > 0) {
      imagenes.push(...vehiculo.imagenes.map(url => this.getCloudinaryUrl(url)));
    } else {
      // Lógica de fallback si 'imagenes' no existe o está vacía, usando las columnas viejas
      const posiblesColumnas = [
        'imagen_1', 'imagen_2', 'imagen_3', 'foto_principal', 'foto_1', 'foto_2', 'foto_3', 'imagen_principal', 'url_imagen', 'url_foto', 'image_url', 'main_image', 'photo_url', 'img_url'
      ];
      
      // Buscar en todas las columnas posibles
      for (const columna of posiblesColumnas) {
        if (vehiculo[columna] && typeof vehiculo[columna] === 'string' && vehiculo[columna].trim()) {
          const url = this.getCloudinaryUrl(vehiculo[columna]);
          if (url && !imagenes.includes(url)) {
            imagenes.push(url);
            console.log(` 📸 Imagen de ${columna}: ${url.substring(0, 60)}...`);
          }
        }
      }
    }

    // Si no hay imágenes, usar una por defecto
    if (imagenes.length === 0) {
      console.log(` ⚠️ Sin imágenes, usando imagen por defecto para ${vehiculo.nombre}`);
      imagenes.push(CONFIG.app.defaultImage);
    }
    
    // Asignar el array procesado y la imagen principal (la primera del array)
    vehiculo.imagenes = imagenes;
    vehiculo.imagen_principal_card = imagenes[0]; // Usar la primera imagen para la tarjeta
    
    // Asignar estado de forma más limpia
    vehiculo.estado = vehiculo.estado?.toLowerCase() === 'stock' ? 'stock' : 
                      vehiculo.estado?.toLowerCase() === 'transit' ? 'transit' : 
                      'reserve';

    return vehiculo;
  }
  
  // NUEVO: Obtener los kits cargados
  getKitsForDisplay() {
    // Asegurar que el kit "Standar" (precio 0) siempre esté primero
    const standarKit = this.kits.find(k => k.nivel === 'standar');
    const otherKits = this.kits.filter(k => k.nivel !== 'standar');
    return standarKit ? [standarKit, ...otherKits] : this.kits;
  }

  // NUEVO: Obtener la imagen de personalización desde Supabase
  async getCustomizationImage(vehiculoId, kitId) {
    // Llama al servicio de Supabase
    return supabaseService.getKitImageForVehicle(vehiculoId, kitId);
  }
  
  // Obtener URL de Cloudinary (se mantiene igual)
  getCloudinaryUrl(publicId) {
    if (!publicId || publicId.startsWith('http')) return publicId;
    
    // Asume que el ID ya incluye el folder si es necesario
    const parts = publicId.split('/');
    const cleanId = parts[parts.length - 1];
    
    return `https://res.cloudinary.com/${CONFIG.cloudinary.cloudName}/image/upload/v1/vehiculos/${cleanId}`;
  }
  
  // Obtener vehículo por ID (se mantiene igual)
  getVehiculoById(id) {
    let vehiculo = this.vehiculos.find(v => v.id === id);
    if (vehiculo) {
      return vehiculo;
    }
    return null;
  }
  
  // Actualizar contadores (se mantiene igual)
  actualizarContadores() {
    const stockCount = this.vehiculos.filter(v => v.estado === 'stock').length;
    const transitCount = this.vehiculos.filter(v => v.estado === 'transit').length;
    const reserveCount = this.vehiculos.filter(v => v.estado === 'reserve').length;

    UI.updateCounter('stockCount', stockCount);
    UI.updateCounter('transitCount', transitCount);
    UI.updateCounter('reserveCount', reserveCount);
  }
  
  // Renderizar vehículos (se mantiene igual)
  renderVehiculos() {
    this.filtrarVehiculos(this.currentFilter);
  }
  
  // Filtrar vehículos (se mantiene igual)
  filtrarVehiculos(filter) {
    this.currentFilter = filter;
    let vehiculosFiltrados = this.vehiculos;
    
    if (filter !== 'all') {
      vehiculosFiltrados = this.vehiculos.filter(v => v.estado === filter);
      console.log(` 🔍 Filtrados ${vehiculosFiltrados.length} vehículos`);
    }
    
    UI.updateFilterButtons(filter);
    UI.renderVehiculosGrid(vehiculosFiltrados);
  }
  
  // Formatear precio (se mantiene igual)
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
  
  // Obtener WhatsApp URL (se mantiene igual, pero ahora usa el objeto kit)
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
      } else {
        message += `*Kit:* Básico Incluido\n`;
      }
    }
    
    message += `\nURL de referencia: ${window.location.href}`;
    
    return `https://wa.me/${CONFIG.contacto.whatsapp}?text=${encodeURIComponent(message)}`;
  }
}

// Instancia global
export const productosManager = new ProductosManager();
