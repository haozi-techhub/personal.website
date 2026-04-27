/**
 * Xinjiang Gallery - International Standard
 * Cinematic Editorial Photography Exhibition
 */

const XinjiangGallery = {
    // State
    state: {
        currentIndex: 0,
        totalPhotos: 0,
        isAnimating: false,
        isInfoVisible: false,
        isUIVisible: true,
        isZoomed: false,
        uiTimeout: null,
        isFirstPhoto: true,
        wheelThrottle: false,
        touchStartY: 0,
        touchStartX: 0,
        preloadedImages: new Set()
    },

    // DOM Elements
    elements: {},

    // Photo metadata
    photoData: [],

    // Initialize
    init() {
        this.cacheElements();
        this.extractPhotoData();
        this.bindEvents();
        this.updateAll();
        this.startUITimer();
        this.preloadAdjacent(0);
        this.initImageLoading();
        this.initKeyboardHints();
    },

    // Cache DOM elements
    cacheElements() {
        this.elements = {
            gallery: document.querySelector('.xinjiang-gallery'),
            photos: document.querySelectorAll('.xg-photo'),
            photoInners: document.querySelectorAll('.xg-photo-inner'),
            backBtn: document.querySelector('.xg-back'),
            counter: document.querySelector('.xg-counter'),
            counterCurrent: document.querySelector('.xg-counter-current'),
            info: document.querySelector('.xg-info'),
            infoToggle: document.querySelector('.xg-info-toggle'),
            title: document.querySelector('.xg-title'),
            subtitle: document.querySelector('.xg-subtitle'),
            metadata: document.querySelector('.xg-metadata'),
            metaValues: document.querySelectorAll('.xg-meta-value[data-field]'),
            nav: document.querySelector('.xg-nav'),
            prevBtn: document.querySelector('.xg-prev'),
            nextBtn: document.querySelector('.xg-next'),
            progress: document.querySelector('.xg-progress'),
            progressFill: document.querySelector('.xg-progress-fill'),
            progressTrack: document.querySelector('.xg-progress-track'),
            progressSegments: document.querySelector('.xg-progress-segments'),
            scrollIndicator: document.querySelector('.xg-scroll-indicator'),
            touchZonePrev: document.querySelector('.xg-touch-zone--prev'),
            touchZoneNext: document.querySelector('.xg-touch-zone--next'),
            zoomOverlay: document.querySelector('.xg-zoom-overlay'),
            zoomImage: document.querySelector('.xg-zoom-image'),
            zoomClose: document.querySelector('.xg-zoom-close'),
            keyboardHints: document.querySelector('.xg-keyboard-hints')
        };

        this.state.totalPhotos = this.elements.photos.length;
    },

    // Extract photo metadata from data attributes
    extractPhotoData() {
        this.photoData = [];
        this.elements.photos.forEach((photo) => {
            this.photoData.push({
                title: photo.dataset.title || '',
                subtitle: photo.dataset.subtitle || '',
                location: photo.dataset.location || '',
                date: photo.dataset.date || '',
                camera: photo.dataset.camera || '',
                settings: photo.dataset.settings || ''
            });
        });
    },

    // Bind all events
    bindEvents() {
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Wheel navigation (throttled)
        document.addEventListener('wheel', (e) => this.handleWheel(e), { passive: true });

        // Touch events
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });

        // Mouse click navigation
        if (this.elements.touchZonePrev) {
            this.elements.touchZonePrev.addEventListener('click', () => this.prevPhoto());
        }
        if (this.elements.touchZoneNext) {
            this.elements.touchZoneNext.addEventListener('click', () => this.nextPhoto());
        }

        // Navigation buttons
        if (this.elements.prevBtn) {
            this.elements.prevBtn.addEventListener('click', () => this.prevPhoto());
        }
        if (this.elements.nextBtn) {
            this.elements.nextBtn.addEventListener('click', () => this.nextPhoto());
        }

        // Info toggle
        if (this.elements.infoToggle) {
            this.elements.infoToggle.addEventListener('click', () => this.toggleInfo());
        }

        // Progress track click
        if (this.elements.progressTrack) {
            this.elements.progressTrack.addEventListener('click', (e) => this.handleProgressClick(e));
        }

        // Progress segments click
        if (this.elements.progressSegments) {
            this.elements.progressSegments.addEventListener('click', (e) => {
                const segment = e.target.closest('.xg-progress-segment');
                if (segment) {
                    const index = Array.from(this.elements.progressSegments.children).indexOf(segment);
                    this.goToPhoto(index);
                }
            });
        }

        // Scroll indicator click
        if (this.elements.scrollIndicator) {
            this.elements.scrollIndicator.addEventListener('click', () => this.nextPhoto());
        }

        // Photo click for zoom
        this.elements.photoInners.forEach((inner, index) => {
            inner.addEventListener('click', (e) => {
                // Don't zoom if clicking navigation zones
                if (e.target.closest('.xg-touch-zone')) return;
                this.toggleZoom(index);
            });
        });

        // Zoom close
        if (this.elements.zoomClose) {
            this.elements.zoomClose.addEventListener('click', () => this.closeZoom());
        }
        if (this.elements.zoomOverlay) {
            this.elements.zoomOverlay.addEventListener('click', (e) => {
                if (e.target === this.elements.zoomOverlay) {
                    this.closeZoom();
                }
            });
        }

        // Show UI on any interaction
        document.addEventListener('mousemove', () => this.resetUITimer());
        document.addEventListener('scroll', () => this.handleScroll());
        document.addEventListener('click', () => this.resetUITimer());

        // Resize handler
        window.addEventListener('resize', () => this.handleResize());

        // Fullscreen change
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
    },

    // Initialize image loading detection
    initImageLoading() {
        this.elements.photos.forEach((photo, index) => {
            const img = photo.querySelector('img');
            if (!img) return;

            // Set loading state
            photo.classList.add('loading');

            if (img.complete && img.naturalHeight > 0) {
                photo.classList.remove('loading');
            } else {
                img.addEventListener('load', () => {
                    photo.classList.remove('loading');
                    // Check portrait
                    if (img.naturalHeight > img.naturalWidth) {
                        img.classList.add('portrait');
                    }
                });
                img.addEventListener('error', () => {
                    photo.classList.remove('loading');
                });
            }
        });
    },

    // Initialize keyboard hints
    initKeyboardHints() {
        // Show hints after a short delay
        setTimeout(() => {
            if (this.elements.keyboardHints) {
                this.elements.keyboardHints.classList.add('visible');
            }
        }, 1000);

        // Hide hints after 5 seconds
        setTimeout(() => {
            if (this.elements.keyboardHints) {
                this.elements.keyboardHints.classList.remove('visible');
            }
        }, 5000);
    },

    // Keyboard navigation
    handleKeyboard(e) {
        // Don't handle if zoomed or user is typing
        if (this.state.isZoomed) {
            if (e.key === 'Escape') {
                this.closeZoom();
            }
            return;
        }
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch (e.key) {
            case 'ArrowDown':
            case 'ArrowRight':
            case ' ':
            case 'PageDown':
                e.preventDefault();
                this.nextPhoto();
                break;
            case 'ArrowUp':
            case 'ArrowLeft':
            case 'PageUp':
                e.preventDefault();
                this.prevPhoto();
                break;
            case 'Home':
                e.preventDefault();
                this.goToPhoto(0);
                break;
            case 'End':
                e.preventDefault();
                this.goToPhoto(this.state.totalPhotos - 1);
                break;
            case 'i':
            case 'I':
                e.preventDefault();
                this.toggleInfo();
                break;
            case 'f':
            case 'F':
                e.preventDefault();
                this.toggleFullscreen();
                break;
            case 'Escape':
                if (this.state.isInfoVisible) {
                    this.hideInfo();
                }
                break;
        }
    },

    // Wheel navigation
    handleWheel(e) {
        if (this.state.isAnimating || this.state.isZoomed) return;

        // Throttle wheel events
        if (this.state.wheelThrottle) return;
        this.state.wheelThrottle = true;

        setTimeout(() => {
            this.state.wheelThrottle = false;
        }, 600);

        if (e.deltaY > 0) {
            this.nextPhoto();
        } else if (e.deltaY < 0) {
            this.prevPhoto();
        }
    },

    // Touch handlers
    handleTouchStart(e) {
        this.state.touchStartY = e.touches[0].clientY;
        this.state.touchStartX = e.touches[0].clientX;
    },

    handleTouchEnd(e) {
        if (this.state.isZoomed) return;

        const touchEndY = e.changedTouches[0].clientY;
        const touchEndX = e.changedTouches[0].clientX;
        const diffY = this.state.touchStartY - touchEndY;
        const diffX = this.state.touchStartX - touchEndX;

        // Only trigger if vertical swipe is dominant
        if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 50) {
            if (diffY > 0) {
                this.nextPhoto();
            } else {
                this.prevPhoto();
            }
        }
    },

    // Navigation functions
    nextPhoto() {
        if (this.state.currentIndex < this.state.totalPhotos - 1) {
            this.goToPhoto(this.state.currentIndex + 1, 'next');
        }
    },

    prevPhoto() {
        if (this.state.currentIndex > 0) {
            this.goToPhoto(this.state.currentIndex - 1, 'prev');
        }
    },

    goToPhoto(index, direction = 'next') {
        if (this.state.isAnimating || index === this.state.currentIndex) return;
        if (index < 0 || index >= this.state.totalPhotos) return;

        this.state.isAnimating = true;
        this.state.isFirstPhoto = false;

        // Hide scroll indicator after first photo
        if (this.elements.scrollIndicator) {
            this.elements.scrollIndicator.classList.add('hidden');
        }

        // Update active photo
        this.elements.photos.forEach((photo, i) => {
            photo.classList.remove('active');
            if (i === index) {
                photo.classList.add('active');
            }
        });

        const prevIndex = this.state.currentIndex;
        this.state.currentIndex = index;

        // Update UI elements
        this.updateCounter();
        this.updateProgress();
        this.updateNavButtons();
        this.updateProgressSegments();
        this.updateInfoPanel();
        this.animateInfoReveal();

        // Preload adjacent images
        this.preloadAdjacent(index);

        // Reset animation lock
        setTimeout(() => {
            this.state.isAnimating = false;
        }, 800);
    },

    // Update all UI elements
    updateAll() {
        this.updateCounter();
        this.updateProgress();
        this.updateNavButtons();
        this.updateProgressSegments();
        this.updateInfoPanel();
        this.showUI();
    },

    // Update info panel with current photo data
    updateInfoPanel() {
        const data = this.photoData[this.state.currentIndex];
        if (!data) return;

        if (this.elements.title) {
            this.elements.title.textContent = data.title;
        }
        if (this.elements.subtitle) {
            this.elements.subtitle.textContent = data.subtitle;
        }

        // Update metadata fields
        this.elements.metaValues.forEach(el => {
            const field = el.dataset.field;
            if (field && data[field]) {
                el.textContent = data[field];
            }
        });
    },

    // Counter animation
    updateCounter() {
        const current = this.state.currentIndex + 1;
        const total = this.state.totalPhotos;
        const counterEl = this.elements.counterCurrent;

        if (!counterEl) return;

        // Animate out
        counterEl.classList.add('updating');

        setTimeout(() => {
            counterEl.textContent = current.toString().padStart(2, '0');
            counterEl.classList.remove('updating');
            counterEl.classList.add('enter');

            setTimeout(() => {
                counterEl.classList.remove('enter');
            }, 50);
        }, 150);
    },

    // Update progress bar
    updateProgress() {
        const progress = ((this.state.currentIndex + 1) / this.state.totalPhotos) * 100;

        if (this.elements.progressFill) {
            this.elements.progressFill.style.width = `${progress}%`;
        }

        if (this.elements.progress) {
            this.elements.progress.setAttribute('aria-valuenow', this.state.currentIndex + 1);
        }
    },

    // Update nav buttons state
    updateNavButtons() {
        if (this.elements.prevBtn) {
            this.elements.prevBtn.disabled = this.state.currentIndex === 0;
        }
        if (this.elements.nextBtn) {
            this.elements.nextBtn.disabled = this.state.currentIndex === this.state.totalPhotos - 1;
        }
    },

    // Update progress segments
    updateProgressSegments() {
        const segments = this.elements.progressSegments?.querySelectorAll('.xg-progress-segment');
        if (!segments) return;

        segments.forEach((segment, i) => {
            segment.classList.remove('active', 'viewed');
            if (i === this.state.currentIndex) {
                segment.classList.add('active');
            } else if (i < this.state.currentIndex) {
                segment.classList.add('viewed');
            }
        });
    },

    // Info panel functions
    toggleInfo() {
        if (this.state.isInfoVisible) {
            this.hideInfo();
        } else {
            this.showInfo();
        }
    },

    showInfo() {
        this.state.isInfoVisible = true;
        if (this.elements.info) {
            this.elements.info.classList.add('visible');
        }
        if (this.elements.infoToggle) {
            this.elements.infoToggle.classList.add('hidden');
        }
    },

    hideInfo() {
        this.state.isInfoVisible = false;
        if (this.elements.info) {
            this.elements.info.classList.remove('visible');
        }
        if (this.elements.infoToggle) {
            this.elements.infoToggle.classList.remove('hidden');
        }
    },

    // Animate info reveal on photo change
    animateInfoReveal() {
        if (this.elements.info) {
            const title = this.elements.title;
            const subtitle = this.elements.subtitle;
            const metadata = this.elements.metadata;

            // Reset animations
            [title, subtitle, metadata].forEach(el => {
                if (el) {
                    el.style.transition = 'none';
                    el.style.opacity = '0';
                    el.style.transform = 'translateY(20px)';
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            el.style.transition = '';
                            el.style.opacity = '';
                            el.style.transform = '';
                        });
                    });
                }
            });
        }
    },

    // Preload adjacent images
    preloadAdjacent(index) {
        const toPreload = [index - 1, index + 1].filter(i =>
            i >= 0 && i < this.state.totalPhotos && !this.state.preloadedImages.has(i)
        );

        toPreload.forEach(i => {
            const photo = this.elements.photos[i];
            if (!photo) return;

            const img = photo.querySelector('img');
            if (!img) return;

            const src = img.dataset.src || img.src;

            // Create new image for preloading
            const preloadImg = new Image();
            preloadImg.onload = () => {
                this.state.preloadedImages.add(i);
                // Update the actual img if it hasn't loaded yet
                if (!img.complete) {
                    img.src = src;
                }
            };
            preloadImg.onerror = () => {
                // Silent fail for preloading
            };
            preloadImg.src = src;
        });
    },

    // Zoom functionality
    toggleZoom(index) {
        if (this.state.isZoomed) {
            this.closeZoom();
        } else {
            this.openZoom(index);
        }
    },

    openZoom(index) {
        const photo = this.elements.photos[index];
        if (!photo) return;

        const img = photo.querySelector('img');
        if (!img) return;

        this.state.isZoomed = true;

        // Hide keyboard hints when zoomed
        if (this.elements.keyboardHints) {
            this.elements.keyboardHints.classList.remove('visible');
        }

        // Set zoom image src
        if (this.elements.zoomImage) {
            this.elements.zoomImage.src = img.src;
            this.elements.zoomImage.alt = img.alt;
        }

        // Show overlay
        if (this.elements.zoomOverlay) {
            this.elements.zoomOverlay.classList.add('active');
        }

        // Mark photo inner as zoomed
        const inner = photo.querySelector('.xg-photo-inner');
        if (inner) {
            inner.classList.add('zoomed');
        }

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    },

    closeZoom() {
        this.state.isZoomed = false;

        // Hide overlay
        if (this.elements.zoomOverlay) {
            this.elements.zoomOverlay.classList.remove('active');
        }

        // Remove zoomed class from all inners
        this.elements.photoInners.forEach(inner => {
            inner.classList.remove('zoomed');
        });

        // Restore body scroll
        document.body.style.overflow = '';
    },

    // Progress bar click handler
    handleProgressClick(e) {
        const rect = this.elements.progressTrack.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        const targetIndex = Math.floor(percentage * this.state.totalPhotos);

        this.goToPhoto(Math.min(Math.max(targetIndex, 0), this.state.totalPhotos - 1));
    },

    // UI visibility management
    showUI() {
        this.state.isUIVisible = true;
        document.body.classList.remove('xg-ui-hidden');

        if (this.elements.backBtn) this.elements.backBtn.style.opacity = '';
        if (this.elements.counter) this.elements.counter.style.opacity = '';
        if (this.elements.nav) this.elements.nav.classList.add('visible');
        if (this.elements.progress) this.elements.progress.classList.add('visible');
        if (this.elements.keyboardHints) this.elements.keyboardHints.classList.add('visible');
    },

    hideUI() {
        // Don't hide UI when zoomed
        if (this.state.isZoomed) return;

        this.state.isUIVisible = false;

        if (this.elements.backBtn) this.elements.backBtn.style.opacity = '0';
        if (this.elements.counter) this.elements.counter.style.opacity = '0';
        if (this.elements.nav) this.elements.nav.classList.remove('visible');
        if (this.elements.progress) this.elements.progress.classList.remove('visible');
        if (this.elements.keyboardHints) this.elements.keyboardHints.classList.remove('visible');
    },

    resetUITimer() {
        if (!this.state.isUIVisible && !this.state.isZoomed) {
            this.showUI();
        }

        if (this.state.uiTimeout) {
            clearTimeout(this.state.uiTimeout);
        }

        this.startUITimer();
    },

    startUITimer() {
        if (this.state.uiTimeout) {
            clearTimeout(this.state.uiTimeout);
        }

        this.state.uiTimeout = setTimeout(() => {
            if (!this.state.isInfoVisible && !this.state.isAnimating && !this.state.isZoomed) {
                this.hideUI();
            }
        }, 3000);
    },

    // Handle scroll (for scroll indicator)
    handleScroll() {
        if (!this.state.isFirstPhoto && this.elements.scrollIndicator) {
            this.elements.scrollIndicator.classList.add('hidden');
        }
    },

    // Fullscreen toggle
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                // Silent fail
            });
        } else {
            document.exitFullscreen();
        }
    },

    handleFullscreenChange() {
        // Can be used to adjust UI for fullscreen
    },

    // Resize handler
    handleResize() {
        // Re-check image orientations
        this.elements.photos.forEach(photo => {
            const img = photo.querySelector('img');
            if (img && img.complete && img.naturalHeight > 0) {
                if (img.naturalHeight > img.naturalWidth) {
                    img.classList.add('portrait');
                } else {
                    img.classList.remove('portrait');
                }
            }
        });
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    XinjiangGallery.init();
});
