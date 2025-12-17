// UI SLIDER - Manejo de sliders de imágenes
export class UISlider {
  static sliders = new Map();
  
  static init(sliderId, images, vehicleName = '') {
    const slider = document.getElementById(sliderId);
    if (!slider) return;
    
    const wrapper = slider.querySelector('.slider-wrapper');
    const prevBtn = slider.querySelector('.slider-button-prev');
    const nextBtn = slider.querySelector('.slider-button-next');
    
    if (!wrapper) return;
    
    let currentSlide = 0;
    const totalSlides = images.length;
    
    // Crear slides si no existen
    if (wrapper.children.length === 0) {
      wrapper.innerHTML = images.map((url, index) => `
        <div class="slider-slide" data-index="${index}">
          <img src="${url}" 
               alt="Imagen ${index + 1} de ${vehicleName}" 
               onerror="this.src='https://images.unsplash.com/photo-1549399542-7e3f8b79c341?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'">
        </div>
      `).join('');
    }
    
    // Crear puntos de navegación si no existen
    if (totalSlides > 1 && !slider.querySelector('.slider-dots')) {
      const dotsContainer = this.createDots(slider, totalSlides);
      this.setupDotsEvents(dotsContainer, sliderId);
    }
    
    // Configurar navegación
    const updateSlider = () => {
      wrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
      this.updateDots(sliderId, currentSlide);
      this.updateNavButtons(prevBtn, nextBtn, currentSlide, totalSlides);
    };
    
    // Asignar eventos
    if (prevBtn) {
      prevBtn.onclick = () => {
        if (currentSlide > 0) {
          currentSlide--;
          updateSlider();
        }
      };
    }
    
    if (nextBtn) {
      nextBtn.onclick = () => {
        if (currentSlide < totalSlides - 1) {
          currentSlide++;
          updateSlider();
        }
      };
    }
    
    // Guardar referencia
    this.sliders.set(sliderId, { 
      currentSlide, 
      totalSlides, 
      updateSlider,
      goToSlide: (index) => {
        if (index >= 0 && index < totalSlides) {
          currentSlide = index;
          updateSlider();
        }
      }
    });
    
    updateSlider();
  }
  
  static createDots(slider, total) {
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'slider-dots';
    dotsContainer.innerHTML = Array.from({length: total}, (_, i) => 
      `<button class="slider-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></button>`
    ).join('');
    slider.appendChild(dotsContainer);
    return dotsContainer;
  }
  
  static setupDotsEvents(dotsContainer, sliderId) {
    dotsContainer.querySelectorAll('.slider-dot').forEach(dot => {
      dot.onclick = () => {
        const index = parseInt(dot.dataset.index);
        this.goToSlide(sliderId, index);
      };
    });
  }
  
  static goToSlide(sliderId, index) {
    const sliderData = this.sliders.get(sliderId);
    if (!sliderData || index < 0 || index >= sliderData.totalSlides) return;
    
    sliderData.goToSlide(index);
  }
  
  static updateDots(sliderId, currentSlide) {
    const slider = document.getElementById(sliderId);
    if (!slider) return;
    
    const dots = slider.querySelectorAll('.slider-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentSlide);
    });
  }
  
  static updateNavButtons(prevBtn, nextBtn, currentSlide, totalSlides) {
    if (prevBtn) {
      prevBtn.disabled = currentSlide === 0;
      prevBtn.style.opacity = currentSlide === 0 ? '0.3' : '1';
      prevBtn.style.cursor = currentSlide === 0 ? 'default' : 'pointer';
    }
    if (nextBtn) {
      nextBtn.disabled = currentSlide === totalSlides - 1;
      nextBtn.style.opacity = currentSlide === totalSlides - 1 ? '0.3' : '1';
      nextBtn.style.cursor = currentSlide === totalSlides - 1 ? 'default' : 'pointer';
    }
  }
  
  // Destruir slider
  static destroy(sliderId) {
    this.sliders.delete(sliderId);
  }
}

// Hacer disponible globalmente
window.UISlider = UISlider;
