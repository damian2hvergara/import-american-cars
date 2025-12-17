import { CONFIG } from './config.js';
import { productosManager } from './productos.js';

// ========== UI MANAGER - ORQUESTADOR PRINCIPAL ==========
class UIManager {
  constructor() {
    this.currentVehicle = null;
    this.currentKit = null;
    this.sliderInstances = new Map();
  }
  
  // ========== INICIALIZACIÓN ==========
  init() {
    console.log('🎨 Inicializando UI Manager...');
    this.configurarEventos();
    this.configurarMenuMovil();
    this.configurarModales();
  }
  
  // ========== CONFIGURACIÓN DE EVENTOS ==========
  configurarEventos() {
    // Filtros de vehículos
    document.addEventListener('click', (e) => {
      if (e.target.closest('.filter-button')) {
        const filter = e.target.closest('.filter-button').dataset.filter;
        if (filter) {
          productosManager.filtrarVehiculos(filter);
        }
      }
      
      // Indicadores de stock
      if (e.target.closest('.indicator')) {
        const filter = e.target.closest('.indicator').dataset.filter;
        if (filter) {
          productosManager.filtrarVehiculos(filter);
          const section = document.getElementById('vehicles');
          if (section) {
            window.scrollTo({ top: section.offsetTop - 80, behavior: 'smooth' });
          }
        }
      }
      
      // Botón ver todos los kits
      if (e.target.closest('#showAllKits')) {
        this.mostrarTodosVehiculosParaPersonalizacion();
      }
    });
  }
  
