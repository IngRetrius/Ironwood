/**
 * ========================================
 * SCROLL REVEAL ANIMATIONS - IRONWOOD
 * ========================================
 * 
 * Features:
 * - Lightweight scroll-triggered animations
 * - Multiple animation types
 * - Stagger effects
 * - Mobile-optimized
 * - No dependencies
 * 
 * @version 1.0.0
 */

(function() {
    'use strict';
    
    // ==========================================
    // CONFIGURATION
    // ==========================================
    
    const CONFIG = {
        threshold: 0.15,           // Trigger when 15% visible
        rootMargin: '0px 0px -50px 0px',
        animationDuration: 600,    // Animation duration in ms
        staggerDelay: 100,         // Delay between staggered items
        distance: '50px',          // Distance for slide animations
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        once: true,                // Animate only once
        mobile: true               // Enable on mobile
    };
    
    // ==========================================
    // ANIMATION PRESETS
    // ==========================================
    
    const ANIMATIONS = {
        'fade-up': {
            initial: {
                opacity: '0',
                transform: 'translateY(50px)'
            },
            animate: {
                opacity: '1',
                transform: 'translateY(0)'
            }
        },
        'fade-down': {
            initial: {
                opacity: '0',
                transform: 'translateY(-50px)'
            },
            animate: {
                opacity: '1',
                transform: 'translateY(0)'
            }
        },
        'fade-left': {
            initial: {
                opacity: '0',
                transform: 'translateX(-50px)'
            },
            animate: {
                opacity: '1',
                transform: 'translateX(0)'
            }
        },
        'fade-right': {
            initial: {
                opacity: '0',
                transform: 'translateX(50px)'
            },
            animate: {
                opacity: '1',
                transform: 'translateX(0)'
            }
        },
        'fade': {
            initial: {
                opacity: '0'
            },
            animate: {
                opacity: '1'
            }
        },
        'zoom-in': {
            initial: {
                opacity: '0',
                transform: 'scale(0.9)'
            },
            animate: {
                opacity: '1',
                transform: 'scale(1)'
            }
        },
        'zoom-out': {
            initial: {
                opacity: '0',
                transform: 'scale(1.1)'
            },
            animate: {
                opacity: '1',
                transform: 'scale(1)'
            }
        },
        'flip-left': {
            initial: {
                opacity: '0',
                transform: 'perspective(2500px) rotateY(-100deg)'
            },
            animate: {
                opacity: '1',
                transform: 'perspective(2500px) rotateY(0)'
            }
        },
        'flip-right': {
            initial: {
                opacity: '0',
                transform: 'perspective(2500px) rotateY(100deg)'
            },
            animate: {
                opacity: '1',
                transform: 'perspective(2500px) rotateY(0)'
            }
        }
    };
    
    // ==========================================
    // SCROLL REVEAL CLASS
    // ==========================================
    
    class ScrollReveal {
        constructor(options = {}) {
            this.options = { ...CONFIG, ...options };
            this.elements = new Map();
            this.observer = null;
            
            // Check if reduced motion is preferred
            this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            
            // Check if mobile
            this.isMobile = window.innerWidth < 768;
            
            this.init();
        }
        
        init() {
            // Skip if reduced motion is preferred
            if (this.reducedMotion) {
                console.log('Scroll Reveal: Skipped (reduced motion preferred)');
                return;
            }
            
            // Skip on mobile if disabled
            if (this.isMobile && !this.options.mobile) {
                console.log('Scroll Reveal: Skipped (mobile disabled)');
                return;
            }
            
            // Create observer
            this.observer = new IntersectionObserver(
                (entries) => this.handleIntersection(entries),
                {
                    threshold: this.options.threshold,
                    rootMargin: this.options.rootMargin
                }
            );
            
            // Discover and observe elements
            this.discoverElements();
            
            console.log(`Scroll Reveal: Watching ${this.elements.size} elements`);
        }
        
        /**
         * Discover elements with data-reveal attribute
         */
        discoverElements() {
            const elements = document.querySelectorAll('[data-reveal]');
            
            elements.forEach((element, index) => {
                // Skip if already tracked
                if (this.elements.has(element)) return;
                
                // Get animation type
                const animationType = element.dataset.reveal || 'fade-up';
                const animation = ANIMATIONS[animationType] || ANIMATIONS['fade-up'];
                
                // Get custom options
                const delay = parseInt(element.dataset.revealDelay) || 0;
                const duration = parseInt(element.dataset.revealDuration) || this.options.animationDuration;
                const stagger = element.dataset.revealStagger === 'true';
                
                // Store element data
                this.elements.set(element, {
                    animation,
                    animationType,
                    delay,
                    duration,
                    stagger,
                    index,
                    revealed: false
                });
                
                // Apply initial styles
                this.applyInitialStyles(element, animation, duration);
                
                // Observe element
                this.observer.observe(element);
            });
        }
        
        /**
         * Apply initial animation styles
         */
        applyInitialStyles(element, animation, duration) {
            Object.assign(element.style, {
                ...animation.initial,
                transition: `all ${duration}ms ${this.options.easing}`,
                willChange: 'opacity, transform'
            });
        }
        
        /**
         * Handle intersection
         */
        handleIntersection(entries) {
            entries.forEach(entry => {
                const elementData = this.elements.get(entry.target);
                
                if (!elementData) return;
                
                if (entry.isIntersecting && !elementData.revealed) {
                    // Calculate delay (including stagger)
                    let totalDelay = elementData.delay;
                    
                    if (elementData.stagger) {
                        totalDelay += elementData.index * this.options.staggerDelay;
                    }
                    
                    // Reveal element
                    setTimeout(() => {
                        this.reveal(entry.target, elementData);
                    }, totalDelay);
                    
                    // Unobserve if once
                    if (this.options.once) {
                        this.observer.unobserve(entry.target);
                    }
                } else if (!entry.isIntersecting && !this.options.once && elementData.revealed) {
                    // Hide element if not "once"
                    this.hide(entry.target, elementData);
                }
            });
        }
        
        /**
         * Reveal element
         */
        reveal(element, elementData) {
            // Apply animate styles
            Object.assign(element.style, elementData.animation.animate);
            
            // Mark as revealed
            elementData.revealed = true;
            
            // Add revealed class
            element.classList.add('revealed');
            
            // Dispatch custom event
            element.dispatchEvent(new CustomEvent('revealed', {
                detail: { type: elementData.animationType }
            }));
            
            // Cleanup will-change after animation
            setTimeout(() => {
                element.style.willChange = 'auto';
            }, elementData.duration);
        }
        
        /**
         * Hide element
         */
        hide(element, elementData) {
            // Apply initial styles
            Object.assign(element.style, elementData.animation.initial);
            
            // Mark as not revealed
            elementData.revealed = false;
            
            // Remove revealed class
            element.classList.remove('revealed');
        }
        
        /**
         * Add new element
         */
        add(element, options = {}) {
            if (this.elements.has(element)) return;
            
            const animationType = options.animation || 'fade-up';
            const animation = ANIMATIONS[animationType] || ANIMATIONS['fade-up'];
            const duration = options.duration || this.options.animationDuration;
            
            this.elements.set(element, {
                animation,
                animationType,
                delay: options.delay || 0,
                duration,
                stagger: options.stagger || false,
                index: this.elements.size,
                revealed: false
            });
            
            this.applyInitialStyles(element, animation, duration);
            this.observer.observe(element);
        }
        
        /**
         * Remove element
         */
        remove(element) {
            if (this.elements.has(element)) {
                this.observer.unobserve(element);
                this.elements.delete(element);
            }
        }
        
        /**
         * Reset all elements
         */
        reset() {
            this.elements.forEach((data, element) => {
                this.hide(element, data);
            });
        }
        
        /**
         * Destroy instance
         */
        destroy() {
            if (this.observer) {
                this.observer.disconnect();
            }
            this.elements.clear();
            console.log('Scroll Reveal: Destroyed');
        }
    }
    
    // ==========================================
    // PUBLIC API
    // ==========================================
    
    window.ScrollReveal = ScrollReveal;
    window.scrollReveal = null;
    
    // ==========================================
    // AUTO-INITIALIZE
    // ==========================================
    
    function init() {
        console.log('Scroll Reveal: Initializing...');
        
        // Create global instance
        window.scrollReveal = new ScrollReveal({
            threshold: 0.15,
            animationDuration: 600,
            staggerDelay: 100,
            once: true,
            mobile: true
        });
        
        console.log('Scroll Reveal: Initialized successfully');
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (window.scrollReveal) {
            window.scrollReveal.destroy();
        }
    });
    
})();