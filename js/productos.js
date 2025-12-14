[file name]: productos.js
[file content begin]
import { CONFIG } from './config.js';
import { supabaseService } from './supabase.js';
import { UI } from './ui.js';

// Gestión de productos/vehículos
export class ProductosManager {
  constructor() {
    this.vehiculos = [];
    this.kits = []; // Almacenar los kits aquí
    this.currentFilter = "all";
  }
  
  // Cargar vehículos y kits desde Supabase
  async cargarVehiculos() {
    try {
      console.log('🚗 === INICIANDO CARGA DE VEHÍCULOS Y KITS ===');
      UI.showLoading();
      
      // 1. Cargar Vehículos
      this.vehiculos = await supabaseService.getVehiculos();
      
      // 2. Cargar Kits
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
    UI.showNotification('No hay vehículos disponibles en este momento. Puedes contactarnos directamente.', 'info');
    
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
    
    // 2. Manejar el array de imágenes
    const imagenes = [];
    
    // Si la columna 'imagenes' (text[]) existe y es un array, úsala.
    if (Array.isArray(vehiculo.imagenes) && vehiculo.imagenes.length > 0) {
      // Filtrar URLs inválidas
      const imagenesValidas = vehiculo.imagenes
        .map(url => this.getCloudinaryUrl(url))
        .filter(url => url && !url.includes('ejemplo-imagen.com'));
      
      imagenes.push(...imagenesValidas);
      console.log(` 📸 ${imagenesValidas.length} imágenes válidas del array`);
    } 
    
    // 3. Fallback a columnas individuales si el array está vacío
    if (imagenes.length === 0) {
      const posiblesColumnas = [
        'imagen_1', 'imagen_2', 'imagen_3', 'imagen_4', 'imagen_5',
        'foto_principal', 'foto_1', 'foto_2', 'foto_3',
        'imagen_principal', 'url_imagen', 'url_foto', 
        'image_url', 'main_image', 'photo_url', 'img_url'
      ];
      
      // Buscar en todas las columnas posibles
      for (const columna of posiblesColumnas) {
        if (vehiculo[columna] && typeof vehiculo[columna] === 'string' && vehiculo[columna].trim()) {
          const url = this.getCloudinaryUrl(vehiculo[columna]);
          if (url && !url.includes('ejemplo-imagen.com') && !imagenes.includes(url)) {
            imagenes.push(url);
          }
        }
      }
    }

    // 4. Si no hay imágenes válidas, usar imágenes por defecto
    if (imagenes.length === 0) {
      imagenes.push(
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1580274455191-1c62238fa333?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      );
    }
    
    // 5. Asignar el array procesado y la imagen principal
    vehiculo.imagenes = imagenes;
    vehiculo.imagen_principal_card = imagenes[0];
    
    // 6. Asignar estado
    vehiculo.estado = vehiculo.estado?.toLowerCase() === 'stock' ? 'stock' : 
                      vehiculo.estado?.toLowerCase() === 'transit' ? 'transit' : 
                      'reserve';

    // 7. Procesar kits para este vehículo
    this.procesarKitsParaVehiculo(vehiculo);

    return vehiculo;
  }
  
  // Procesar kits para cada vehículo - NUEVO
  procesarKitsParaVehiculo(vehiculo) {
    // Si el vehículo ya tiene kits definidos en la base de datos, usarlos
    if (vehiculo.kits && Array.isArray(vehiculo.kits)) {
      return;
    }
    
    // Si no, crear kits basados en los kits generales
    vehiculo.kits = this.kits.map(kit => {
      // Clonar el kit para evitar mutaciones
      const kitVehiculo = { ...kit };
      
      // Asignar includes por defecto si no existen
      if (!kitVehiculo.includes) {
        kitVehiculo.includes = this.getDefaultIncludesForKit(kitVehiculo.nivel);
      }
      
      // Asignar imagen específica si no hay
      if (!kitVehiculo.imagen_kit) {
        kitVehiculo.imagen_kit = vehiculo.imagen_principal_card;
      }
      
      return kitVehiculo;
    });
  }
  
  // Obtener includes por defecto para cada nivel de kit - NUEVO
  getDefaultIncludesForKit(nivel) {
    const includesMap = {
      'standar': [
        "Lavado y encerado exterior completo",
        "Limpieza interior profunda",
        "Revisión mecánica básica",
        "Cambio de aceite y filtros"
      ],
      'medium': [
        "Todo lo del kit Standar",
        "Llantas deportivas 20\"",
        "Tinte de ventanas premium",
        "Step bar laterales"
      ],
      'full': [
        "Todo lo del kit Medium",
        "Lift kit suspensión 2\"",
        "Rines Fuel de 22\"",
        "Neumáticos Off-Road 35\""
      ]
    };
    
    return includesMap[nivel] || includesMap['standar'];
  }
  
  // Obtener los kits cargados
  getKitsForDisplay() {
    // Asegurar que el kit "Standar" (precio 0) siempre esté primero
    const standarKit = this.kits.find(k => k.nivel === 'standar');
    const otherKits = this.kits.filter(k => k.nivel !== 'standar');
    return standarKit ? [standarKit, ...otherKits] : this.kits;
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
  
  // Obtener URL de Cloudinary
  getCloudinaryUrl(publicId) {
    if (!publicId) return null;
    
    // 1. Si ya es una URL completa válida, la devolvemos
    if (publicId.startsWith('http')) {
      if (publicId.includes('ejemplo-imagen.com')) {
        return null;
      }
      return publicId;
    }
    
    // 2. Limpiar el publicId
    let cleanId = publicId.trim();
    
    // 3. Si tiene extensión, quitarla (Cloudinary lo maneja mejor)
    const extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    for (const ext of extensions) {
      if (cleanId.toLowerCase().endsWith(ext)) {
        cleanId = cleanId.substring(0, cleanId.length - ext.length);
        break;
      }
    }
    
    // 4. Si ya tiene el folder incluido
    if (cleanId.includes('/')) {
      const parts = cleanId.split('/');
      const filename = parts[parts.length - 1];
      return `https://res.cloudinary.com/${CONFIG.cloudinary.cloudName}/image/upload/v1/vehiculos/${filename}`;
    }
    
    // 5. URL estándar de Cloudinary
    return `https://res.cloudinary.com/${CONFIG.cloudinary.cloudName}/image/upload/v1/vehiculos/${cleanId}`;
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
    
    return vehiculo.kits || this.kits;
  }
}

// Instancia global
export const productosManager = new ProductosManager();
[file content end]
