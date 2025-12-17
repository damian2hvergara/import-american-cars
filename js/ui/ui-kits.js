// UI KITS - Manejo de kits de personalización
export class UIKits {
  static selectedKit = null;
  static vehicleForCustomization = null;
  
  static showKitsModal(vehicleId, getVehicleCallback, getKitsCallback, formatPriceCallback) {
    const vehiculo = getVehicleCallback(vehicleId);
    if (!vehiculo) return;
    
    this.vehicleForCustomization = vehiculo;
    const kits = getKitsCallback();
    
    const modalContent = document.getElementById('customizationContent');
    modalContent.innerHTML = `
      <div class="customization-container">
        <div style="padding: 32px; text-align: center;">
          <h3>Personalizar ${vehiculo.nombre}</h3>
          <p>Selecciona un kit de upgrade</p>
        </div>
        
        <div style="padding: 32px;">
          <div class="kits-grid">
            ${kits.map(kit => `
              <div class="kit-option ${kit.id === 'standar' ? 'selected' : ''}" 
                   data-kit-id="${kit.id}"
                   onclick="window.UIKits.selectKit('${kit.id}', ${vehicleId})">
                <div class="kit-icon">
                  <i class="fas ${kit.id === 'full' ? 'fa-crown' : kit.id === 'medium' ? 'fa-medal' : 'fa-star'}"></i>
                </div>
                <h4>${kit.nombre}</h4>
                <div class="kit-price">
                  ${kit.precio > 0 ? `+${formatPriceCallback(kit.precio)}` : 'INCLUIDO'}
                </div>
                <p>${kit.descripcion}</p>
                <button class="button" onclick="window.UIKits.contactWithKit('${vehicleId}', '${kit.id}')">
                  <i class="fab fa-whatsapp"></i> Cotizar
                </button>
              </div>
            `).join('')}
          </div>
          
          <div class="customization-summary">
            <div class="summary-line">
              <span>Vehículo base</span>
              <span class="price-value">${formatPriceCallback(vehiculo.precio)}</span>
            </div>
            <div id="kit-selection-line" class="summary-line" style="display: none;">
              <span id="selected-kit-name">Kit Standard</span>
              <span id="selected-kit-price" class="price-value">INCLUIDO</span>
            </div>
            <div class="summary-total">
              <span>Total</span>
              <span id="total-price">${formatPriceCallback(vehiculo.precio)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Seleccionar kit por defecto
    this.selectKit('standar', vehicleId);
    window.UICore.showModal('customizationModal');
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
      kitPrice.textContent = kit.precio > 0 ? `+${window.productosManager.formatPrice(kit.precio)}` : 'INCLUIDO';
      
      const vehiculo = window.productosManager?.getVehiculoById(vehicleId);
      if (vehiculo) {
        const total = (vehiculo.precio || 0) + kit.precio;
        totalPrice.textContent = window.productosManager.formatPrice(total);
      }
    }
    
    this.selectedKit = kit;
  }
  
  static contactWithKit(vehicleId, kitId) {
    const vehiculo = window.productosManager?.getVehiculoById(vehicleId);
    const kits = window.productosManager?.getKitsForDisplay() || [];
    const kit = kits.find(k => k.id === kitId);
    
    if (!vehiculo || !kit) return;
    
    window.UICore.closeModal('customizationModal');
    
    // Abrir WhatsApp
    if (window.productosManager?.getWhatsAppUrl) {
      const url = window.productosManager.getWhatsAppUrl(vehiculo, kit);
      window.open(url, '_blank');
    }
  }
}
