// UI NOTIFICATIONS - Sistema de notificaciones
export class UINotifications {
  static show(message, type = 'info', duration = 5000) {
    const container = this.getContainer();
    const notification = this.createNotification(message, type);
    
    container.appendChild(notification);
    
    // Auto-eliminar después de la duración especificada
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        if (notification.parentNode === container) {
          container.removeChild(notification);
        }
      }, 300);
    }, duration);
    
    // Permitir cerrar manualmente
    notification.addEventListener('click', () => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        if (notification.parentNode === container) {
          container.removeChild(notification);
        }
      }, 300);
    });
  }
  
  static createNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = this.getIcon(type);
    const color = this.getColor(type);
    
    notification.innerHTML = `
      <i class="fas ${icon}" style="color: ${color};"></i>
      <span>${message}</span>
      <button class="close-notification" style="margin-left: auto; background: none; border: none; color: #86868b; cursor: pointer;">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    // Evento para el botón de cerrar
    const closeBtn = notification.querySelector('.close-notification');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    });
    
    return notification;
  }
  
  static getContainer() {
    let container = document.getElementById('notificationContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'notificationContainer';
      container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 400px;
      `;
      document.body.appendChild(container);
    }
    return container;
  }
  
  static getColor(type) {
    const colors = {
      success: '#34C759',
      error: '#FF3B30',
      warning: '#FF9500',
      info: '#0066cc'
    };
    return colors[type] || colors.info;
  }
  
  static getIcon(type) {
    const icons = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
  }
  
  // Métodos de conveniencia
  static success(message, duration = 5000) {
    this.show(message, 'success', duration);
  }
  
  static error(message, duration = 5000) {
    this.show(message, 'error', duration);
  }
  
  static warning(message, duration = 5000) {
    this.show(message, 'warning', duration);
  }
  
  static info(message, duration = 5000) {
    this.show(message, 'info', duration);
  }
  
  // Limpiar todas las notificaciones
  static clearAll() {
    const container = document.getElementById('notificationContainer');
    if (container) {
      container.innerHTML = '';
    }
  }
}

// Hacer disponible globalmente
window.UINotifications = UINotifications;
