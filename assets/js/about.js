/**
 * ========================================
 * ABOUT PAGE INTERACTIONS
 * ========================================
 * 
 * Features:
 * - Biography toggle with smooth animation
 * - Accessible keyboard navigation
 * - Smooth scroll to expanded content
 * 
 * @version 1.0.0
 */

(function() {
    'use strict';
    
    // ==========================================
    // DOM ELEMENTS
    // ==========================================
    
    const bioToggle = document.getElementById('bioToggle');
    const bioExtended = document.getElementById('bioExtended');
    
    if (!bioToggle || !bioExtended) {
        console.warn('About: Biography toggle elements not found');
        return;
    }
    
    // ==========================================
    // STATE
    // ==========================================
    
    let isExpanded = false;
    
    // ==========================================
    // TOGGLE BIOGRAPHY
    // ==========================================
    
    /**
     * Toggle biography expanded state
     */
    function toggleBio() {
        isExpanded = !isExpanded;
        
        if (isExpanded) {
            // Expand
            bioExtended.classList.add('expanded');
            bioToggle.classList.add('active');
            bioToggle.setAttribute('aria-expanded', 'true');
            
            // Update button text
            const toggleText = bioToggle.querySelector('.toggle-text');
            if (toggleText) {
                toggleText.textContent = 'Show Less';
            }
            
            // Smooth scroll to expanded content after animation
            setTimeout(() => {
                const bioExtendedRect = bioExtended.getBoundingClientRect();
                const isVisible = bioExtendedRect.top < window.innerHeight;
                
                if (!isVisible) {
                    bioExtended.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest'
                    });
                }
            }, 300);
            
        } else {
            // Collapse
            bioExtended.classList.remove('expanded');
            bioToggle.classList.remove('active');
            bioToggle.setAttribute('aria-expanded', 'false');
            
            // Update button text
            const toggleText = bioToggle.querySelector('.toggle-text');
            if (toggleText) {
                toggleText.textContent = 'Show More';
            }
            
            // Scroll back to toggle button
            setTimeout(() => {
                bioToggle.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                });
            }, 100);
        }
        
        // Micro-interaction: Button pulse
        bioToggle.style.transform = 'scale(0.95)';
        setTimeout(() => {
            bioToggle.style.transform = '';
        }, 150);
    }
    
    // ==========================================
    // EVENT LISTENERS
    // ==========================================
    
    function attachEventListeners() {
        // Click event
        bioToggle.addEventListener('click', toggleBio);
        
        // Keyboard event (Enter or Space)
        bioToggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleBio();
            }
        });
    }
    
    function removeEventListeners() {
        bioToggle.removeEventListener('click', toggleBio);
    }
    
    // ==========================================
    // INITIALIZATION
    // ==========================================
    
    function init() {
        console.log('About: Initializing biography toggle...');
        
        // Set initial state
        bioToggle.setAttribute('aria-expanded', 'false');
        bioExtended.setAttribute('aria-hidden', 'true');
        
        // Attach event listeners
        attachEventListeners();
        
        console.log('About: Initialized successfully');
    }
    
    function destroy() {
        removeEventListeners();
        console.log('About: Destroyed');
    }
    
    // ==========================================
    // PUBLIC API
    // ==========================================
    
    window.aboutPage = {
        toggleBio: toggleBio,
        isExpanded: () => isExpanded,
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