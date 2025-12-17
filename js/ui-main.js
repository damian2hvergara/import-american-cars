// UI MAIN - Orquestador principal
import { UICore } from './ui/ui-core.js';
import { UISlider } from './ui/ui-slider.js';
import { UIModals } from './ui/ui-modals.js';
import { UIKits } from './ui/ui-kits.js';
import { UINotifications } from './ui/ui-notifications.js';

// Exportar todo como un solo objeto UI
export const UI = {
  // Core
  showLoading: UICore.showLoading,
  hideLoading: UICore.hideLoading,
  showModal: UICore.showModal,
  closeModal: UICore.closeModal,
  updateCounter: UICore.updateCounter,
  updateFilterButtons: UICore.updateFilterButtons,
  
  // Slider
  initSlider: UISlider.init,
  sliderPrev: (sliderId) => {
    const slider = UISlider.sliders.get(sliderId);
    if (slider && slider.currentSlide > 0) {
      slider.currentSlide--;
      slider.updateSlider();
    }
  },
  sliderNext: (sliderId) => {
    const slider = UISlider.sliders.get(sliderId);
    if (slider && slider.currentSlide < slider.totalSlides - 1) {
      slider.currentSlide++;
      slider.updateSlider();
    }
  },
  goToSlide: UISlider.goToSlide,
  
  // Modals
  showVehicleDetails: UIModals.showVehicleDetails,
  customizeVehicle: UIKits.showKitsModal,
  
  // Kits
  selectKit: UIKits.selectKit,
  contactVehicle: (vehicleId, kitId = null) => {
    const vehiculo = window.productosManager?.getVehiculoById(vehicleId);
    if (!vehiculo) return;
    
    const kits = window.productosManager?.getKitsForDisplay() || [];
    const kit = kitId ? kits.find(k => k.id === kitId) : null;
    
    if (window.productosManager?.getWhatsAppUrl) {
      const url = window.productosManager.getWhatsAppUrl(vehiculo, kit);
      window.open(url, '_blank');
    }
  },
  
  // Notifications
  showNotification: UINotifications.show,
  showError: (msg) => UINotifications.show(msg, 'error')
};

// Hacer disponible globalmente
window.UI = UI;

// Inicializar
UI.init = () => {
  UICore.setupEventListeners();
  UIModals.setupModalEvents();
  console.log('✅ UI modular inicializada');
};
