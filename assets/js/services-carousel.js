/**
 * ========================================
 * SERVICES CAROUSEL - WITH PROGRESS BAR
 * ========================================
 * 
 * Features:
 * - Shows 3 cards on desktop, 2 on tablet, 1 on mobile
 * - Progress bar showing carousel position
 * - Pagination text (1-3 of 10)
 * - Bottom navigation buttons
 * - Touch/swipe support
 * - Keyboard navigation
 * 
 * @version 2.0.0
 */

(function() {
    'use strict';
    
    // ==========================================
    // CONFIGURATION
    // ==========================================
    
    const CONFIG = {
        transitionDuration: 600,
        swipeThreshold: 50,
        resizeDebounce: 250,
        gap: 32,
        breakpoints: {
            mobile: 768,
            tablet: 1024
        }
    };
    
    // ==========================================
    // DOM ELEMENTS
    // ==========================================
    
    const carousel = document.querySelector('.services-carousel');
    const carouselTrack = document.getElementById('servicesCarouselTrack');
    const carouselContainer = document.querySelector('.services-carousel__container');
    
    if (!carousel || !carouselTrack || !carouselContainer) {
        console.warn('Services carousel: Required elements not found');
        return;
    }
    
    // ==========================================
    // CREATE CONTROLS
    // ==========================================
    
    const controlsHTML = `
        <div class="services-carousel__controls">
            <button class="services-carousel__nav services-carousel__nav--prev" id="servicesCarouselPrev" aria-label="Previous services">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </button>
            
            <div class="services-carousel__progress">
                <div class="services-carousel__progress-bar" id="servicesProgressBar"></div>
            </div>
            
            <span class="services-carousel__pagination" id="servicesPagination">1 - 3 of 10</span>
            
            <button class="services-carousel__nav services-carousel__nav--next" id="servicesCarouselNext" aria-label="Next services">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </button>
        </div>
    `;
    
    carousel.insertAdjacentHTML('beforeend', controlsHTML);
    
    // Get created elements
    const prevBtn = document.getElementById('servicesCarouselPrev');
    const nextBtn = document.getElementById('servicesCarouselNext');
    const progressBar = document.getElementById('servicesProgressBar');
    const pagination = document.getElementById('servicesPagination');
    
    // ==========================================
    // STATE VARIABLES
    // ==========================================
    
    const cards = Array.from(carouselTrack.querySelectorAll('.service-card'));
    const totalCards = cards.length;
    
    let currentIndex = 0;
    let isTransitioning = false;
    let cardsToShow = 3;
    let cardWidth = 0;
    let touchStartX = 0;
    let touchEndX = 0;
    let resizeTimeout = null;
    
    // ==========================================
    // RESPONSIVE CONFIGURATION
    // ==========================================
    
    function updateCardsToShow() {
        const windowWidth = window.innerWidth;
        
        if (windowWidth <= CONFIG.breakpoints.mobile) {
            cardsToShow = 1;
        } else if (windowWidth <= CONFIG.breakpoints.tablet) {
            cardsToShow = 2;
        } else {
            cardsToShow = 3;
        }
        
        calculateCardWidth();
        updateCarousel();
        updateProgress();
    }
    
    function calculateCardWidth() {
        if (!carouselContainer) return;
        
        const containerWidth = carouselContainer.offsetWidth;
        const totalGap = CONFIG.gap * (cardsToShow - 1);
        cardWidth = (containerWidth - totalGap) / cardsToShow;
        
        cards.forEach(card => {
            card.style.minWidth = `${cardWidth}px`;
        });
    }
    
    // ==========================================
    // CAROUSEL LOGIC
    // ==========================================
    
    function getMaxIndex() {
        return Math.max(0, totalCards - cardsToShow);
    }
    
    function clampIndex(index) {
        const maxIndex = getMaxIndex();
        return Math.max(0, Math.min(index, maxIndex));
    }
    
    function updateCarousel(animated = true) {
        currentIndex = clampIndex(currentIndex);
        
        const offset = -(currentIndex * (cardWidth + CONFIG.gap));
        
        if (animated) {
            carouselTrack.style.transition = `transform ${CONFIG.transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        } else {
            carouselTrack.style.transition = 'none';
        }
        
        carouselTrack.style.transform = `translateX(${offset}px)`;
        
        updateButtonStates();
        updateProgress();
        updatePagination();
    }
    
    function updateButtonStates() {
        const maxIndex = getMaxIndex();
        
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= maxIndex;
    }
    
    function updateProgress() {
        const maxIndex = getMaxIndex();
        const progress = maxIndex > 0 ? (currentIndex / maxIndex) * 100 : 100;
        
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }
    
    function updatePagination() {
        if (!pagination) return;
        
        const startCard = currentIndex + 1;
        const endCard = Math.min(currentIndex + cardsToShow, totalCards);
        
        pagination.textContent = `${startCard} - ${endCard} of ${totalCards}`;
    }
    
    // ==========================================
    // NAVIGATION FUNCTIONS
    // ==========================================
    
    function nextSlide() {
        const maxIndex = getMaxIndex();
        
        if (isTransitioning || currentIndex >= maxIndex) return;
        
        isTransitioning = true;
        currentIndex++;
        updateCarousel();
        
        setTimeout(() => {
            isTransitioning = false;
        }, CONFIG.transitionDuration);
    }
    
    function prevSlide() {
        if (isTransitioning || currentIndex <= 0) return;
        
        isTransitioning = true;
        currentIndex--;
        updateCarousel();
        
        setTimeout(() => {
            isTransitioning = false;
        }, CONFIG.transitionDuration);
    }
    
    function goToIndex(index) {
        const clampedIndex = clampIndex(index);
        
        if (isTransitioning || clampedIndex === currentIndex) return;
        
        isTransitioning = true;
        currentIndex = clampedIndex;
        updateCarousel();
        
        setTimeout(() => {
            isTransitioning = false;
        }, CONFIG.transitionDuration);
    }
    
    // ==========================================
    // EVENT HANDLERS
    // ==========================================
    
    function handlePrevClick(e) {
        e.preventDefault();
        prevSlide();
    }
    
    function handleNextClick(e) {
        e.preventDefault();
        nextSlide();
    }
    
    function handleResize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const previousCardsToShow = cardsToShow;
            updateCardsToShow();
            
            if (previousCardsToShow !== cardsToShow) {
                currentIndex = 0;
                updateCarousel(false);
            }
        }, CONFIG.resizeDebounce);
    }
    
    function handleTouchStart(e) {
        touchStartX = e.changedTouches[0].screenX;
        touchEndX = touchStartX;
    }
    
    function handleTouchMove(e) {
        touchEndX = e.changedTouches[0].screenX;
    }
    
    function handleTouchEnd() {
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > CONFIG.swipeThreshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
        
        touchStartX = 0;
        touchEndX = 0;
    }
    
    function handleKeydown(e) {
        const carouselSection = document.querySelector('.services-section');
        if (!carouselSection) return;
        
        const rect = carouselSection.getBoundingClientRect();
        const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (!isInViewport) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                prevSlide();
                break;
            case 'ArrowRight':
                e.preventDefault();
                nextSlide();
                break;
            case 'Home':
                e.preventDefault();
                goToIndex(0);
                break;
            case 'End':
                e.preventDefault();
                goToIndex(getMaxIndex());
                break;
        }
    }
    
    // ==========================================
    // EVENT LISTENERS
    // ==========================================
    
    function attachEventListeners() {
        prevBtn.addEventListener('click', handlePrevClick);
        nextBtn.addEventListener('click', handleNextClick);
        window.addEventListener('resize', handleResize);
        carouselTrack.addEventListener('touchstart', handleTouchStart, { passive: true });
        carouselTrack.addEventListener('touchmove', handleTouchMove, { passive: true });
        carouselTrack.addEventListener('touchend', handleTouchEnd, { passive: true });
        document.addEventListener('keydown', handleKeydown);
    }
    
    function removeEventListeners() {
        prevBtn.removeEventListener('click', handlePrevClick);
        nextBtn.removeEventListener('click', handleNextClick);
        window.removeEventListener('resize', handleResize);
        carouselTrack.removeEventListener('touchstart', handleTouchStart);
        carouselTrack.removeEventListener('touchmove', handleTouchMove);
        carouselTrack.removeEventListener('touchend', handleTouchEnd);
        document.removeEventListener('keydown', handleKeydown);
    }
    
    // ==========================================
    // INITIALIZATION
    // ==========================================
    
    function init() {
        console.log('Services Carousel: Initializing...');
        
        updateCardsToShow();
        attachEventListeners();
        
        setTimeout(() => {
            updateCarousel(false);
            console.log('Services Carousel: Initialized successfully');
        }, 100);
    }
    
    function destroy() {
        removeEventListeners();
        carouselTrack.style.transform = '';
        carouselTrack.style.transition = '';
        cards.forEach(card => {
            card.style.minWidth = '';
        });
        console.log('Services Carousel: Destroyed');
    }
    
    // ==========================================
    // PUBLIC API
    // ==========================================
    
    window.servicesCarousel = {
        next: nextSlide,
        prev: prevSlide,
        goTo: goToIndex,
        getCurrentIndex: () => currentIndex,
        getTotalCards: () => totalCards,
        getCardsToShow: () => cardsToShow,
        getMaxIndex: getMaxIndex,
        refresh: () => updateCardsToShow(),
        destroy: destroy,
        config: CONFIG
    };
    
    // ==========================================
    // AUTO-INITIALIZE
    // ==========================================
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    window.addEventListener('beforeunload', destroy);
    
})();