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
        <div class="customization-header">
          <h3>Personalizar ${vehiculo.nombre}</h3>
          <p>Selecciona un kit de upgrade para ver el precio total</p>
        </div>
        
        <div class="customization-body">
          <div class="kits-options-grid">
            ${kits.map(kit => `
              <div class="kit-option ${kit.id === 'standard' ? 'selected' : ''}" 
                   data-kit-id="${kit.id}"
                   onclick="window.UIKits.selectKit('${kit.id}', '${vehicleId}')">
                <div class="kit-icon" style="color: ${kit.color};">
                  <i class="fas ${kit.icon}"></i>
                </div>
                <h4>${kit.nombre}</h4>
                <div class="kit-price">
                  ${kit.precio > 0 ? `+${window.productosManager?.formatPrice(kit.precio) || 'Consultar'}` : 'INCLUIDO'}
                </div>
                <p>${kit.descripcion}</p>
                <ul class="kit-features">
                  ${kit.includes.map(item => `<li><i class="fas fa-check"></i> ${item}</li>`).join('')}
                </ul>
                <button class="button" onclick="window.UIKits.contactWithKit('${vehicleId}', '${kit.id}')" style="margin-top: auto;">
                  <i class="fab fa-whatsapp"></i> Cotizar este kit
                </button>
              </div>
            `).join('')}
          </div>
          
          <div class="customization-summary">
            <div class="summary-line">
              <span>Vehículo base</span>
              <span class="price-value">${window.productosManager?.formatPrice(vehiculo.precio) || 'Consultar'}</span>
            </div>
            <div id="kit-selection-line" class="summary-line" style="${kits.find(k => k.id === 'standard') ? '' : 'display: none;'}">
              <span id="selected-kit-name">Kit Standard</span>
              <span id="selected-kit-price" class="price-value">INCLUIDO</span>
            </div>
            <div class="summary-total">
              <span>Total estimado</span>
              <span id="total-price">${window.productosManager?.formatPrice(vehiculo.precio) || 'Consultar'}</span>
            </div>
          </div>
          
          <div class="modal-actions">
            <button class="button button-outline" onclick="window.UIModals.closeAllModals()">
              <i class="fas fa-times"></i> Cancelar
            </button>
            <button class="button" onclick="window.UIKits.contactWithSelectedKit('${vehicleId}')">
              <i class="fab fa-whatsapp"></i> Cotizar por WhatsApp
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Seleccionar kit por defecto
    this.selectKit('standard', vehicleId);
    
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
        const total = (vehiculo.precio || 0) + (kit.precio || 0);
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
  
  static contactWithSelectedKit(vehicleId) {
    if (!this.selectedKit) {
      this.selectKit('standard', vehicleId);
    }
    
    this.contactWithKit(vehicleId, this.selectedKit.id);
  }
  
  static closeModal() {
    const modal = document.getElementById('customizationModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
  }
  
  // Hacer métodos disponibles globalmente
  static setup() {
    window.UIKits = UIKits;
  }
}

// Inicializar
UIKits.setup();
