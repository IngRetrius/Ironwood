// Carousel Functionality

document.addEventListener('DOMContentLoaded', function() {
    const track = document.getElementById('carouselTrack');
    const slides = document.querySelectorAll('.carousel__slide');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    
    let currentSlide = 0;
    const totalSlides = slides.length;
    
    function updateSlides() {
        slides.forEach((slide, index) => {
            slide.classList.remove('carousel__slide--active');
            if (index === currentSlide) {
                slide.classList.add('carousel__slide--active');
            }
        });
        
        const offset = -currentSlide * 100;
        track.style.transform = `translateX(${offset}%)`;
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateSlides();
    }
    
    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateSlides();
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }
    
    // Auto-play (opcional)
    setInterval(nextSlide, 5000);
});
