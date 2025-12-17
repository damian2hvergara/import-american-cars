// UI MODALS - Manejo de modales de vehículos
export class UIModals {
  static currentVehicle = null;
  
  static showVehicleDetails(vehicleId, getVehicleCallback, formatPriceCallback) {
    const vehiculo = getVehicleCallback(vehicleId);
    if (!vehiculo) return;
    
    const modalContent = document.getElementById('vehicleModalContent');
    const imagenes = vehiculo.imagenes?.length > 0 ? vehiculo.imagenes : [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ];
    
    modalContent.innerHTML = `
      <div class="vehicle-details">
        <div class="slider-container" id="vehicleSlider">
          <div class="slider-wrapper"></div>
          <button class="slider-button-prev"><i class="fas fa-chevron-left"></i></button>
          <button class="slider-button-next"><i class="fas fa-chevron-right"></i></button>
          <div class="slide-counter">1/${imagenes.length}</div>
        </div>
        
        <div class="details-content">
          <div class="vehicle-status">
            ${vehiculo.estado === 'stock' ? 'En Stock Arica' : 
              vehiculo.estado === 'transit' ? 'En Tránsito' : 
              'Para Reservar'}
          </div>
          <h2 class="detail-title">${vehiculo.nombre || 'Vehículo'}</h2>
          <div class="detail-price">${formatPriceCallback(vehiculo.precio)}</div>
          
          <div class="detail-features">
            ${vehiculo.ano ? `<div><i class="fas fa-calendar"></i> ${vehiculo.ano}</div>` : ''}
            ${vehiculo.color ? `<div><i class="fas fa-palette"></i> ${vehiculo.color}</div>` : ''}
            ${vehiculo.motor ? `<div><i class="fas fa-cogs"></i> ${vehiculo.motor}</div>` : ''}
            ${vehiculo.kilometraje ? `<div><i class="fas fa-road"></i> ${vehiculo.kilometraje.toLocaleString()} km</div>` : ''}
          </div>

          <div class="modal-actions">
            <button class="button" onclick="window.UI.contactVehicle('${vehicleId}')">
              <i class="fab fa-whatsapp"></i> WhatsApp
            </button>
            <button class="button button-outline" onclick="window.UI.customizeVehicle('${vehicleId}')">
              <i class="fas fa-crown"></i> Personalizar
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Inicializar slider después de un breve delay
    setTimeout(() => {
      if (window.UISlider) {
        window.UISlider.init('vehicleSlider', imagenes, vehiculo.nombre);
      }
    }, 100);
    
    this.currentVehicle = vehiculo;
    window.UICore.showModal('vehicleModal');
  }
  
  static closeAllModals() {
    window.UICore.closeModal('vehicleModal');
    window.UICore.closeModal('customizationModal');
  }
  
  static setupModalEvents() {
    // Botones de cerrar
    document.getElementById('closeVehicleModal')?.addEventListener('click', () => {
      this.closeAllModals();
    });
    
    document.getElementById('closeCustomizationModal')?.addEventListener('click', () => {
      this.closeAllModals();
    });
  }
}
