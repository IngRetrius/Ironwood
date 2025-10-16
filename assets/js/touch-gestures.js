/**
 * ========================================
 * TOUCH GESTURES - IRONWOOD
 * ========================================
 * 
 * Features:
 * - Swipe detection (left, right, up, down)
 * - Tap detection (single, double)
 * - Pinch zoom detection
 * - Long press detection
 * - Configurable thresholds
 * - Prevents default behaviors when needed
 * 
 * @version 1.0.0
 */

(function() {
    'use strict';
    
    // ==========================================
    // CONFIGURATION
    // ==========================================
    
    const CONFIG = {
        swipeThreshold: 50,        // Minimum distance for swipe
        swipeTimeout: 300,          // Maximum time for swipe
        tapTimeout: 200,            // Maximum time for tap
        doubleTapTimeout: 300,      // Maximum time between taps
        longPressTimeout: 500,      // Minimum time for long press
        pinchThreshold: 10,         // Minimum distance for pinch
        preventDefaultSwipe: false  // Prevent default on swipe
    };
    
    // ==========================================
    // TOUCH GESTURE CLASS
    // ==========================================
    
    class TouchGesture {
        constructor(element, options = {}) {
            this.element = element;
            this.options = { ...CONFIG, ...options };
            
            // Touch state
            this.touchStartX = 0;
            this.touchStartY = 0;
            this.touchEndX = 0;
            this.touchEndY = 0;
            this.touchStartTime = 0;
            this.touchEndTime = 0;
            
            // Tap state
            this.lastTapTime = 0;
            this.tapCount = 0;
            
            // Long press state
            this.longPressTimer = null;
            this.isLongPress = false;
            
            // Pinch state
            this.initialDistance = 0;
            this.isPinching = false;
            
            // Bind methods
            this.handleTouchStart = this.handleTouchStart.bind(this);
            this.handleTouchMove = this.handleTouchMove.bind(this);
            this.handleTouchEnd = this.handleTouchEnd.bind(this);
            this.handleTouchCancel = this.handleTouchCancel.bind(this);
            
            this.init();
        }
        
        init() {
            // Attach event listeners
            this.element.addEventListener('touchstart', this.handleTouchStart, { passive: false });
            this.element.addEventListener('touchmove', this.handleTouchMove, { passive: false });
            this.element.addEventListener('touchend', this.handleTouchEnd, { passive: false });
            this.element.addEventListener('touchcancel', this.handleTouchCancel);
        }
        
        /**
         * Handle touch start
         */
        handleTouchStart(e) {
            const touch = e.touches[0];
            
            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
            this.touchStartTime = Date.now();
            
            // Reset end positions
            this.touchEndX = this.touchStartX;
            this.touchEndY = this.touchStartY;
            
            // Reset long press
            this.isLongPress = false;
            
            // Start long press timer
            this.longPressTimer = setTimeout(() => {
                this.isLongPress = true;
                this.dispatchGesture('longpress', {
                    x: this.touchStartX,
                    y: this.touchStartY
                });
            }, this.options.longPressTimeout);
            
            // Handle pinch (two fingers)
            if (e.touches.length === 2) {
                this.handlePinchStart(e);
            }
        }
        
        /**
         * Handle touch move
         */
        handleTouchMove(e) {
            const touch = e.touches[0];
            
            this.touchEndX = touch.clientX;
            this.touchEndY = touch.clientY;
            
            // Cancel long press if moved
            const deltaX = Math.abs(this.touchEndX - this.touchStartX);
            const deltaY = Math.abs(this.touchEndY - this.touchStartY);
            
            if (deltaX > 10 || deltaY > 10) {
                clearTimeout(this.longPressTimer);
                this.isLongPress = false;
            }
            
            // Handle pinch move
            if (e.touches.length === 2) {
                this.handlePinchMove(e);
            }
            
            // Prevent default if needed
            if (this.options.preventDefaultSwipe && (deltaX > 10 || deltaY > 10)) {
                e.preventDefault();
            }
        }
        
        /**
         * Handle touch end
         */
        handleTouchEnd(e) {
            this.touchEndTime = Date.now();
            
            // Clear long press timer
            clearTimeout(this.longPressTimer);
            
            // Skip if long press
            if (this.isLongPress) {
                return;
            }
            
            // Calculate deltas
            const deltaX = this.touchEndX - this.touchStartX;
            const deltaY = this.touchEndY - this.touchStartY;
            const deltaTime = this.touchEndTime - this.touchStartTime;
            
            const absDeltaX = Math.abs(deltaX);
            const absDeltaY = Math.abs(deltaY);
            
            // Detect swipe
            if (deltaTime < this.options.swipeTimeout) {
                if (absDeltaX > this.options.swipeThreshold || absDeltaY > this.options.swipeThreshold) {
                    this.handleSwipe(deltaX, deltaY, absDeltaX, absDeltaY);
                    return;
                }
            }
            
            // Detect tap
            if (absDeltaX < 10 && absDeltaY < 10 && deltaTime < this.options.tapTimeout) {
                this.handleTap();
            }
            
            // Handle pinch end
            if (this.isPinching) {
                this.handlePinchEnd(e);
            }
        }
        
        /**
         * Handle touch cancel
         */
        handleTouchCancel(e) {
            clearTimeout(this.longPressTimer);
            this.isLongPress = false;
            this.isPinching = false;
        }
        
        /**
         * Handle swipe
         */
        handleSwipe(deltaX, deltaY, absDeltaX, absDeltaY) {
            let direction;
            
            // Determine direction
            if (absDeltaX > absDeltaY) {
                // Horizontal swipe
                direction = deltaX > 0 ? 'right' : 'left';
            } else {
                // Vertical swipe
                direction = deltaY > 0 ? 'down' : 'up';
            }
            
            this.dispatchGesture('swipe', {
                direction,
                deltaX,
                deltaY,
                distance: Math.sqrt(deltaX * deltaX + deltaY * deltaY),
                velocity: Math.sqrt(deltaX * deltaX + deltaY * deltaY) / (this.touchEndTime - this.touchStartTime)
            });
            
            // Dispatch direction-specific event
            this.dispatchGesture(`swipe${direction}`, {
                deltaX,
                deltaY,
                distance: direction === 'left' || direction === 'right' ? absDeltaX : absDeltaY
            });
        }
        
        /**
         * Handle tap
         */
        handleTap() {
            const now = Date.now();
            
            // Check for double tap
            if (now - this.lastTapTime < this.options.doubleTapTimeout) {
                this.tapCount++;
                
                if (this.tapCount === 2) {
                    this.dispatchGesture('doubletap', {
                        x: this.touchEndX,
                        y: this.touchEndY
                    });
                    this.tapCount = 0;
                    return;
                }
            } else {
                this.tapCount = 1;
            }
            
            this.lastTapTime = now;
            
            // Single tap (with delay to detect double tap)
            setTimeout(() => {
                if (this.tapCount === 1) {
                    this.dispatchGesture('tap', {
                        x: this.touchEndX,
                        y: this.touchEndY
                    });
                }
                this.tapCount = 0;
            }, this.options.doubleTapTimeout);
        }
        
        /**
         * Handle pinch start
         */
        handlePinchStart(e) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            
            this.initialDistance = this.getDistance(touch1, touch2);
            this.isPinching = true;
        }
        
        /**
         * Handle pinch move
         */
        handlePinchMove(e) {
            if (!this.isPinching) return;
            
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            
            const currentDistance = this.getDistance(touch1, touch2);
            const delta = currentDistance - this.initialDistance;
            
            if (Math.abs(delta) > this.options.pinchThreshold) {
                const scale = currentDistance / this.initialDistance;
                const direction = delta > 0 ? 'out' : 'in';
                
                this.dispatchGesture('pinch', {
                    scale,
                    direction,
                    delta
                });
            }
        }
        
        /**
         * Handle pinch end
         */
        handlePinchEnd(e) {
            this.isPinching = false;
            this.initialDistance = 0;
        }
        
        /**
         * Get distance between two touches
         */
        getDistance(touch1, touch2) {
            const deltaX = touch2.clientX - touch1.clientX;
            const deltaY = touch2.clientY - touch1.clientY;
            return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        }
        
        /**
         * Dispatch custom gesture event
         */
        dispatchGesture(type, detail) {
            const event = new CustomEvent(type, {
                detail,
                bubbles: true,
                cancelable: true
            });
            
            this.element.dispatchEvent(event);
        }
        
        /**
         * Destroy instance
         */
        destroy() {
            this.element.removeEventListener('touchstart', this.handleTouchStart);
            this.element.removeEventListener('touchmove', this.handleTouchMove);
            this.element.removeEventListener('touchend', this.handleTouchEnd);
            this.element.removeEventListener('touchcancel', this.handleTouchCancel);
            
            clearTimeout(this.longPressTimer);
        }
    }
    
    // ==========================================
    // HERO TABS INTEGRATION
    // ==========================================
    
    function initHeroGestures() {
        const heroSection = document.getElementById('heroSection');
        
        if (!heroSection) {
            console.log('Touch Gestures: Hero section not found');
            return;
        }
        
        console.log('Touch Gestures: Initializing hero swipe...');
        
        const heroGesture = new TouchGesture(heroSection, {
            swipeThreshold: 50,
            preventDefaultSwipe: true
        });
        
        // Swipe left = next tab
        heroSection.addEventListener('swipeleft', (e) => {
            if (window.heroTabs) {
                window.heroTabs.next();
            }
        });
        
        // Swipe right = previous tab
        heroSection.addEventListener('swiperight', (e) => {
            if (window.heroTabs) {
                window.heroTabs.prev();
            }
        });
        
        console.log('Touch Gestures: Hero swipe initialized');
    }
    
    // ==========================================
    // PUBLIC API
    // ==========================================
    
    window.TouchGesture = TouchGesture;
    
    // ==========================================
    // AUTO-INITIALIZE
    // ==========================================
    
    function init() {
        console.log('Touch Gestures: Initializing...');
        
        // Initialize hero gestures
        initHeroGestures();
        
        console.log('Touch Gestures: Initialized successfully');
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();