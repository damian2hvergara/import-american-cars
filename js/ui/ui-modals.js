// UI MODALS - Manejo de modales de vehículos
export class UIModals {
  static currentVehicle = null;
  static currentSlide = 0;
  
  static showVehicleDetails(vehicleId) {
    const vehiculo = window.productosManager?.getVehiculoById(vehicleId);
    if (!vehiculo) {
      console.error(`❌ Vehículo ${vehicleId} no encontrado`);
      return;
    }
    
    this.currentVehicle = vehiculo;
    this.currentSlide = 0;
    
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
          <div class="slider-wrapper" style="display: flex; transition: transform 0.3s ease-out;">
            ${imagenes.map((url, index) => `
              <div class="slider-slide" data-index="${index}" style="flex: 0 0 100%; width: 100%;">
                <img src="${url}" 
                     alt="Imagen ${index + 1} de ${vehiculo.nombre}" 
                     style="width: 100%; height: 400px; object-fit: contain; padding: 20px;"
                     onerror="this.src='https://images.unsplash.com/photo-1549399542-7e3f8b79c341?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'">
              </div>
            `).join('')}
          </div>
          
          ${imagenes.length > 1 ? `
            <button class="slider-button-prev" onclick="window.UIModals.prevSlide()" style="position: absolute; top: 50%; left: 16px; transform: translateY(-50%); background: rgba(255, 255, 255, 0.9); border: 1px solid #d2d2d7; border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: black; transition: all 0.3s; font-size: 18px;">
              <i class="fas fa-chevron-left"></i>
            </button>
            <button class="slider-button-next" onclick="window.UIModals.nextSlide(${imagenes.length})" style="position: absolute; top: 50%; right: 16px; transform: translateY(-50%); background: rgba(255, 255, 255, 0.9); border: 1px solid #d2d2d7; border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: black; transition: all 0.3s; font-size: 18px;">
              <i class="fas fa-chevron-right"></i>
            </button>
            
            <div class="slider-dots" style="position: absolute; bottom: 20px; left: 0; right: 0; display: flex; justify-content: center; gap: 8px;">
              ${imagenes.map((_, index) => `
                <button class="slider-dot ${index === 0 ? 'active' : ''}" 
                        onclick="window.UIModals.goToSlide(${index})"
                        style="width: 8px; height: 8px; border-radius: 50%; background: ${index === 0 ? 'black' : 'rgba(0, 0, 0, 0.3)'}; border: none; cursor: pointer; transition: background 0.3s; padding: 0;">
                </button>
              `).join('')}
            </div>
          ` : ''}
        </div>
        
        <div class="details-content" style="padding: 32px;">
          <div class="vehicle-status" style="display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; margin-bottom: 12px; background: rgba(0, 0, 0, 0.05); color: black;">
            ${vehiculo.estado === 'stock' ? 'En Stock Arica' : 
              vehiculo.estado === 'transit' ? 'En Tránsito' : 
              'Para Reservar'}
          </div>
          <h2 class="detail-title" style="font-size: 21px; font-weight: 600; margin-bottom: 8px;">${vehiculo.nombre || 'Vehículo'}</h2>
          <div class="detail-price" style="font-size: 21px; font-weight: 600; margin-bottom: 24px; color: black;">
            ${window.productosManager?.formatPrice(vehiculo.precio) || 'Consultar'}
          </div>
          
          <div class="detail-features" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; padding: 16px; background: #f5f5f7; border-radius: 8px;">
            ${vehiculo.ano ? `<div style="display: flex; align-items: center; gap: 8px;"><i class="fas fa-calendar" style="color: #86868b;"></i> <span>Año: ${vehiculo.ano}</span></div>` : ''}
            ${vehiculo.color ? `<div style="display: flex; align-items: center; gap: 8px;"><i class="fas fa-palette" style="color: #86868b;"></i> <span>Color: ${vehiculo.color}</span></div>` : ''}
            ${vehiculo.motor ? `<div style="display: flex; align-items: center; gap: 8px;"><i class="fas fa-cogs" style="color: #86868b;"></i> <span>Motor: ${vehiculo.motor}</span></div>` : ''}
            ${vehiculo.kilometraje ? `<div style="display: flex; align-items: center; gap: 8px;"><i class="fas fa-road" style="color: #86868b;"></i> <span>${vehiculo.kilometraje.toLocaleString()} km</span></div>` : ''}
            ${vehiculo.modelo ? `<div style="display: flex; align-items: center; gap: 8px;"><i class="fas fa-car" style="color: #86868b;"></i> <span>Modelo: ${vehiculo.modelo}</span></div>` : ''}
            ${vehiculo.marca ? `<div style="display: flex; align-items: center; gap: 8px;"><i class="fas fa-industry" style="color: #86868b;"></i> <span>Marca: ${vehiculo.marca}</span></div>` : ''}
          </div>
          
          ${vehiculo.descripcion ? `
            <div style="margin-bottom: 32px;">
              <h4 style="font-size: 17px; font-weight: 600; margin-bottom: 8px;">Descripción</h4>
              <p style="color: #86868b; line-height: 1.5;">${vehiculo.descripcion}</p>
            </div>
          ` : ''}

          <div class="modal-actions" style="display: flex; gap: 12px;">
            <button class="button" onclick="window.UIManager.contactVehicle('${vehicleId}')" style="flex: 1;">
              <i class="fab fa-whatsapp"></i> Consultar por WhatsApp
            </button>
            <button class="button button-outline" onclick="window.UIManager.customizeVehicle('${vehicleId}')" style="flex: 1;">
              <i class="fas fa-crown"></i> Personalizar con Kit
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Inicializar slider
    this.updateSlider();
    
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
  
  static nextSlide(totalSlides) {
    if (this.currentSlide < totalSlides - 1) {
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
        dot.style.background = index === this.currentSlide ? 'black' : 'rgba(0, 0, 0, 0.3)';
      });
    }
    
    // Actualizar botones de navegación
    if (prevBtn) {
      prevBtn.disabled = this.currentSlide === 0;
      prevBtn.style.opacity = this.currentSlide === 0 ? '0.3' : '1';
    }
    
    if (nextBtn) {
      const totalSlides = dots ? dots.length : 1;
      nextBtn.disabled = this.currentSlide === totalSlides - 1;
      nextBtn.style.opacity = this.currentSlide === totalSlides - 1 ? '0.3' : '1';
    }
  }
  
  static closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      modal.classList.remove('active');
    });
    document.body.style.overflow = '';
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
