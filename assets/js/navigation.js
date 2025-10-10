/**
 * ========================================
 * NAVIGATION SCRIPT - ENHANCED VERSION
 * ========================================
 * 
 * Features:
 * - Mobile menu toggle with overlay
 * - Header scroll animation (transparent to solid)
 * - Smooth scrolling for anchor links
 * - Active nav link on scroll
 * - Close menu on outside click
 * - Enhanced accessibility
 * - Focus trap in mobile menu
 * 
 * @version 3.0.0
 */

(function() {
    'use strict';
    
    // ==========================================
    // DOM ELEMENTS
    // ==========================================
    
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    const header = document.querySelector('.header');
    const body = document.body;
    
    // ==========================================
    // CREATE OVERLAY
    // ==========================================
    
    let overlay = document.querySelector('.nav-overlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'nav-overlay';
        body.appendChild(overlay);
    }
    
    // ==========================================
    // FOCUS TRAP
    // ==========================================
    
    let focusableElements = [];
    let firstFocusableElement = null;
    let lastFocusableElement = null;
    
    /**
     * Update focusable elements in nav
     */
    function updateFocusableElements() {
        if (!mainNav) return;
        
        focusableElements = Array.from(
            mainNav.querySelectorAll(
                'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
        );
        
        firstFocusableElement = focusableElements[0];
        lastFocusableElement = focusableElements[focusableElements.length - 1];
    }
    
    /**
     * Trap focus within mobile menu
     */
    function trapFocus(e) {
        if (!mainNav.classList.contains('active')) return;
        
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstFocusableElement) {
                    e.preventDefault();
                    lastFocusableElement.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastFocusableElement) {
                    e.preventDefault();
                    firstFocusableElement.focus();
                }
            }
        }
    }
    
    // ==========================================
    // MOBILE MENU TOGGLE
    // ==========================================
    
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMenu();
        });
        
        // Close menu when clicking overlay
        overlay.addEventListener('click', function() {
            closeMenu();
        });
        
        // Close menu when clicking nav links
        const navLinks = mainNav.querySelectorAll('.nav__link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                closeMenu();
            });
        });
        
        // Close menu with ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mainNav.classList.contains('active')) {
                closeMenu();
                menuToggle.focus();
            }
        });
        
        // Focus trap
        document.addEventListener('keydown', trapFocus);
    }
    
    /**
     * Toggle menu open/close
     */
    function toggleMenu() {
        const isActive = menuToggle.classList.contains('active');
        
        if (isActive) {
            closeMenu();
        } else {
            openMenu();
        }
    }
    
    /**
     * Open menu
     */
    function openMenu() {
        menuToggle.classList.add('active');
        menuToggle.setAttribute('aria-expanded', 'true');
        
        mainNav.classList.add('active');
        mainNav.setAttribute('aria-hidden', 'false');
        
        overlay.classList.add('active');
        body.style.overflow = 'hidden';
        
        // Update focusable elements and focus first link
        updateFocusableElements();
        setTimeout(() => {
            if (firstFocusableElement) {
                firstFocusableElement.focus();
            }
        }, 100);
    }
    
    /**
     * Close menu
     */
    function closeMenu() {
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        
        mainNav.classList.remove('active');
        mainNav.setAttribute('aria-hidden', 'true');
        
        overlay.classList.remove('active');
        body.style.overflow = '';
    }
    
    // ==========================================
    // HEADER SCROLL ANIMATION
    // ==========================================
    
    let lastScroll = 0;
    const scrollThreshold = 50;
    
    if (header) {
        window.addEventListener('scroll', handleHeaderScroll, { passive: true });
        
        // Check initial scroll position
        handleHeaderScroll();
    }
    
    /**
     * Handle header scroll animation
     */
    function handleHeaderScroll() {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add/remove scrolled class based on threshold
        if (currentScroll > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    }
    
    // ==========================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ==========================================
    
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if href is just "#"
            if (href === '#' || href === '') return;
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Close menu if open
                closeMenu();
                
                // Focus target for accessibility
                target.setAttribute('tabindex', '-1');
                target.focus();
                target.removeAttribute('tabindex');
            }
        });
    });
    
    // ==========================================
    // ACTIVE NAV LINK ON SCROLL
    // ==========================================
    
    const sections = document.querySelectorAll('section[id]');
    const navLinksAll = document.querySelectorAll('.nav__link');
    
    if (sections.length > 0 && navLinksAll.length > 0) {
        window.addEventListener('scroll', updateActiveNavLink, { passive: true });
        
        // Set initial active state
        updateActiveNavLink();
    }
    
    /**
     * Update active nav link based on scroll position
     */
    function updateActiveNavLink() {
        const scrollPosition = window.pageYOffset + 150;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinksAll.forEach(link => {
                    link.classList.remove('nav__link--active');
                    link.removeAttribute('aria-current');
                    
                    const linkHref = link.getAttribute('href');
                    if (linkHref === `#${sectionId}`) {
                        link.classList.add('nav__link--active');
                        link.setAttribute('aria-current', 'page');
                    }
                });
            }
        });
        
        // Handle when at top of page
        if (scrollPosition < 150) {
            navLinksAll.forEach(link => {
                if (link.getAttribute('href') === '#' || 
                    link.getAttribute('href') === '/' || 
                    link.getAttribute('href') === 'index.html') {
                    link.classList.add('nav__link--active');
                    link.setAttribute('aria-current', 'page');
                }
            });
        }
    }
    
    // ==========================================
    // IMAGE LAZY LOADING
    // ==========================================
    
    /**
     * Initialize lazy loading for images
     */
    function initLazyLoading() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                });
            });
            
            lazyImages.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for older browsers
            lazyImages.forEach(img => {
                img.src = img.dataset.src;
                img.classList.add('loaded');
                img.removeAttribute('data-src');
            });
        }
    }
    
    // ==========================================
    // PREVENT SCROLL RESTORATION ON PAGE LOAD
    // ==========================================
    
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    
    // ==========================================
    // INITIALIZATION
    // ==========================================
    
    function init() {
        console.log('Navigation: Initializing...');
        
        // Initialize lazy loading
        initLazyLoading();
        
        console.log('Navigation: Initialized successfully');
    }
    
    // ==========================================
    // PUBLIC API
    // ==========================================
    
    window.navigation = {
        openMenu: openMenu,
        closeMenu: closeMenu,
        toggleMenu: toggleMenu,
        isMenuOpen: () => mainNav.classList.contains('active')
    };
    
    // ==========================================
    // AUTO-INITIALIZE
    // ==========================================
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();