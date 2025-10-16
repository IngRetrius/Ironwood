/**
 * ========================================
 * BACK TO TOP BUTTON - IRONWOOD
 * ========================================
 * 
 * Features:
 * - Smooth scroll to top
 * - Progress circle indicator
 * - Auto show/hide on scroll
 * - Keyboard accessible
 * - Mobile optimized
 * 
 * @version 1.0.0
 */

(function() {
    'use strict';
    
    // ==========================================
    // CONFIGURATION
    // ==========================================
    
    const CONFIG = {
        showOffset: 300,           // Show button after scrolling this many pixels
        scrollDuration: 800,       // Scroll animation duration
        showProgress: true,        // Show progress circle
        position: {
            bottom: '30px',
            right: '30px'
        },
        mobilePosition: {
            bottom: '20px',
            right: '20px'
        }
    };
    
    // ==========================================
    // BACK TO TOP CLASS
    // ==========================================
    
    class BackToTop {
        constructor(options = {}) {
            this.options = { ...CONFIG, ...options };
            this.button = null;
            this.progressCircle = null;
            this.isVisible = false;
            this.isScrolling = false;
            
            this.init();
        }
        
        init() {
            console.log('Back to Top: Initializing...');
            
            // Create button
            this.createButton();
            
            // Attach event listeners
            this.attachEvents();
            
            // Check initial scroll position
            this.handleScroll();
            
            console.log('Back to Top: Initialized successfully');
        }
        
        /**
         * Create button element
         */
        createButton() {
            // Create button
            this.button = document.createElement('button');
            this.button.className = 'back-to-top';
            this.button.setAttribute('aria-label', 'Back to top');
            this.button.setAttribute('title', 'Back to top');
            
            // Create inner HTML with progress circle
            if (this.options.showProgress) {
                this.button.innerHTML = `
                    <svg class="back-to-top__progress" viewBox="0 0 100 100">
                        <circle class="back-to-top__progress-bg" cx="50" cy="50" r="45"></circle>
                        <circle class="back-to-top__progress-fill" cx="50" cy="50" r="45"></circle>
                    </svg>
                    <svg class="back-to-top__icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M12 19V5M5 12l7-7 7 7"/>
                    </svg>
                `;
                
                this.progressCircle = this.button.querySelector('.back-to-top__progress-fill');
            } else {
                this.button.innerHTML = `
                    <svg class="back-to-top__icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M12 19V5M5 12l7-7 7 7"/>
                    </svg>
                `;
            }
            
            // Append to body
            document.body.appendChild(this.button);
            
            // Apply responsive positioning
            this.updatePosition();
        }
        
        /**
         * Update button position based on screen size
         */
        updatePosition() {
            const isMobile = window.innerWidth < 768;
            const position = isMobile ? this.options.mobilePosition : this.options.position;
            
            this.button.style.bottom = position.bottom;
            this.button.style.right = position.right;
        }
        
        /**
         * Attach event listeners
         */
        attachEvents() {
            // Click event
            this.button.addEventListener('click', () => this.scrollToTop());
            
            // Scroll event
            window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
            
            // Resize event
            window.addEventListener('resize', () => this.updatePosition(), { passive: true });
            
            // Keyboard support
            this.button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.scrollToTop();
                }
            });
        }
        
        /**
         * Handle scroll event
         */
        handleScroll() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const shouldShow = scrollTop > this.options.showOffset;
            
            // Show/hide button
            if (shouldShow && !this.isVisible) {
                this.show();
            } else if (!shouldShow && this.isVisible) {
                this.hide();
            }
            
            // Update progress circle
            if (this.options.showProgress && this.isVisible) {
                this.updateProgress();
            }
        }
        
        /**
         * Show button
         */
        show() {
            this.button.classList.add('visible');
            this.isVisible = true;
            
            // Announce to screen readers
            this.button.setAttribute('aria-hidden', 'false');
        }
        
        /**
         * Hide button
         */
        hide() {
            this.button.classList.remove('visible');
            this.isVisible = false;
            
            // Hide from screen readers
            this.button.setAttribute('aria-hidden', 'true');
        }
        
        /**
         * Update progress circle
         */
        updateProgress() {
            if (!this.progressCircle) return;
            
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            
            // Calculate stroke dash offset
            const circumference = 2 * Math.PI * 45; // radius = 45
            const offset = circumference - (scrollPercent / 100) * circumference;
            
            this.progressCircle.style.strokeDashoffset = offset;
        }
        
        /**
         * Scroll to top
         */
        scrollToTop() {
            if (this.isScrolling) return;
            
            this.isScrolling = true;
            
            // Smooth scroll with custom easing
            const startPosition = window.pageYOffset;
            const startTime = performance.now();
            
            const scroll = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / this.options.scrollDuration, 1);
                
                // Easing function (easeInOutCubic)
                const easing = progress < 0.5
                    ? 4 * progress * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
                
                window.scrollTo(0, startPosition * (1 - easing));
                
                if (progress < 1) {
                    requestAnimationFrame(scroll);
                } else {
                    this.isScrolling = false;
                    
                    // Focus on skip link or main content after scroll
                    const skipLink = document.querySelector('.skip-link');
                    if (skipLink) {
                        skipLink.focus();
                    }
                }
            };
            
            requestAnimationFrame(scroll);
            
            // Dispatch custom event
            this.button.dispatchEvent(new CustomEvent('scrolledToTop'));
        }
        
        /**
         * Destroy instance
         */
        destroy() {
            if (this.button) {
                this.button.remove();
            }
            console.log('Back to Top: Destroyed');
        }
    }
    
    // ==========================================
    // PUBLIC API
    // ==========================================
    
    window.BackToTop = BackToTop;
    window.backToTop = null;
    
    // ==========================================
    // AUTO-INITIALIZE
    // ==========================================
    
    function init() {
        console.log('Back to Top: Creating instance...');
        
        // Create global instance
        window.backToTop = new BackToTop({
            showOffset: 300,
            scrollDuration: 800,
            showProgress: true
        });
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (window.backToTop) {
            window.backToTop.destroy();
        }
    });
    
})();