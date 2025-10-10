/**
 * ========================================
 * HERO TABS - FIXED VERSION (OVERLAY OK)
 * ========================================
 * 
 * Features:
 * - 10 second auto-rotation
 * - Visual progress indicator SYNCHRONIZED
 * - Pause on hover
 * - Smooth transitions
 * - Accessibility improvements
 * - ✅ NO modifica z-index (respeta overlay)
 * 
 * @version 5.2.0 - OVERLAY FIXED
 */

(function() {
    'use strict';
    
    // ==========================================
    // CONFIGURATION
    // ==========================================
    
    const CONFIG = {
        autoRotateInterval: 10000, // 10 seconds
        titleTransitionDuration: 500,
        imageTransitionDuration: 1200,
        progressUpdateInterval: 16 // 60fps for smooth animation
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
    const liveRegion = document.getElementById('tabLiveRegion');
    const mobileDots = document.querySelectorAll('.hero__dot');
    
    if (!heroSection || !heroTitle || tabButtons.length === 0) {
        console.warn('Hero tabs: Required elements not found');
        return;
    }
    
    // ==========================================
    // STATE VARIABLES
    // ==========================================
    
    let currentTab = 0;
    let progressTimer = null;
    let isPaused = false;
    let isTransitioning = false;
    let progressValue = 0;
    let startTime = null;
    const totalTabs = tabButtons.length;
    
    // ==========================================
    // PROGRESS INDICATOR
    // ==========================================
    
    /**
     * Update progress bar using requestAnimationFrame for smooth animation
     */
    function updateProgress(timestamp) {
        if (!startTime) startTime = timestamp;
        
        // Calculate progress
        const elapsed = timestamp - startTime;
        progressValue = (elapsed / CONFIG.autoRotateInterval) * 100;
        
        // Update progress bar
        const activeTab = tabButtons[currentTab];
        const progressBar = activeTab.querySelector('.hero__tab-progress');
        if (progressBar) {
            progressBar.style.width = `${Math.min(progressValue, 100)}%`;
        }
        
        // Check if we should advance to next tab
        if (progressValue >= 100) {
            // Reset and go to next tab
            progressValue = 0;
            startTime = null;
            
            // Advance only if not paused and not currently transitioning
            if (!isPaused && !isTransitioning) {
                nextTab();
            }
        }
        
        // Continue animation if not paused
        if (!isPaused) {
            progressTimer = requestAnimationFrame(updateProgress);
        }
    }
    
    /**
     * Start progress animation
     */
    function startProgress() {
        stopProgress();
        startTime = null;
        progressValue = 0;
        // Start continuous progress animation. Hover no longer pauses progress.
        progressTimer = requestAnimationFrame(updateProgress);
    }
    
    /**
     * Stop progress animation
     */
    function stopProgress() {
        if (progressTimer) {
            cancelAnimationFrame(progressTimer);
            progressTimer = null;
        }
    }
    
    /**
     * Reset progress bar
     */
    function resetProgress() {
        progressValue = 0;
        startTime = null;
        tabButtons.forEach(btn => {
            const progressBar = btn.querySelector('.hero__tab-progress');
            if (progressBar) {
                progressBar.style.width = '0%';
            }
        });
    }
    
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
        
        // Micro-interaction: Scale effect
        const newTab = tabButtons[index];
        newTab.style.transform = 'scale(1.05)';
        setTimeout(() => {
            newTab.style.transform = '';
        }, 200);
        
        // Update current tab
        const previousTab = currentTab;
        currentTab = index;
        
        // Update tab buttons
        tabButtons.forEach((btn, i) => {
            if (i === index) {
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
                btn.setAttribute('tabindex', '0');
            } else {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
                btn.setAttribute('tabindex', '-1');
            }
        });
        
        // Update mobile dots
        if (mobileDots.length > 0) {
            mobileDots.forEach((dot, i) => {
                if (i === index) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }
        
        // Update tab panes
        tabPanes.forEach((pane, i) => {
            if (i === index) {
                pane.classList.add('active');
                pane.setAttribute('aria-hidden', 'false');
            } else {
                pane.classList.remove('active');
                pane.setAttribute('aria-hidden', 'true');
            }
        });
        
        // Update title with smooth fade
        updateHeroTitle(index);
        
        // Update background images
        updateBackgroundImage(index);
        
        // Announce change to screen readers
        announceTabChange(index);
        
        // Reset progress
        resetProgress();
        
        // Restart progress animation (hover no longer pauses progress)
        if (!isPaused) {
            startProgress();
        }
        
        // Reset transition flag after animation completes
        setTimeout(() => {
            isTransitioning = false;
        }, CONFIG.imageTransitionDuration);
        
        console.log(`Tab changed: ${previousTab} → ${index} (${TAB_NAMES[index]})`);
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
     * ✅ NO MODIFICA Z-INDEX - Respeta el overlay
     * @param {number} index - Tab index
     */
    function updateBackgroundImage(index) {
        const tabName = TAB_NAMES[index];
        
        backgroundImages.forEach(img => {
            if (img.dataset.tab === tabName) {
                img.style.opacity = '1';
                console.log(`Showing image for: ${tabName}`);
            } else {
                img.style.opacity = '0';
            }
        });
    }
    
    /**
     * Announce tab change to screen readers
     * @param {number} index - Tab index
     */
    function announceTabChange(index) {
        if (liveRegion) {
            const tabText = tabButtons[index].querySelector('.hero__tab-text').textContent;
            liveRegion.textContent = `Now viewing: ${tabText}`;
        }
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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <polygon points="8 5 19 12 8 19"/>
                </svg>
            `;
            stopProgress();
            console.log('Hero: Paused');
        } else {
            pauseButton.classList.remove('paused');
            pauseButton.setAttribute('aria-label', 'Pause slideshow');
            pauseButton.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <rect x="6" y="4" width="4" width="16" rx="1"/>
                    <rect x="14" y="4" width="4" height="16" rx="1"/>
                </svg>
            `;
            startProgress();
            console.log('Hero: Resumed');
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
        
        if (tabIndex !== -1 && tabIndex !== currentTab) {
            switchTab(tabIndex);
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
                break;
            case 'ArrowRight':
            case 'ArrowDown':
                e.preventDefault();
                nextTab();
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
    // Hover pause logic removed: progress now continues regardless of mouse hover.
    // The pause/resume control remains available via the pause button.
    
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

        // Note: mouseenter/mouseleave listeners removed to keep autoplay running during hover
    }
    
    function removeEventListeners() {
        tabButtons.forEach(button => {
            button.removeEventListener('click', handleTabClick);
        });
        
        if (pauseButton) {
            pauseButton.removeEventListener('click', togglePause);
        }
        
        document.removeEventListener('keydown', handleKeyboard);
        // mouseenter/mouseleave listeners were never attached in the new behavior
    }
    
    // ==========================================
    // INITIALIZATION
    // ==========================================
    
    function init() {
        console.log('Hero Tabs: Initializing with overlay support...');
        console.log(`Total tabs: ${totalTabs}`);
        console.log(`Tab names: ${TAB_NAMES.join(', ')}`);
        console.log(`Auto-rotate interval: ${CONFIG.autoRotateInterval}ms`);
        
        // Verify images
        backgroundImages.forEach((img, i) => {
            console.log(`Image ${i}: ${img.src} - Tab: ${img.dataset.tab}`);
            
            // Add load event listeners
            if (img.complete) {
                console.log(`Image ${i} already loaded`);
                img.classList.add('loaded');
            } else {
                img.addEventListener('load', function() {
                    console.log(`Image ${i} loaded successfully`);
                    this.classList.add('loaded');
                });
                img.addEventListener('error', function() {
                    console.error(`Image ${i} failed to load:`, this.src);
                });
            }
        });
        
        // Set initial tab
        switchTab(0);
        
        // Attach event listeners
        attachEventListeners();
        
        // Start auto-rotation with progress
        startProgress();
        
        console.log('Hero Tabs: Initialized successfully');
        console.log('✅ Overlay preserved - z-index not modified');
    }
    
    function destroy() {
        stopProgress();
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