  configurarMenuMovil() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
      menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
      });
    }
  }
  
  configurarModales() {
    // Cerrar modales con botón X
    document.getElementById('closeVehicleModal')?.addEventListener('click', () => {
      this.cerrarModal('vehicleModal');
    });
    
    document.getElementById('closeCustomizationModal')?.addEventListener('click', () => {
      this.cerrarModal('customizationModal');
    });
    
    // Cerrar al hacer click fuera
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.cerrarModal(e.target.id);
      }
    });
    
    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.cerrarModal('vehicleModal');
        this.cerrarModal('customizationModal');
      }
    });
  }
  
  // ========== SLIDER DE IMÁGENES ==========
  inicializarSlider(sliderId, images) {
    const slider = document.getElementById(sliderId);
    if (!slider || !images || images.length === 0) return null;
    
    const wrapper = slider.querySelector('.slider-wrapper');
    const prevBtn = slider.querySelector('.slider-button-prev');
    const nextBtn = slider.querySelector('.slider-button-next');
    const dotsContainer = slider.querySelector('.slider-dots') || this.crearPuntosSlider(slider, images.length);
    
    let currentSlide = 0;
    const totalSlides = images.length;
    
    // Limpiar y agregar slides
    wrapper.innerHTML = images.map((url, index) => `
      <div class="slider-slide" data-index="${index}">
        <img src="${url}" 
             alt="Imagen ${index + 1}" 
             loading="lazy"
             onerror="this.src='${CONFIG.app.defaultImage}'">
      </div>
    `).join('');
    
    // Configurar navegación
    const actualizarSlider = () => {
      wrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
      
      // Actualizar puntos
      dotsContainer.querySelectorAll('.slider-dot').forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentSlide);
      });
      
      // Actualizar contador
      const counter = slider.querySelector('.slide-counter');
      if (counter) {
        counter.textContent = `${currentSlide + 1}/${totalSlides}`;
      }
      
      // Actualizar estado de botones
      if (prevBtn) prevBtn.disabled = currentSlide === 0;
      if (nextBtn) nextBtn.disabled = currentSlide === totalSlides - 1;
    };
    
    // Eventos
    if (prevBtn) {
      prevBtn.onclick = () => {
        if (currentSlide > 0) {
          currentSlide--;
          actualizarSlider();
        }
      };
    }
    
    if (nextBtn) {
      nextBtn.onclick = () => {
        if (currentSlide < totalSlides - 1) {
          currentSlide++;
          actualizarSlider();
        }
      };
    }
    
    // Eventos para puntos
    dotsContainer.querySelectorAll('.slider-dot').forEach((dot, index) => {
      dot.onclick = () => {
        currentSlide = index;
        actualizarSlider();
      };
    });
    
    actualizarSlider();
    return { currentSlide, totalSlides, actualizarSlider };
  }
  
  crearPuntosSlider(slider, total) {
    if (total <= 1) return null;
    
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'slider-dots';
    dotsContainer.innerHTML = Array.from({ length: total }, (_, i) => 
      `<button class="slider-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></button>`
    ).join('');
    
    slider.appendChild(dotsContainer);
    return dotsContainer;
  }
  
  // ========== DETALLES DEL VEHÍCULO ==========
  mostrarDetallesVehiculo(vehicleId) {
    const vehiculo = productosManager.getVehiculoById(vehicleId);
    if (!vehiculo) {
      this.mostrarNotificacion('Vehículo no encontrado', 'error');
      return;
    }
    
    const modalContent = document.getElementById('vehicleModalContent');
    const imagenes = vehiculo.imagenes?.length > 0 ? vehiculo.imagenes : [CONFIG.app.defaultImage];
    
    modalContent.innerHTML = `
      <div class="vehicle-details">
        <div class="slider-container" id="vehicleSlider">
          <div class="slider-wrapper"></div>
          <button class="slider-button-prev"><i class="fas fa-chevron-left"></i></button>
          <button class="slider-button-next"><i class="fas fa-chevron-right"></i></button>
          <div class="slide-counter" style="position:absolute;top:20px;right:20px;background:rgba(0,0,0,0.7);color:white;padding:6px 12px;border-radius:20px;font-size:13px;">1/${imagenes.length}</div>
        </div>
        
        <div class="details-content">
          <div class="vehicle-status">
            ${vehiculo.estado === 'stock' ? 'En Stock Arica' : 
              vehiculo.estado === 'transit' ? 'En Tránsito' : 
              'Para Reservar'}
          </div>
          <h2 class="detail-title">${vehiculo.nombre || 'Vehículo'}</h2>
          <div class="detail-price">${productosManager.formatPrice(vehiculo.precio)}</div>
          <p class="detail-description">${vehiculo.descripcion || 'Sin descripción disponible.'}</p>
          
          <div class="detail-features">
            ${vehiculo.ano ? `<div><i class="fas fa-calendar"></i> Año: ${vehiculo.ano}</div>` : ''}
            ${vehiculo.color ? `<div><i class="fas fa-palette"></i> Color: ${vehiculo.color}</div>` : ''}
            ${vehiculo.motor ? `<div><i class="fas fa-cogs"></i> Motor: ${vehiculo.motor}</div>` : ''}
            ${vehiculo.kilometraje ? `<div><i class="fas fa-road"></i> Kilometraje: ${vehiculo.kilometraje.toLocaleString()} km</div>` : ''}
            ${vehiculo.transmision ? `<div><i class="fas fa-exchange-alt"></i> Transmisión: ${vehiculo.transmision}</div>` : ''}
            ${vehiculo.combustible ? `<div><i class="fas fa-gas-pump"></i> Combustible: ${vehiculo.combustible}</div>` : ''}
          </div>

          <div class="modal-actions">
            <button class="button" onclick="window.open('${productosManager.getWhatsAppUrl(vehiculo)}', '_blank')" style="flex: 1;"> 
              <i class="fab fa-whatsapp"></i> Reservar Ahora 
            </button>
            <button class="button button-outline" onclick="window.UImanager.personalizarVehiculo('${vehicleId}')" style="flex: 1;"> 
              <i class="fas fa-crown"></i> Personalizar 
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Inicializar slider después de agregar el HTML
    setTimeout(() => {
      this.inicializarSlider('vehicleSlider', imagenes);
    }, 100);
    
    this.mostrarModal('vehicleModal');
  }
  
  // ========== PERSONALIZACIÓN (KITS) ==========
  personalizarVehiculo(vehicleId) {
    const vehiculo = productosManager.getVehiculoById(vehicleId);
    if (!vehiculo) {
      this.mostrarNotificacion('Vehículo no encontrado', 'error');
      return;
    }
    
    this.cerrarModal('vehicleModal');
    this.currentVehicle = vehiculo;
    
    const kits = productosManager.getKitsForDisplay();
    const modalContent = document.getElementById('customizationContent');
    
    modalContent.innerHTML = `
      <div class="customization-container">
        <div style="padding: 32px; background: var(--gray-50); text-align: center;">
          <h3 style="font-size: 24px; font-weight: 700; margin-bottom: 12px; color: var(--black);">
            Personalizar ${vehiculo.nombre}
          </h3>
          <p style="color: #86868b; max-width: 500px; margin: 0 auto;">
            Selecciona un kit de upgrade para ver los detalles y precios específicos
          </p>
        </div>
        
        <div style="padding: 32px;">
          <h4 style="font-size: 18px; font-weight: 600; margin-bottom: 24px; color: var(--black);">
            <i class="fas fa-crown"></i> Kits de Upgrade Disponibles
          </h4>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
            ${kits.map(kit => {
              const badgeColor = kit.nivel === 'full' ? 'var(--gold)' : 
                               kit.nivel === 'medium' ? 'var(--silver)' : 'var(--bronze)';
              const textColor = kit.nivel === 'full' ? 'black' : 'white';
              const icon = kit.nivel === 'full' ? 'fa-crown' : 
                          kit.nivel === 'medium' ? 'fa-medal' : 'fa-star';
              
              return `
                <div class="kit-option ${kit.nivel === 'standar' ? 'selected' : ''}" 
                     data-kit-id="${kit.id}"
                     onclick="window.UImanager.seleccionarKit('${kit.id}', '${vehicleId}')"
                     style="border: var(--border); border-radius: var(--radius); padding: 24px; text-align: center; background: white; cursor: pointer; transition: all 0.3s;">
                  <div style="width: 60px; height: 60px; background: ${badgeColor}; border-radius: 30px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: ${textColor};">
                    <i class="fas ${icon}" style="font-size: 24px;"></i>
                  </div>
                  <h5 style="font-size: 18px; font-weight: 600; margin-bottom: 8px; color: var(--black);">
                    ${kit.nombre}
                  </h5>
                  <div style="font-size: 20px; font-weight: 700; margin-bottom: 12px; color: ${badgeColor};">
                    ${kit.precio > 0 ? `+${productosManager.formatPrice(kit.precio)}` : '<span style="color: var(--success);">INCLUIDO</span>'}
                  </div>
                  <p style="color: #86868b; font-size: 14px; margin-bottom: 20px; min-height: 60px;">
                    ${kit.descripcion}
                  </p>
                  
                  <div style="text-align: left; margin-bottom: 20px; display: none;" id="includes-${kit.id}">
                    <div style="font-size: 14px; font-weight: 600; margin-bottom: 12px; color: var(--black);">
                      <i class="fas fa-check-circle" style="color: var(--success); margin-right: 8px;"></i>
                      Incluye:
                    </div>
                    <div style="font-size: 13px; color: #86868b;">
                      ${kit.includes.map(item => `
                        <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px;">
                          <div style="color: var(--success); font-size: 12px; margin-top: 2px;">
                            <i class="fas fa-check"></i>
                          </div>
                          <div>${item}</div>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                  
                  <button class="button" onclick="window.UImanager.contactarConKit('${vehicleId}', '${kit.id}')" style="width: 100%;">
                    <i class="fab fa-whatsapp"></i> Cotizar este Kit
                  </button>
                </div>
              `;
            }).join('')}
          </div>
          
          <div style="margin-top: 32px; padding: 24px; background: var(--gray-50); border-radius: var(--radius); border: var(--border);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <div style="font-size: 17px; font-weight: 600;">Vehículo base</div>
              <div style="font-size: 24px; font-weight: 700;">${productosManager.formatPrice(vehiculo.precio)}</div>
            </div>
            <div id="kit-seleccionado-info" style="display: none; margin-bottom: 16px; padding: 16px; background: white; border-radius: 8px; border-left: 4px solid var(--bronze);">
              <div style="font-weight: 600; color: var(--black);">Kit seleccionado: <span id="kit-nombre">Standard</span></div>
              <div style="font-weight: 700; color: var(--success);" id="kit-precio">INCLUIDO</div>
            </div>
            <div style="border-top: var(--border); padding-top: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="font-weight: 600;">Total con Upgrade</div>
                <div style="font-size: 28px; font-weight: 700;" id="precio-total">${productosManager.formatPrice(vehiculo.precio)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    this.mostrarModal('customizationModal');
    
    // Seleccionar kit por defecto
    setTimeout(() => {
      this.seleccionarKit('standar', vehicleId);
    }, 100);
  }
  
  seleccionarKit(kitId, vehicleId) {
    const vehiculo = productosManager.getVehiculoById(vehicleId);
    if (!vehiculo) return;
    
    const kits = productosManager.getKitsForDisplay();
    const kit = kits.find(k => k.id === kitId);
    if (!kit) return;
    
    // Actualizar selección visual
    document.querySelectorAll('.kit-option').forEach(opt => {
      opt.classList.remove('selected');
      opt.style.borderColor = 'var(--gray-200)';
    });
    
    const selectedOption = document.querySelector(`[data-kit-id="${kitId}"]`);
    if (selectedOption) {
      selectedOption.classList.add('selected');
      selectedOption.style.borderColor = 'var(--black)';
    }
    
    // Mostrar/ocultar detalles
    kits.forEach(k => {
      const includesDiv = document.getElementById(`includes-${k.id}`);
      if (includesDiv) {
        includesDiv.style.display = k.id === kitId ? 'block' : 'none';
      }
    });
    
    // Actualizar info del kit seleccionado
    const kitInfo = document.getElementById('kit-seleccionado-info');
    const kitNombre = document.getElementById('kit-nombre');
    const kitPrecio = document.getElementById('kit-precio');
    const precioTotal = document.getElementById('precio-total');
    
    if (kitInfo && kitNombre && kitPrecio && precioTotal) {
      kitInfo.style.display = 'block';
      kitNombre.textContent = kit.nombre;
      kitPrecio.textContent = kit.precio > 0 ? `+${productosManager.formatPrice(kit.precio)}` : 'INCLUIDO';
      
      const total = (vehiculo.precio || 0) + kit.precio;
      precioTotal.textContent = productosManager.formatPrice(total);
    }
  }
  
  contactarConKit(vehicleId, kitId) {
    const vehiculo = productosManager.getVehiculoById(vehicleId);
    const kits = productosManager.getKitsForDisplay();
    const kit = kits.find(k => k.id === kitId);
    
    if (!vehiculo || !kit) return;
    
    this.cerrarModal('customizationModal');
    window.open(productosManager.getWhatsAppUrl(vehiculo, kit), '_blank');
  }
  
  mostrarTodosVehiculosParaPersonalizacion() {
    const vehiculos = productosManager.vehiculos;
    if (!vehiculos || vehiculos.length === 0) {
      this.mostrarNotificacion('Primero carga los vehículos', 'warning');
      return;
    }
    
    const modalContent = document.getElementById('customizationContent');
    
    modalContent.innerHTML = `
      <div class="customization-container">
        <div style="padding: 32px; background: var(--gray-50); text-align: center;">
          <h3 style="font-size: 24px; font-weight: 700; margin-bottom: 12px; color: var(--black);">
            <i class="fas fa-crown"></i> Kits Upgrade Personalizados
          </h3>
          <p style="color: #86868b; max-width: 400px; margin: 0 auto;">
            Cada vehículo tiene kits de upgrade con precios específicos según modelo
          </p>
        </div>
        
        <div style="padding: 32px;">
          <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Selecciona un Vehículo</h2>
          <p style="color: #86868b; margin-bottom: 32px; font-size: 14px;">Elige un vehículo para ver sus kits de upgrade personalizados</p>
          
          <div style="display: grid; grid-template-columns: 1fr; gap: 16px; max-height: 400px; overflow-y: auto; padding-right: 8px;">
            ${vehiculos.map(vehicle => `
              <div onclick="window.UImanager.personalizarVehiculo('${vehicle.id}')" 
                   style="cursor: pointer; border: var(--border); border-radius: var(--radius); padding: 20px; text-align: center; transition: all 0.3s; background: var(--white);" 
                   onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='var(--shadow)';" 
                   onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                <img src="${vehicle.imagenes?.[0] || CONFIG.app.defaultImage}" 
                     style="width: 100%; height: 120px; object-fit: cover; border-radius: 6px; margin-bottom: 12px;"
                     onerror="this.src='${CONFIG.app.defaultImage}'">
                <div style="font-weight: 500; margin-bottom: 4px; font-size: 15px; color: var(--black);">${vehicle.nombre}</div>
                <div style="font-size: 13px; color: #86868b; margin-bottom: 8px;">
                  ${vehicle.descripcion ? (vehicle.descripcion.substring(0, 60) + '...') : 'Sin descripción'}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
                  <div style="font-size: 17px; font-weight: 600;">${productosManager.formatPrice(vehicle.precio)}</div>
                  <div class="vehicle-status" style="font-size: 11px; padding: 4px 8px;">
                    ${vehicle.estado === 'stock' ? 'En Stock' : 
                      vehicle.estado === 'transit' ? 'En Tránsito' : 
                      'Reserva'}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    
    this.mostrarModal('customizationModal');
  }
  
  // ========== FUNCIONES BÁSICAS DE UI ==========
  mostrarModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  cerrarModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  mostrarNotificacion(mensaje, tipo = 'info') {
    const container = document.getElementById('notificationContainer') || this.crearContenedorNotificaciones();
    
    const notification = document.createElement('div');
    notification.className = `notification ${tipo}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${tipo === 'error' ? 'var(--error)' : tipo === 'success' ? 'var(--success)' : 'var(--blue)'};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 9999;
      animation: slideIn 0.3s ease-out;
      display: flex;
      align-items: center;
      gap: 10px;
    `;
    
    notification.innerHTML = `
      <i class="fas ${tipo === 'error' ? 'fa-exclamation-circle' : tipo === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
      <span>${mensaje}</span>
    `;
    
    container.appendChild(notification);
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }
  
  crearContenedorNotificaciones() {
    const container = document.createElement('div');
    container.id = 'notificationContainer';
    document.body.appendChild(container);
    return container;
  }
}

// Instancia global
export const UImanager = new UIManager();
window.UImanager = UImanager;
