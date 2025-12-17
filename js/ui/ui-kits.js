// UI KITS - Manejo de kits de personalización
export class UIKits {
  static selectedKit = null;
  static vehicleForCustomization = null;
  
  static showKitsModal(vehicleId) {
    // Obtener datos usando window.productosManager
    const vehiculo = window.productosManager?.getVehiculoById(vehicleId);
    if (!vehiculo) {
      console.error(`❌ Vehículo ${vehicleId} no encontrado`);
      return;
    }
    
    this.vehicleForCustomization = vehiculo;
    const kits = window.productosManager?.getKitsForDisplay() || [];
    
    const modalContent = document.getElementById('customizationContent');
    if (!modalContent) {
      console.error('❌ Elemento customizationContent no encontrado');
      return;
    }
    
    modalContent.innerHTML = `
      <div class="customization-container">
        <div style="padding: 32px; text-align: center;">
          <h3 style="font-size: 21px; font-weight: 600; margin-bottom: 8px;">Personalizar ${vehiculo.nombre}</h3>
          <p style="color: #86868b;">Selecciona un kit de upgrade</p>
        </div>
        
        <div style="padding: 32px;">
          <div class="kits-grid" style="margin-bottom: 32px;">
            ${kits.map(kit => `
              <div class="kit-option ${kit.id === 'standar' ? 'selected' : ''}" 
                   data-kit-id="${kit.id}"
                   onclick="window.UIKits.selectKit('${kit.id}', '${vehicleId}')">
                <div class="kit-icon" style="font-size: 32px; margin-bottom: 16px; color: ${this.getKitColor(kit.id)};">
                  <i class="fas ${this.getKitIcon(kit.id)}"></i>
                </div>
                <h4 style="font-size: 17px; font-weight: 600; margin-bottom: 8px;">${kit.nombre}</h4>
                <div class="kit-price" style="font-size: 14px; color: #86868b; margin-bottom: 12px;">
                  ${kit.precio > 0 ? `+${window.productosManager?.formatPrice(kit.precio) || 'Consultar'}` : 'INCLUIDO'}
                </div>
                <p style="color: #86868b; font-size: 14px; margin-bottom: 16px;">${kit.descripcion}</p>
                <button class="button" onclick="window.UIKits.contactWithKit('${vehicleId}', '${kit.id}')" style="margin-top: auto;">
                  <i class="fab fa-whatsapp"></i> Cotizar
                </button>
              </div>
            `).join('')}
          </div>
          
          <div class="customization-summary">
            <div class="summary-line">
              <span>Vehículo base</span>
              <span class="price-value">${window.productosManager?.formatPrice(vehiculo.precio) || 'Consultar'}</span>
            </div>
            <div id="kit-selection-line" class="summary-line" style="display: none;">
              <span id="selected-kit-name">Kit Standard</span>
              <span id="selected-kit-price" class="price-value">INCLUIDO</span>
            </div>
            <div class="summary-total">
              <span>Total</span>
              <span id="total-price">${window.productosManager?.formatPrice(vehiculo.precio) || 'Consultar'}</span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Añadir estilos para kit-option
    this.addKitOptionStyles();
    
    // Seleccionar kit por defecto
    this.selectKit('standar', vehicleId);
    
    // Mostrar modal
    const modal = document.getElementById('customizationModal');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }
  
  static selectKit(kitId, vehicleId) {
    const kits = window.productosManager?.getKitsForDisplay() || [];
    const kit = kits.find(k => k.id === kitId);
    if (!kit) return;
    
    // Actualizar selección visual
    document.querySelectorAll('.kit-option').forEach(opt => {
      opt.classList.remove('selected');
    });
    
    const selectedOpt = document.querySelector(`[data-kit-id="${kitId}"]`);
    if (selectedOpt) selectedOpt.classList.add('selected');
    
    // Actualizar resumen
    const kitLine = document.getElementById('kit-selection-line');
    const kitName = document.getElementById('selected-kit-name');
    const kitPrice = document.getElementById('selected-kit-price');
    const totalPrice = document.getElementById('total-price');
    
    if (kitLine && kitName && kitPrice && totalPrice) {
      kitLine.style.display = 'flex';
      kitName.textContent = `Kit ${kit.nombre}`;
      kitPrice.textContent = kit.precio > 0 ? 
        `+${window.productosManager?.formatPrice(kit.precio) || 'Consultar'}` : 
        'INCLUIDO';
      
      const vehiculo = window.productosManager?.getVehiculoById(vehicleId);
      if (vehiculo) {
        const total = (vehiculo.precio || 0) + kit.precio;
        totalPrice.textContent = window.productosManager?.formatPrice(total) || 'Consultar';
      }
    }
    
    this.selectedKit = kit;
  }
  
  static contactWithKit(vehicleId, kitId) {
    const vehiculo = window.productosManager?.getVehiculoById(vehicleId);
    const kits = window.productosManager?.getKitsForDisplay() || [];
    const kit = kits.find(k => k.id === kitId);
    
    if (!vehiculo || !kit) return;
    
    // Cerrar modal
    this.closeModal();
    
    // Abrir WhatsApp
    if (window.productosManager?.getWhatsAppUrl) {
      const url = window.productosManager.getWhatsAppUrl(vehiculo, kit);
      window.open(url, '_blank');
    }
  }
  
  static closeModal() {
    const modal = document.getElementById('customizationModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
  
  // Métodos auxiliares
  static getKitIcon(kitId) {
    switch(kitId) {
      case 'full': return 'fa-crown';
      case 'medium': return 'fa-medal';
      case 'standar': 
      default: return 'fa-star';
    }
  }
  
  static getKitColor(kitId) {
    switch(kitId) {
      case 'full': return '#FFD700'; // gold
      case 'medium': return '#C0C0C0'; // silver
      case 'standar': 
      default: return '#0066cc'; // blue
    }
  }
  
  static addKitOptionStyles() {
    if (!document.querySelector('#kit-option-styles')) {
      const style = document.createElement('style');
      style.id = 'kit-option-styles';
      style.textContent = `
        .kit-option {
          border: 1px solid #d2d2d7;
          border-radius: 12px;
          padding: 24px;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
          background: white;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        
        .kit-option:hover {
          border-color: black;
          transform: translateY(-4px);
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
        }
        
        .kit-option.selected {
          border-color: black;
          background: rgba(0, 0, 0, 0.02);
          transform: translateY(-4px);
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
        }
      `;
      document.head.appendChild(style);
    }
  }
}
