// UI CORE - Funciones básicas de UI
export class UICore {
  // Mostrar/ocultar loading
  static showLoading(containerId = 'vehiclesContainer') {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
          <div style="font-size: 32px; margin-bottom: 16px; color: #86868b;">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
          <p style="color: #86868b;">Cargando...</p>
        </div>
      `;
    }
  }
  
  static hideLoading() {}
  
  // Mostrar/ocultar modal
  static showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }
  
  static closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
  
  // Actualizar contadores
  static updateCounter(elementId, count) {
    const element = document.getElementById(elementId);
    if (element) element.textContent = count;
  }
  
  // Actualizar filtros
  static updateFilterButtons(activeFilter) {
    document.querySelectorAll('.filter-button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === activeFilter);
    });
  }
  
  // Configurar eventos básicos
  static setupEventListeners() {
    // Cerrar modales con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal('vehicleModal');
        this.closeModal('customizationModal');
      }
    });
    
    // Cerrar modales al hacer click fuera
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.closeModal(e.target.id);
      }
    });
  }
}
