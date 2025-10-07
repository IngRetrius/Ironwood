/**
 * Hero Carousel Script
 * Handles the hero section carousel functionality
 */

(function() {
    'use strict';
    
    // ==========================================
    // CAROUSEL INITIALIZATION
    // ==========================================
    
    const carouselTrack = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    
    if (!carouselTrack || !prevBtn || !nextBtn) {
        console.warn('Carousel elements not found');
        return;
    }
    
    const slides = Array.from(carouselTrack.querySelectorAll('.carousel__slide'));
    const totalSlides = slides.length;
    
    let currentIndex = 0;
    let isTransitioning = false;
    
    // ==========================================
    // HELPER FUNCTIONS
    // ==========================================
    
    /**
     * Update carousel position
     */
    function updateCarousel() {
        const offset = -currentIndex * 100;
        carouselTrack.style.transform = `translateX(${offset}%)`;
        
        // Update button states
        updateButtonStates();
        
        // Update active slide
        updateActiveSlide();
    }
    
    /**
     * Update button disabled states
     */
    function updateButtonStates() {
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex === totalSlides - 1;
    }
    
    /**
     * Update active slide class
     */
    function updateActiveSlide() {
        slides.forEach((slide, index) => {
            if (index === currentIndex) {
                slide.classList.add('carousel__slide--active');
            } else {
                slide.classList.remove('carousel__slide--active');
            }
        });
    }
    
    /**
     * Go to next slide
     */
    function nextSlide() {
        if (isTransitioning || currentIndex >= totalSlides - 1) return;
        
        isTransitioning = true;
        currentIndex++;
        updateCarousel();
        
        setTimeout(() => {
            isTransitioning = false;
        }, 500);
    }
    
    /**
     * Go to previous slide
     */
    function prevSlide() {
        if (isTransitioning || currentIndex <= 0) return;
        
        isTransitioning = true;
        currentIndex--;
        updateCarousel();
        
        setTimeout(() => {
            isTransitioning = false;
        }, 500);
    }
    
    /**
     * Go to specific slide
     */
    function goToSlide(index) {
        if (isTransitioning || index < 0 || index >= totalSlides || index === currentIndex) {
            return;
        }
        
        isTransitioning = true;
        currentIndex = index;
        updateCarousel();
        
        setTimeout(() => {
            isTransitioning = false;
        }, 500);
    }
    
    // ==========================================
    // EVENT LISTENERS
    // ==========================================
    
    // Button clicks
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            prevSlide();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
        }
    });
    
    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    carouselTrack.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    carouselTrack.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swiped left - go to next
                nextSlide();
            } else {
                // Swiped right - go to previous
                prevSlide();
            }
        }
    }
    
    // ==========================================
    // AUTO-PLAY (OPTIONAL)
    // ==========================================
    
    let autoplayInterval;
    const autoplayDelay = 5000; // 5 seconds
    
    function startAutoplay() {
        autoplayInterval = setInterval(() => {
            if (currentIndex < totalSlides - 1) {
                nextSlide();
            } else {
                goToSlide(0);
            }
        }, autoplayDelay);
    }
    
    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }
    
    // Pause autoplay on hover
    carouselTrack.addEventListener('mouseenter', stopAutoplay);
    carouselTrack.addEventListener('mouseleave', startAutoplay);
    
    // Pause autoplay on interaction
    prevBtn.addEventListener('click', stopAutoplay);
    nextBtn.addEventListener('click', stopAutoplay);
    
    // ==========================================
    // INITIALIZATION
    // ==========================================
    
    // Set initial state
    updateCarousel();
    
    // Start autoplay (comment out if not wanted)
    // startAutoplay();
    
    // Expose public API (optional)
    window.heroCarousel = {
        next: nextSlide,
        prev: prevSlide,
        goTo: goToSlide,
        getCurrentIndex: () => currentIndex,
        getTotalSlides: () => totalSlides
    };
    
})();