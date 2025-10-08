/**
 * Simple sliding hero carousel + visual timer bar
 * - Usa translateX sobre #carouselTrack
 * - Actualiza .carousel__slide--active para estado visual
 * - Rellena .pager__progress-fill de la slide activa y avanza al completar
 */

(function() {
    'use strict';

    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');

    if (!track || !prevBtn || !nextBtn) {
        console.warn('Carousel elements not found');
        return;
    }

    const slides = Array.from(track.querySelectorAll('.carousel__slide'));
    const playableSlides = slides.filter(s => !s.classList.contains('carousel__slide--ghost'));
    const total = playableSlides.length;

    let current = playableSlides.findIndex(s => s.classList.contains('carousel__slide--active'));
    if (current < 0) current = 0;

    // progress timing
    const duration = 4500; // ms
    let raf = null;
    let startTs = null;
    let paused = false;

    function updateTrack() {
        // translate percentage depending on index relative to track children order
        const indexInAll = slides.indexOf(playableSlides[current]);
        const offset = -indexInAll * 100;
        track.style.transform = `translateX(${offset}%)`;

        // update active class for slides
        slides.forEach((s, i) => {
            if (i === indexInAll) s.classList.add('carousel__slide--active');
            else s.classList.remove('carousel__slide--active');
        });

        // update button disabled states
        prevBtn.disabled = current === 0;
        nextBtn.disabled = current === total - 1;
    }

    function resetAllFills() {
        slides.forEach(s => {
            const fill = s.querySelector('.pager__progress-fill');
            if (fill) fill.style.width = '0%';
        });
    }

    function progressStep(ts) {
        if (paused) return;
        if (!startTs) startTs = ts;
        const elapsed = ts - startTs;
        const pct = Math.min(1, elapsed / duration);

        // update active slide fill
        const active = playableSlides[current];
        if (active) {
            const fill = active.querySelector('.pager__progress-fill');
            if (fill) fill.style.width = `${pct * 100}%`;
        }

        if (pct >= 1) {
            goNext();
            return;
        }

        raf = requestAnimationFrame(progressStep);
    }

    function startProgress() {
        stopProgress();
        startTs = null;
        paused = false;
        raf = requestAnimationFrame(progressStep);
    }

    function stopProgress() {
        if (raf) cancelAnimationFrame(raf);
        raf = null;
        startTs = null;
    }

    function resetProgress() {
        stopProgress();
        resetAllFills();
        // slight delay to allow DOM paint
        setTimeout(startProgress, 60);
    }

    function goNext() {
        current = (current + 1) % total;
        updateTrack();
        resetProgress();
    }

    function goPrev() {
        current = (current - 1 + total) % total;
        updateTrack();
        resetProgress();
    }

    // handlers
    prevBtn.addEventListener('click', function(e) {
        e.preventDefault();
        stopProgress();
        goPrev();
    });
    nextBtn.addEventListener('click', function(e) {
        e.preventDefault();
        stopProgress();
        goNext();
    });

    // keyboard
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') { stopProgress(); goPrev(); }
        if (e.key === 'ArrowRight') { stopProgress(); goNext(); }
    });

    // touch basic swipe
    let sx = 0;
    track.addEventListener('touchstart', (e) => { sx = e.changedTouches[0].screenX; stopProgress(); }, { passive: true });
    track.addEventListener('touchend', (e) => {
        const ex = e.changedTouches[0].screenX;
        const diff = sx - ex;
        if (Math.abs(diff) > 40) {
            if (diff > 0) goNext(); else goPrev();
        }
        resetProgress();
    }, { passive: true });

    // pause on hover
    track.addEventListener('mouseenter', () => { paused = true; stopProgress(); });
    track.addEventListener('mouseleave', () => { paused = false; resetProgress(); });

    // initialize
    updateTrack();
    resetAllFills();
    startProgress();

    // expose api (opcional)
    window.heroCarousel = { next: goNext, prev: goPrev, goTo: idx => { current = Math.max(0, Math.min(total - 1, idx)); updateTrack(); resetProgress(); } };

})();