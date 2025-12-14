import { CONFIG } from './config.js';
import { productosManager } from './productos.js';

// Gestión de la interfaz de usuario
export class UI {
    static currentVehicle = null;
    static currentKit = null;

    // Inicializar eventos
    static init() {
        this.initEventListeners();
        this.initMobileMenu();
        this.initComparisonSlider(); // NUEVO: Inicializar slider de kits
    }
    
    // Inicializar event listeners
    static initEventListeners() {
        // Filtros
        document.querySelectorAll('.filter-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                if (filter) {
                    productosManager.filtrarVehiculos(filter);
                }
            });
        });
        
        // Indicadores de stock
        document.querySelectorAll('.indicator').forEach(indicator => {
            indicator.addEventListener('click', (e) => {
                const filter = e.currentTarget.dataset.filter;
                if (filter) {
                    productosManager.filtrarVehiculos(filter);
                    window.scrollTo({ top: document.getElementById('vehicles').offsetTop - 80, behavior: 'smooth' });
                }
            });
        });
        
        // Botón ver todos los kits (ahora es el CTA principal)
        document.getElementById('showAllKits')?.addEventListener('click', () => {
            window.scrollTo({ top: document.getElementById('vehicles').offsetTop - 80, behavior: 'smooth' });
            this.showNotification("Selecciona un vehículo para personalizarlo.", "info");
        });
        
        // Cerrar modales
        document.getElementById('closeVehicleModal')?.addEventListener('click', () => {
            this.closeModal('vehicleModal');
        });
        
        document.getElementById('closeCustomizationModal')?.addEventListener('click', () => {
            this.closeModal('customizationModal');
        });

        // Botones de acción dentro de los modales
        document.getElementById('contactVehicleDetailBtn')?.addEventListener('click', () => {
            if (UI.currentVehicle) {
                this.contactVehicle(UI.currentVehicle.id);
            }
        });

        document.getElementById('customizeVehicleBtn')?.addEventListener('click', () => {
            if (UI.currentVehicle) {
                this.closeModal('vehicleModal');
                this.showCustomizationModal(UI.currentVehicle);
            }
        });

        document.getElementById('contactKitBtn')?.addEventListener('click', () => {
            if (UI.currentVehicle && UI.currentKit) {
                this.contactVehicle(UI.currentVehicle.id, UI.currentKit);
            } else if (UI.currentVehicle) {
                // Si no hay kit seleccionado, contactar solo por el vehículo
                this.contactVehicle(UI.currentVehicle.id);
            } else {
                this.showNotification("Debes seleccionar un vehículo primero.", "error");
            }
        });
    }

    // Inicializar menú móvil
    static initMobileMenu() {
        const menuToggle = document.getElementById('menuToggle');
        const mobileMenu = document.getElementById('mobileMenu');

        menuToggle?.addEventListener('click', () => {
            mobileMenu?.classList.toggle('active');
            menuToggle.querySelector('i').classList.toggle('fa-bars');
            menuToggle.querySelector('i').classList.toggle('fa-times');
        });

        // Cerrar menú al hacer click en un enlace
        mobileMenu?.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                menuToggle.querySelector('i').classList.remove('fa-times');
                menuToggle.querySelector('i').classList.add('fa-bars');
            });
        });
    }

    // NUEVO: Inicializar la funcionalidad del slider de comparación
    static initComparisonSlider() {
        const slider = document.getElementById('comparisonSlider');
        const container = slider.parentElement;
        const customizedImageContainer = document.getElementById('customizedImageContainer');
        let isDragging = false;

        if (!slider || !container || !customizedImageContainer) return;

        const onMouseMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const rect = container.getBoundingClientRect();
            let x = e.clientX - rect.left;
            
            // Limitar el movimiento entre 0 y 100%
            if (x < 0) x = 0;
            if (x > rect.width) x = rect.width;

            const percent = (x / rect.width) * 100;
            
            // Mover el slider y ajustar el clip-path de la imagen personalizada
            slider.style.left = `${percent}%`;
            customizedImageContainer.style.clipPath = `inset(0 0 0 ${percent}%)`;
        };

        const onMouseUp = () => {
            isDragging = false;
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        const onMouseDown = (e) => {
            isDragging = true;
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        };

        // Eventos para Desktop
        slider.addEventListener('mousedown', onMouseDown);

        // Eventos para Mobile
        const onTouchMove = (e) => {
            if (!e.touches[0] || !isDragging) return;
            const rect = container.getBoundingClientRect();
            let x = e.touches[0].clientX - rect.left;

            if (x < 0) x = 0;
            if (x > rect.width) x = rect.width;

            const percent = (x / rect.width) * 100;

            slider.style.left = `${percent}%`;
            customizedImageContainer.style.clipPath = `inset(0 0 0 ${percent}%)`;
        };
        
        const onTouchEnd = () => {
            isDragging = false;
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
        };

        const onTouchStart = (e) => {
            if (e.touches.length === 1) {
                isDragging = true;
                window.addEventListener('touchmove', onTouchMove);
                window.addEventListener('touchend', onTouchEnd);
            }
        };

        slider.addEventListener('touchstart', onTouchStart);
    }
    
    // Mostrar loading
    static showLoading() {
        document.getElementById('loadingOverlay')?.classList.add('active');
    }

    // Ocultar loading
    static hideLoading() {
        document.getElementById('loadingOverlay')?.classList.remove('active');
    }

    // Mostrar modal
    static showModal(id) {
        document.getElementById(id)?.classList.add('active');
    }

    // Cerrar modal
    static closeModal(id) {
        document.getElementById(id)?.classList.remove('active');
        
        // Resetear variables de estado al cerrar modales grandes
        if (id === 'vehicleModal' || id === 'customizationModal') {
            UI.currentVehicle = null;
            UI.currentKit = null;
        }
    }

    // Renderizar vehículos en la grilla
    static renderVehiculos(vehiculos) {
        const grid = document.getElementById('vehiclesGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        if (vehiculos.length === 0) {
            document.getElementById('noVehiclesMessage')?.classList.remove('hidden');
            return;
        }
        document.getElementById('noVehiclesMessage')?.classList.add('hidden');

        vehiculos.forEach(vehiculo => {
            const statusClass = `status-${vehiculo.estado}`;
            const statusText = vehiculo.estado === 'stock' ? 'Stock Arica' : 
                               vehiculo.estado === 'transit' ? 'En Tránsito' : 
                               'Para Reservar';
            const priceHtml = vehiculo.precio > 0 && CONFIG.app.mostrarPrecios 
                ? productosManager.formatPrice(vehiculo.precio) + ` ${CONFIG.app.moneda}`
                : 'Consultar Precio';

            const card = document.createElement('div');
            card.classList.add('vehicle-card');
            card.setAttribute('data-id', vehiculo.id);

            card.innerHTML = `
                <img src="${vehiculo.imagen_url}" alt="${vehiculo.nombre}" class="vehicle-image"
                     onerror="this.src='${CONFIG.app.defaultImage}'">
                <div class="vehicle-info">
                    <span class="vehicle-status ${statusClass}">${statusText}</span>
                    <h3 class="vehicle-name">${vehiculo.nombre}</h3>
                    <p class="vehicle-description">${vehiculo.descripcion_corta || 'Vehículo premium importado desde EE.UU.'}</p>
                    <span class="vehicle-price">${priceHtml}</span>
                    <div class="vehicle-actions">
                        <button class="btn-primary btn-view-details" data-id="${vehiculo.id}">Ver Detalles</button>
                    </div>
                </div>
            `;
            
            grid.appendChild(card);
        });

        // Asignar evento al botón "Ver Detalles"
        document.querySelectorAll('.btn-view-details').forEach(button => {
            button.addEventListener('click', (e) => {
                const vehicleId = e.target.dataset.id;
                const vehiculo = productosManager.getVehiculoById(vehicleId);
                if (vehiculo) {
                    this.showVehicleDetailModal(vehiculo);
                } else {
                    this.showNotification("Vehículo no encontrado", "error");
                }
            });
        });
    }

    // Mostrar modal de detalle de vehículo
    static showVehicleDetailModal(vehiculo) {
        UI.currentVehicle = vehiculo;
        document.getElementById('vehicleDetailName').textContent = vehiculo.nombre;
        document.getElementById('vehicleDetailImage').src = vehiculo.imagen_url;
        document.getElementById('vehicleDetailImage').onerror = function() { this.src = CONFIG.app.defaultImage; };
        
        const statusElement = document.getElementById('vehicleDetailStatus');
        const statusText = vehiculo.estado === 'stock' ? 'Stock Arica' : 
                           vehiculo.estado === 'transit' ? 'En Tránsito' : 
                           'Para Reservar';
        statusElement.textContent = statusText;
        statusElement.className = `vehicle-status status-${vehiculo.estado}`;

        const priceHtml = vehiculo.precio > 0 && CONFIG.app.mostrarPrecios 
            ? productosManager.formatPrice(vehiculo.precio) + ` ${CONFIG.app.moneda}`
            : 'Consultar Precio';
        document.getElementById('vehicleDetailPrice').textContent = priceHtml;
        document.getElementById('vehicleDetailDescription').textContent = vehiculo.descripcion_larga || vehiculo.descripcion_corta || 'Sin descripción disponible.';

        // Características (features)
        const featuresContainer = document.getElementById('vehicleDetailFeatures');
        featuresContainer.innerHTML = '';
        const features = [
            { icon: 'fas fa-calendar-alt', text: vehiculo.anio || 'N/A' },
            { icon: 'fas fa-tachometer-alt', text: vehiculo.kilometraje ? `${vehiculo.kilometraje} Km` : 'N/A' },
            { icon: 'fas fa-gas-pump', text: vehiculo.motor || 'N/A' },
            { icon: 'fas fa-cogs', text: vehiculo.transmision || 'N/A' },
        ];

        features.forEach(feat => {
            const div = document.createElement('div');
            div.innerHTML = `<i class="${feat.icon}"></i> <span>${feat.text}</span>`;
            featuresContainer.appendChild(div);
        });
        
        // Mostrar modal
        this.showModal('vehicleModal');
    }

    // NUEVO: Mostrar modal de personalización de Kits
    static showCustomizationModal(vehiculo) {
        UI.currentVehicle = vehiculo;
        const kits = productosManager.kits;

        document.getElementById('kitVehicleName').textContent = vehiculo.nombre;
        const kitOptionsContainer = document.getElementById('kitOptionsContainer');
        kitOptionsContainer.innerHTML = '';
        
        // Inicializar la vista con el kit Standard (por defecto)
        const standardKit = kits.find(k => k.nivel === 'standar');
        if (standardKit) {
            this.selectKit(standardKit);
        } else if (kits.length > 0) {
            this.selectKit(kits[0]); // Seleccionar el primer kit si no hay standard
        }


        // Renderizar opciones de kits
        kits.forEach(kit => {
            const kitDiv = document.createElement('div');
            kitDiv.classList.add('kit-option');
            kitDiv.setAttribute('data-kit-id', kit.id);
            if (kit.id === UI.currentKit?.id) {
                kitDiv.classList.add('selected');
            }

            const priceText = kit.precio > 0 ? `+${productosManager.formatPrice(kit.precio)} ${CONFIG.app.moneda}` : 'Incluido';
            const priceClass = kit.precio > 0 ? '' : 'standard';

            kitDiv.innerHTML = `
                <div class="kit-header">
                    <span class="kit-name">${kit.nombre}</span>
                    <span class="kit-price ${priceClass}">${priceText}</span>
                </div>
                <p class="kit-description">${kit.descripcion}</p>
            `;

            kitDiv.addEventListener('click', () => this.selectKit(kit));
            kitOptionsContainer.appendChild(kitDiv);
        });
        
        // Mostrar modal
        this.showModal('customizationModal');
        
        // Resetear el slider a la mitad (50%)
        document.getElementById('comparisonSlider').style.left = '50%';
        document.getElementById('customizedImageContainer').style.clipPath = 'inset(0 0 0 50%)';

        // Asegurar que la imagen original se carga primero
        const originalImage = document.getElementById('originalImage');
        originalImage.src = vehiculo.imagen_url;
        originalImage.onerror = function() { this.src = CONFIG.app.defaultImage; };
    }

    // NUEVO: Lógica de selección de un kit
    static selectKit(kit) {
        if (!UI.currentVehicle) return;

        UI.currentKit = kit;
        
        // 1. Marcar el kit seleccionado visualmente
        document.querySelectorAll('.kit-option').forEach(opt => opt.classList.remove('selected'));
        document.querySelector(`.kit-option[data-kit-id="${kit.id}"]`)?.classList.add('selected');

        // 2. Calcular y mostrar precio total
        const basePrice = UI.currentVehicle.precio || 0;
        const total = basePrice + kit.precio;
        const totalPriceElement = document.getElementById('kitTotalPrice');
        totalPriceElement.textContent = `${CONFIG.app.moneda} ${productosManager.formatPrice(total)}`;
        
        // 3. Cargar la imagen personalizada (solo para el lado del kit)
        this.loadCustomizedImage(UI.currentVehicle.imagen_url, kit.id);
    }

    // NUEVO: Carga y muestra la imagen del kit
    static loadCustomizedImage(originalImageUrl, kitId) {
        const customizedImageElement = document.getElementById('customizedImage');
        const imageUrl = productosManager.generateCustomKitImageUrl(originalImageUrl, kitId);

        // Ocultar la imagen antes de cargar
        customizedImageElement.style.opacity = '0';
        
        try {
            // Precargar la imagen
            const img = new Image();
            img.onload = () => {
                customizedImageElement.src = imageUrl;
                customizedImageElement.style.opacity = '1';
            };
            img.onerror = () => {
                console.warn(`⚠️ Error al cargar imagen personalizada: ${imageUrl}. Usando la original.`);
                customizedImageElement.src = originalImageUrl; // Fallback a la original
                customizedImageElement.style.opacity = '1';
            };
            img.src = imageUrl;
            
        } catch (error) {
            console.error('❌ Error al cargar imagen de kit:', error);
            customizedImageElement.src = originalImageUrl;
            customizedImageElement.style.opacity = '1';
        }
    }

    // Contactar vehículo
    static contactVehicle(vehicleId, kit = null) {
        const vehiculo = productosManager.getVehiculoById(vehicleId);
        if (!vehiculo) {
            this.showNotification("Vehículo no encontrado", "error");
            return;
        }
        
        const whatsappUrl = productosManager.getWhatsAppUrl(vehiculo, kit);
        window.open(whatsappUrl, '_blank');
    }
    
    // Mostrar mensaje general
    static showMessage(message) {
        console.log(message);
    }
    
    // Mostrar error
    static showError(message) {
        this.showNotification(message, 'error');
        console.error('Error:', message);
    }

    // Mostrar notificación temporal
    static showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        const notification = document.createElement('div');
        notification.classList.add('notification', type);
        notification.textContent = message;
        
        container.appendChild(notification);
        
        // Mostrar con un pequeño retraso para la animación CSS
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Ocultar y eliminar después de 5 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            notification.addEventListener('transitionend', () => {
                notification.remove();
            });
        }, 5000);
    }
}
