// UI MODALS - Manejo de modales de vehículos
import { UISlider } from './ui-slider.js';

export class UIModals {
  static currentVehicle = null;
  static currentSlide = 0;
  static totalSlides = 0;
  
  static showVehicleDetails(vehicleId) {
    const vehiculo = window.productosManager?.getVehiculoById(vehicleId);
    if (!vehiculo) {
      console.error(`❌ Vehículo ${vehicleId} no encontrado`);
      return;
    }
    
    this.currentVehicle = vehiculo;
    this.currentSlide = 0;
    this.totalSlides = vehiculo.imagenes?.length || 0;
    
    const imagenes = vehiculo.imagenes?.length > 0 ? vehiculo.imagenes : [
      vehiculo.imagen_principal || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ];
    
    const modalContent = document.getElementById('vehicleModalContent');
    if (!modalContent) {
      console.error('❌ Elemento vehicleModalContent no encontrado');
      return;
    }
    
    modalContent.innerHTML = `
      <div class="vehicle-details">
        <div class="slider-container" id="vehicleSlider">
          <div class="slider-wrapper">
            ${imagenes.map((url, index) => `
              <div class="slider-slide" data-index="${index}">
                <img src="${url}" 
                     alt="Imagen ${index + 1} de ${vehiculo.nombre}" 
                     onerror="this.src='https://images.unsplash.com/photo-1549399542-7e3f8b79c341?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'">
              </div>
            `).join('')}
          </div>
          
          ${imagenes.length > 1 ? `
            <button class="slider-button-prev" onclick="window.UIModals.prevSlide()">
              <i class="fas fa-chevron-left"></i>
            </button>
            <button class="slider-button-next" onclick="window.UIModals.nextSlide()">
              <i class="fas fa-chevron-right"></i>
            </button>
            
            <div class="slider-dots">
              ${imagenes.map((_, index) => `
                <button class="slider-dot ${index === 0 ? 'active' : ''}" 
                        onclick="window.UIModals.goToSlide(${index})">
                </button>
              `).join('')}
            </div>
          ` : ''}
        </div>
        
        <div class="details-content">
          <div class="vehicle-status" style="background: ${window.productosManager.getEstadoColor(vehiculo.estado)}10; color: ${window.productosManager.getEstadoColor(vehiculo.estado)};">
            ${window.productosManager.getEstadoTexto(vehiculo.estado)}
          </div>
          <h2 class="detail-title">${vehiculo.nombre || 'Vehículo'}</h2>
          <div class="detail-price">
            ${window.productosManager?.formatPrice(vehiculo.precio) || 'Consultar'}
          </div>
          
          <div class="detail-features">
            ${vehiculo.ano ? `<div><i class="fas fa-calendar"></i> <span>Año: ${vehiculo.ano}</span></div>` : ''}
            ${vehiculo.color ? `<div><i class="fas fa-palette"></i> <span>Color: ${vehiculo.color}</span></div>` : ''}
            ${vehiculo.motor ? `<div><i class="fas fa-cogs"></i> <span>Motor: ${vehiculo.motor}</span></div>` : ''}
            ${vehiculo.kilometraje ? `<div><i class="fas fa-road"></i> <span>${vehiculo.kilometraje.toLocaleString()} km</span></div>` : ''}
            ${vehiculo.modelo ? `<div><i class="fas fa-car"></i> <span>Modelo: ${vehiculo.modelo}</span></div>` : ''}
            ${vehiculo.marca ? `<div><i class="fas fa-industry"></i> <span>Marca: ${vehiculo.marca}</span></div>` : ''}
            ${vehiculo.transmision ? `<div><i class="fas fa-cog"></i> <span>Transmisión: ${vehiculo.transmision}</span></div>` : ''}
            ${vehiculo.combustible ? `<div><i class="fas fa-gas-pump"></i> <span>Combustible: ${vehiculo.combustible}</span></div>` : ''}
          </div>
          
          ${vehiculo.descripcion ? `
            <div class="detail-description">
              <h4>Descripción</h4>
              <p>${vehiculo.descripcion}</p>
            </div>
          ` : ''}

          <div class="modal-actions">
            <button class="button" onclick="window.UIManager.contactVehicle('${vehicleId}')">
              <i class="fab fa-whatsapp"></i> Consultar por WhatsApp
            </button>
            <button class="button button-outline" onclick="window.UIManager.customizeVehicle('${vehicleId}')">
              <i class="fas fa-crown"></i> Personalizar con Kit
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Inicializar slider
    if (imagenes.length > 0) {
      UISlider.init('vehicleSlider', imagenes, vehiculo.nombre);
    }
    
    // Mostrar modal
    const modal = document.getElementById('vehicleModal');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }
  
  // Métodos del slider
  static prevSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
      this.updateSlider();
    }
  }
  
  static nextSlide() {
    if (this.currentSlide < this.totalSlides - 1) {
      this.currentSlide++;
      this.updateSlider();
    }
  }
  
  static goToSlide(index) {
    this.currentSlide = index;
    this.updateSlider();
  }
  
  static updateSlider() {
    const wrapper = document.querySelector('#vehicleSlider .slider-wrapper');
    const dots = document.querySelectorAll('#vehicleSlider .slider-dot');
    const prevBtn = document.querySelector('#vehicleSlider .slider-button-prev');
    const nextBtn = document.querySelector('#vehicleSlider .slider-button-next');
    
    if (wrapper) {
      wrapper.style.transform = `translateX(-${this.currentSlide * 100}%)`;
    }
    
    // Actualizar dots
    if (dots) {
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === this.currentSlide);
      });
    }
    
    // Actualizar botones de navegación
    if (prevBtn) {
      prevBtn.disabled = this.currentSlide === 0;
      prevBtn.style.opacity = this.currentSlide === 0 ? '0.3' : '1';
      prevBtn.style.cursor = this.currentSlide === 0 ? 'default' : 'pointer';
    }
    
    if (nextBtn) {
      nextBtn.disabled = this.currentSlide === this.totalSlides - 1;
      nextBtn.style.opacity = this.currentSlide === this.totalSlides - 1 ? '0.3' : '1';
      nextBtn.style.cursor = this.currentSlide === this.totalSlides - 1 ? 'default' : 'pointer';
    }
  }
  
  static closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      modal.classList.remove('active');
    });
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }
  
  static setupModalEvents() {
    // Botones de cerrar
    document.getElementById('closeVehicleModal')?.addEventListener('click', () => {
      this.closeAllModals();
    });
    
    document.getElementById('closeCustomizationModal')?.addEventListener('click', () => {
      this.closeAllModals();
    });
    
    // Cerrar modal al hacer click fuera
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.closeAllModals();
      }
    });
    
    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });
    
    // Hacer métodos disponibles globalmente
    window.UIModals = UIModals;
  }
}
