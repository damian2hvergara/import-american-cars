// ui-manager.js - ORQUESTADOR PRINCIPAL DE UI
import { UICore } from './ui-core.js';
import { UIModals } from './ui-modals.js';
import { UIKits } from './ui-kits.js';
import { UISlider } from './ui-slider.js';
import { UINotifications } from './ui-notifications.js';

export class UIManager {
  static init() {
    console.log('🎭 Inicializando UIManager...');
    
    // Configurar eventos básicos
    UICore.setupEventListeners();
    UIModals.setupModalEvents();
    
    // Hacer disponible globalmente
    window.UIManager = this;
    window.UI = this;  // Alias para compatibilidad
    
    console.log('✅ UIManager listo');
    return true;
  }
  
  // ========== MÉTODOS PÚBLICOS ==========
  
  // Para vehiculos-manager.js y productos.js
  static mostrarDetallesVehiculo(vehicleId) {
    const vehiculo = window.productosManager?.getVehiculoById(vehicleId);
    if (!vehiculo) return;
    
    UIModals.showVehicleDetails(
      vehicleId,
      () => window.productosManager?.getVehiculoById(vehicleId),
      (price) => window.productosManager?.formatPrice(price)
    );
  }
  
  // Para app.js
  static showNotification(mensaje, tipo = 'info') {
    UINotifications.show(mensaje, tipo);
  }
  
  static showError(mensaje) {
    UINotifications.show(mensaje, 'error');
  }
  
  // Para productos.js (filtros)
  static updateFilterButtons(activeFilter) {
    UICore.updateFilterButtons(activeFilter);
  }
  
  static updateCounter(elementId, count) {
    UICore.updateCounter(elementId, count);
  }
  
  // Para botones en HTML
  static customizeVehicle(vehicleId) {
    UIKits.showKitsModal(
      vehicleId,
      () => window.productosManager?.getVehiculoById(vehicleId),
      () => window.productosManager?.getKitsForDisplay(),
      (price) => window.productosManager?.formatPrice(price)
    );
  }
  
  static contactVehicle(vehicleId, kitId = null) {
    const vehiculo = window.productosManager?.getVehiculoById(vehicleId);
    if (!vehiculo) return;
    
    const kits = window.productosManager?.getKitsForDisplay() || [];
    const kit = kitId ? kits.find(k => k.id === kitId) : null;
    
    if (window.productosManager?.getWhatsAppUrl) {
      const url = window.productosManager.getWhatsAppUrl(vehiculo, kit);
      window.open(url, '_blank');
    }
  }
  
  // Slider
  static initSlider(sliderId, images, vehicleName = '') {
    UISlider.init(sliderId, images, vehicleName);
  }
}
