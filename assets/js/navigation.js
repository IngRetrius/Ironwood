/**
 * ========================================
 * NAVIGATION SCRIPT - UPDATED
 * ========================================
 * 
 * Features:
 * - Mobile menu toggle with overlay
 * - Header scroll animation (transparent to solid)
 * - Smooth scrolling for anchor links
 * - Active nav link on scroll
 * - Close menu on outside click
 * 
 * @version 2.0.0
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
            }
        });
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
        mainNav.classList.add('active');
        overlay.classList.add('active');
        body.style.overflow = 'hidden';
    }
    
    /**
     * Close menu
     */
    function closeMenu() {
        menuToggle.classList.remove('active');
        mainNav.classList.remove('active');
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
                    
                    const linkHref = link.getAttribute('href');
                    if (linkHref === `#${sectionId}`) {
                        link.classList.add('nav__link--active');
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
                }
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
    // PUBLIC API (OPTIONAL)
    // ==========================================
    
    window.navigation = {
        openMenu: openMenu,
        closeMenu: closeMenu,
        toggleMenu: toggleMenu
    };
    
    // ==========================================
    // INITIALIZE
    // ==========================================
    
    console.log('Navigation: Initialized successfully');
    
})();