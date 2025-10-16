/**
 * ========================================
 * COUNTER ANIMATION - IRONWOOD
 * ========================================
 * 
 * Features:
 * - Smooth number counting animation
 * - Intersection Observer for performance
 * - Supports integers and decimals
 * - Plus sign animation
 * - Configurable duration
 * 
 * @version 1.0.0
 */

(function() {
    'use strict';
    
    // ==========================================
    // CONFIGURATION
    // ==========================================
    
    const CONFIG = {
        duration: 2000,              // Animation duration in ms
        easingFunction: 'easeOutQuad', // Easing function
        observerThreshold: 0.3,      // When to trigger (30% visible)
        decimalPlaces: 0             // Decimal precision
    };
    
    // ==========================================
    // EASING FUNCTIONS
    // ==========================================
    
    const easingFunctions = {
        linear: t => t,
        easeInQuad: t => t * t,
        easeOutQuad: t => t * (2 - t),
        easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        easeInCubic: t => t * t * t,
        easeOutCubic: t => (--t) * t * t + 1,
        easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
    };
    
    // ==========================================
    // COUNTER ANIMATION CLASS
    // ==========================================
    
    class CounterAnimation {
        constructor(element, options = {}) {
            this.element = element;
            this.options = { ...CONFIG, ...options };
            
            // Parse the target value
            this.targetValue = this.parseValue(element.textContent);
            this.hasPlus = element.textContent.includes('+');
            this.hasSuffix = this.extractSuffix(element.textContent);
            
            // Store original content as data attribute
            this.element.dataset.original = element.textContent;
            
            // Initialize
            this.currentValue = 0;
            this.startTime = null;
            this.animationFrame = null;
            this.hasAnimated = false;
        }
        
        /**
         * Parse numeric value from string
         */
        parseValue(str) {
            const cleaned = str.replace(/[^0-9.]/g, '');
            return parseFloat(cleaned) || 0;
        }
        
        /**
         * Extract suffix (like 'M', 'K', etc.)
         */
        extractSuffix(str) {
            const match = str.match(/[A-Za-z]+$/);
            return match ? match[0] : '';
        }
        
        /**
         * Format number with proper separators
         */
        formatNumber(num) {
            const rounded = Math.floor(num);
            return rounded.toLocaleString('en-US');
        }
        
        /**
         * Animate the counter
         */
        animate(timestamp) {
            if (!this.startTime) {
                this.startTime = timestamp;
            }
            
            const elapsed = timestamp - this.startTime;
            const progress = Math.min(elapsed / this.options.duration, 1);
            
            // Apply easing
            const easingFunc = easingFunctions[this.options.easingFunction] || easingFunctions.easeOutQuad;
            const easedProgress = easingFunc(progress);
            
            // Calculate current value
            this.currentValue = this.targetValue * easedProgress;
            
            // Update display
            this.updateDisplay(this.currentValue);
            
            // Continue animation or finish
            if (progress < 1) {
                this.animationFrame = requestAnimationFrame((ts) => this.animate(ts));
            } else {
                this.finish();
            }
        }
        
        /**
         * Update the display
         */
        updateDisplay(value) {
            let displayValue = this.formatNumber(value);
            
            if (this.hasSuffix) {
                displayValue += this.hasSuffix;
            }
            
            if (this.hasPlus && value >= this.targetValue) {
                displayValue += '<span class="stat-plus">+</span>';
            }
            
            this.element.innerHTML = displayValue;
        }
        
        /**
         * Finish animation
         */
        finish() {
            this.updateDisplay(this.targetValue);
            this.hasAnimated = true;
            
            // Dispatch custom event
            this.element.dispatchEvent(new CustomEvent('counterComplete', {
                detail: { value: this.targetValue }
            }));
        }
        
        /**
         * Start animation
         */
        start() {
            if (this.hasAnimated) return;
            
            // Reset
            this.currentValue = 0;
            this.startTime = null;
            
            // Start animation
            this.animationFrame = requestAnimationFrame((ts) => this.animate(ts));
        }
        
        /**
         * Stop animation
         */
        stop() {
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
                this.animationFrame = null;
            }
        }
        
        /**
         * Reset animation
         */
        reset() {
            this.stop();
            this.hasAnimated = false;
            this.currentValue = 0;
            this.element.textContent = '0';
        }
    }
    
    // ==========================================
    // INTERSECTION OBSERVER
    // ==========================================
    
    class CounterObserver {
        constructor(options = {}) {
            this.options = { ...CONFIG, ...options };
            this.counters = new Map();
            this.observer = null;
            
            this.init();
        }
        
        init() {
            // Create Intersection Observer
            this.observer = new IntersectionObserver(
                (entries) => this.handleIntersection(entries),
                {
                    threshold: this.options.observerThreshold,
                    rootMargin: '0px'
                }
            );
            
            // Find and observe all counter elements
            this.discoverCounters();
            
            console.log(`Counter Animation: Found ${this.counters.size} counters`);
        }
        
        /**
         * Discover counter elements
         */
        discoverCounters() {
            const elements = document.querySelectorAll('.stat-number, [data-counter]');
            
            elements.forEach(element => {
                // Skip if already observed
                if (this.counters.has(element)) return;
                
                // Create counter instance
                const counter = new CounterAnimation(element, this.options);
                this.counters.set(element, counter);
                
                // Observe element
                this.observer.observe(element);
            });
        }
        
        /**
         * Handle intersection
         */
        handleIntersection(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = this.counters.get(entry.target);
                    
                    if (counter && !counter.hasAnimated) {
                        // Small delay for better effect
                        setTimeout(() => {
                            counter.start();
                        }, 100);
                        
                        // Unobserve after animation
                        this.observer.unobserve(entry.target);
                    }
                }
            });
        }
        
        /**
         * Add new counter
         */
        addCounter(element, options = {}) {
            if (this.counters.has(element)) return;
            
            const counter = new CounterAnimation(element, { ...this.options, ...options });
            this.counters.set(element, counter);
            this.observer.observe(element);
        }
        
        /**
         * Remove counter
         */
        removeCounter(element) {
            const counter = this.counters.get(element);
            if (counter) {
                counter.stop();
                this.observer.unobserve(element);
                this.counters.delete(element);
            }
        }
        
        /**
         * Reset all counters
         */
        resetAll() {
            this.counters.forEach(counter => counter.reset());
        }
        
        /**
         * Destroy observer
         */
        destroy() {
            this.counters.forEach(counter => counter.stop());
            this.observer.disconnect();
            this.counters.clear();
            console.log('Counter Animation: Destroyed');
        }
    }
    
    // ==========================================
    // PUBLIC API
    // ==========================================
    
    window.CounterAnimation = CounterAnimation;
    window.counterObserver = null;
    
    // ==========================================
    // AUTO-INITIALIZE
    // ==========================================
    
    function init() {
        console.log('Counter Animation: Initializing...');
        
        // Create global observer
        window.counterObserver = new CounterObserver({
            duration: 2000,
            easingFunction: 'easeOutCubic',
            observerThreshold: 0.3
        });
        
        console.log('Counter Animation: Initialized successfully');
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (window.counterObserver) {
            window.counterObserver.destroy();
        }
    });
    
})();