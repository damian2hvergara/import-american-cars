// UI NOTIFICATIONS - Sistema de notificaciones
export class UINotifications {
  static show(message, type = 'info') {
    const container = this.getContainer();
    const notification = this.createNotification(message, type);
    
    container.appendChild(notification);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }
  
  static createNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
      background: ${this.getColor(type)};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      margin-bottom: 10px;
      animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <i class="fas ${this.getIcon(type)}"></i>
        <span>${message}</span>
      </div>
    `;
    
    return notification;
  }
  
  static getContainer() {
    let container = document.getElementById('notificationContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'notificationContainer';
      container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999;';
      document.body.appendChild(container);
    }
    return container;
  }
  
  static getColor(type) {
    const colors = {
      success: '#34C759',
      error: '#FF3B30',
      warning: '#FF9500',
      info: '#007AFF'
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
}
