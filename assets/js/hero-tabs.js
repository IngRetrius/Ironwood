/**
 * ========================================
 * HERO TABS - SMOOTH ANIMATIONS
 * ========================================
 * 
 * Features:
 * - Smooth transitions between tabs
 * - Gentle fade in/out for title
 * - Smooth background image crossfade
 * - Auto-rotation every 6 seconds (slower)
 * - Enhanced easing curves
 * 
 * @version 4.0.0
 */

(function() {
    'use strict';
    
    // ==========================================
    // CONFIGURATION
    // ==========================================
    
    const CONFIG = {
        autoRotateInterval: 6000, // 6 seconds (más lento)
        titleTransitionDuration: 500, // 0.5s para título
        imageTransitionDuration: 1200 // 1.2s para imagen
    };
    
    // Tab names in order
    const TAB_NAMES = [
        'grade-crossing',
        'project-support',
        'training'
    ];
    
    // ==========================================
    // DOM ELEMENTS
    // ==========================================
    
    const heroSection = document.getElementById('heroSection');
    const heroTitle = document.getElementById('heroTitle');
    const tabButtons = document.querySelectorAll('.hero__tab');
    const tabPanes = document.querySelectorAll('.hero__tab-pane');
    const backgroundImages = document.querySelectorAll('.hero__image');
    const pauseButton = document.getElementById('heroPause');
    
    if (!heroSection || !heroTitle || tabButtons.length === 0) {
        console.warn('Hero tabs: Required elements not found');
        return;
    }
    
    // ==========================================
    // STATE VARIABLES
    // ==========================================
    
    let currentTab = 0;
    let autoRotateTimer = null;
    let isPaused = false;
    let isTransitioning = false;
    const totalTabs = tabButtons.length;
    
    // ==========================================
    // TAB SWITCHING LOGIC
    // ==========================================
    
    /**
     * Switch to a specific tab with smooth animation
     * @param {number} index - Tab index to switch to
     */
    function switchTab(index) {
        if (index === currentTab || isTransitioning) return;
        
        isTransitioning = true;
        
        // Update current tab
        currentTab = index;
        
        // Update tab buttons
        tabButtons.forEach((btn, i) => {
            if (i === index) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Update tab panes
        tabPanes.forEach((pane, i) => {
            if (i === index) {
                pane.classList.add('active');
            } else {
                pane.classList.remove('active');
            }
        });
        
        // Update title with smooth fade
        updateHeroTitle(index);
        
        // Update background images
        updateBackgroundImage(index);
        
        // Reset transition flag after animation completes
        setTimeout(() => {
            isTransitioning = false;
        }, CONFIG.imageTransitionDuration);
    }
    
    /**
     * Update hero title with smooth fade animation
     * @param {number} index - Tab index
     */
    function updateHeroTitle(index) {
        const activeButton = tabButtons[index];
        const newTitle = activeButton.dataset.title;
        
        if (newTitle && heroTitle) {
            // Gentle fade out
            heroTitle.style.opacity = '0';
            heroTitle.style.transform = 'translateY(-8px)';
            
            setTimeout(() => {
                heroTitle.textContent = newTitle;
                // Gentle fade in
                requestAnimationFrame(() => {
                    heroTitle.style.opacity = '1';
                    heroTitle.style.transform = 'translateY(0)';
                });
            }, CONFIG.titleTransitionDuration / 2);
        }
    }
    
    /**
     * Update background image with smooth crossfade
     * @param {number} index - Tab index
     */
    function updateBackgroundImage(index) {
        const tabName = TAB_NAMES[index];
        
        backgroundImages.forEach(img => {
            if (img.dataset.tab === tabName) {
                img.style.opacity = '1';
            } else {
                img.style.opacity = '0';
            }
        });
    }
    
    /**
     * Go to next tab
     */
    function nextTab() {
        if (isTransitioning) return;
        const nextIndex = (currentTab + 1) % totalTabs;
        switchTab(nextIndex);
    }
    
    /**
     * Go to previous tab
     */
    function prevTab() {
        if (isTransitioning) return;
        const prevIndex = (currentTab - 1 + totalTabs) % totalTabs;
        switchTab(prevIndex);
    }
    
    // ==========================================
    // AUTO-ROTATION
    // ==========================================
    
    /**
     * Start auto-rotation
     */
    function startAutoRotate() {
        if (autoRotateTimer) return;
        
        autoRotateTimer = setInterval(() => {
            if (!isPaused && !isTransitioning) {
                nextTab();
            }
        }, CONFIG.autoRotateInterval);
    }
    
    /**
     * Stop auto-rotation
     */
    function stopAutoRotate() {
        if (autoRotateTimer) {
            clearInterval(autoRotateTimer);
            autoRotateTimer = null;
        }
    }
    
    /**
     * Reset auto-rotation timer
     */
    function resetAutoRotate() {
        stopAutoRotate();
        if (!isPaused) {
            startAutoRotate();
        }
    }
    
    // ==========================================
    // PAUSE/RESUME
    // ==========================================
    
    /**
     * Toggle pause state
     */
    function togglePause() {
        isPaused = !isPaused;
        
        if (isPaused) {
            pauseButton.classList.add('paused');
            pauseButton.setAttribute('aria-label', 'Resume slideshow');
            pauseButton.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="8 5 19 12 8 19"/>
                </svg>
            `;
            stopAutoRotate();
        } else {
            pauseButton.classList.remove('paused');
            pauseButton.setAttribute('aria-label', 'Pause slideshow');
            pauseButton.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1"/>
                    <rect x="14" y="4" width="4" height="16" rx="1"/>
                </svg>
            `;
            startAutoRotate();
        }
    }
    
    // ==========================================
    // EVENT HANDLERS
    // ==========================================
    
    /**
     * Handle tab button click
     */
    function handleTabClick(e) {
        if (isTransitioning) return;
        
        const button = e.currentTarget;
        const tabName = button.dataset.tab;
        const tabIndex = TAB_NAMES.indexOf(tabName);
        
        if (tabIndex !== -1) {
            switchTab(tabIndex);
            resetAutoRotate();
        }
    }
    
    /**
     * Handle keyboard navigation
     */
    function handleKeyboard(e) {
        if (isTransitioning) return;
        
        const heroRect = heroSection.getBoundingClientRect();
        const isInViewport = heroRect.top < window.innerHeight && heroRect.bottom > 0;
        
        if (!isInViewport) return;
        
        switch(e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                prevTab();
                resetAutoRotate();
                break;
            case 'ArrowRight':
            case 'ArrowDown':
                e.preventDefault();
                nextTab();
                resetAutoRotate();
                break;
            case ' ':
            case 'Escape':
                e.preventDefault();
                togglePause();
                break;
        }
    }
    
    /**
     * Handle mouse enter (pause auto-rotate)
     */
    function handleMouseEnter() {
        if (!isPaused) {
            stopAutoRotate();
        }
    }
    
    /**
     * Handle mouse leave (resume auto-rotate)
     */
    function handleMouseLeave() {
        if (!isPaused) {
            startAutoRotate();
        }
    }
    
    // ==========================================
    // EVENT LISTENERS
    // ==========================================
    
    function attachEventListeners() {
        // Tab button clicks
        tabButtons.forEach(button => {
            button.addEventListener('click', handleTabClick);
        });
        
        // Pause button
        if (pauseButton) {
            pauseButton.addEventListener('click', togglePause);
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', handleKeyboard);
        
        // Mouse hover pause
        heroSection.addEventListener('mouseenter', handleMouseEnter);
        heroSection.addEventListener('mouseleave', handleMouseLeave);
    }
    
    function removeEventListeners() {
        tabButtons.forEach(button => {
            button.removeEventListener('click', handleTabClick);
        });
        
        if (pauseButton) {
            pauseButton.removeEventListener('click', togglePause);
        }
        
        document.removeEventListener('keydown', handleKeyboard);
        heroSection.removeEventListener('mouseenter', handleMouseEnter);
        heroSection.removeEventListener('mouseleave', handleMouseLeave);
    }
    
    // ==========================================
    // INITIALIZATION
    // ==========================================
    
    function init() {
        console.log('Hero Tabs: Initializing with smooth animations...');
        
        // Set initial tab
        switchTab(0);
        
        // Attach event listeners
        attachEventListeners();
        
        // Start auto-rotation
        startAutoRotate();
        
        console.log('Hero Tabs: Initialized successfully');
    }
    
    function destroy() {
        stopAutoRotate();
        removeEventListeners();
        console.log('Hero Tabs: Destroyed');
    }
    
    // ==========================================
    // PUBLIC API
    // ==========================================
    
    window.heroTabs = {
        next: nextTab,
        prev: prevTab,
        goTo: switchTab,
        pause: () => {
            if (!isPaused) togglePause();
        },
        resume: () => {
            if (isPaused) togglePause();
        },
        getCurrentTab: () => currentTab,
        getTotalTabs: () => totalTabs,
        destroy: destroy
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