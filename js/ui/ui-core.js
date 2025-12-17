// UI CORE - Funciones básicas de UI
export class UICore {
  // Mostrar/ocultar loading
  static showLoading(containerId = 'vehiclesContainer') {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
        <div class="loading-placeholder">
          <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
          <p>Cargando...</p>
        </div>
      `;
    }
  }
  
  static hideLoading(containerId = 'vehiclesContainer') {
    // Se puede implementar lógica para restaurar contenido anterior
  }
  
  // Mostrar/ocultar modal
  static showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }
  }
  
  static closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
  }
  
  // Actualizar contadores
  static updateCounter(elementId, count) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = count;
      element.classList.add('updated');
      setTimeout(() => element.classList.remove('updated'), 300);
    }
  }
  
  // Actualizar filtros
  static updateFilterButtons(activeFilter) {
    document.querySelectorAll('.filter-button').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.filter === activeFilter) {
        btn.classList.add('active');
      }
    });
  }
  
  // Configurar eventos básicos
  static setupEventListeners() {
    // Cerrar modales con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });
    
    // Cerrar modales al hacer click fuera
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.closeModal(e.target.id);
      }
    });
    
    // Botones de cerrar modales
    document.querySelectorAll('.close-modal').forEach(button => {
      button.addEventListener('click', function() {
        const modal = this.closest('.modal');
        if (modal) {
          UICore.closeModal(modal.id);
        }
      });
    });
  }
  
  // Cerrar todos los modales
  static closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.classList.remove('active');
    });
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }
  
  // Mostrar mensaje de error
  static showErrorMessage(message, duration = 5000) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'notification error';
    errorDiv.innerHTML = `
      <i class="fas fa-exclamation-circle"></i>
      <span>${message}</span>
    `;
    
    const container = document.getElementById('notificationContainer') || 
                     this.createNotificationContainer();
    container.appendChild(errorDiv);
    
    // Auto-eliminar
    setTimeout(() => {
      errorDiv.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => errorDiv.remove(), 300);
    }, duration);
  }
  
  // Crear contenedor de notificaciones si no existe
  static createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notificationContainer';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    document.body.appendChild(container);
    return container;
  }
  
  // Scroll suave a elemento
  static smoothScrollTo(elementId, offset = 60) {
    const element = document.getElementById(elementId);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }
}
