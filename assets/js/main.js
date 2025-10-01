/*=============== FILTERS TABS ===============*/
const tabs = document.querySelectorAll('[data-target]'),
      tabContents = document.querySelectorAll('[data-content]')

tabs.forEach(tab =>{
    tab.addEventListener('click', () =>{
        const target = document.querySelector(tab.dataset.target)

        tabContents.forEach(tc =>{
            tc.classList.remove('filters__active')
        })
        target.classList.add('filters__active')

        tabs.forEach(t =>{
            t.classList.remove('filter-tab-active')
        })
        tab.classList.add('filter-tab-active')
    })
})

/*=============== DARK LIGHT THEME ===============*/
const themeButton = document.getElementById('theme-button')
const darkTheme = 'dark-theme'
const iconTheme = 'ri-sun-line'

// Previously selected topic (if user selected)
const selectedTheme = localStorage.getItem('selected-theme')
const selectedIcon = localStorage.getItem('selected-icon')

// We obtain the current theme that the interface has by validating the dark-theme class
const getCurrentTheme = () => document.body.classList.contains(darkTheme) ? 'dark' : 'light'
const getCurrentIcon = () => themeButton.classList.contains(iconTheme) ? 'ri-moon-line' : 'ri-sun-line'

// Initialize theme based on saved preference or default to dark
const initializeTheme = () => {
    const theme = selectedTheme || 'dark';
    const isDark = theme === 'dark';
    
    // Apply theme to body
    document.body.classList[isDark ? 'add' : 'remove'](darkTheme);
    
    // Set theme button icon
    if (selectedIcon) {
        themeButton.classList[selectedIcon === 'ri-moon-line' ? 'add' : 'remove'](iconTheme);
    } else {
        themeButton.classList[isDark ? 'add' : 'remove'](iconTheme);
    }
    
    // Clean up inline styles if light theme
    if (!isDark) {
        document.documentElement.style.backgroundColor = '';
        document.documentElement.style.color = '';
        document.body.style.backgroundColor = '';
        document.body.style.color = '';
    }
}

// Initialize theme when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTheme);
} else {
    initializeTheme();
}

// Activate / deactivate the theme manually with the button
themeButton.addEventListener('click', () => {
    // Add or remove the dark / icon theme
    document.body.classList.toggle(darkTheme)
    themeButton.classList.toggle(iconTheme)
    // We save the theme and the current icon that the user chose
    localStorage.setItem('selected-theme', getCurrentTheme())
    localStorage.setItem('selected-icon', getCurrentIcon())
})

/*=============== LOADING OVERLAY FADE OUT ===============*/
const fadeOutOverlay = () => {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.add('fade-out');
        // Remove overlay from DOM after transition completes
        setTimeout(() => {
            overlay.remove();
        }, 800);
    }
};

// Initialize everything when ready
const initializePage = () => {
    adjustImageContainers();
    setTimeout(fadeOutOverlay, 400);
};

// Better page initialization with multiple fallbacks
const ensurePageInitialized = () => {
    if (document.readyState === 'complete') {
        initializePage();
    } else if (document.readyState === 'interactive') {
        // DOM ready but resources still loading
        setTimeout(initializePage, 100);
    } else {
        window.addEventListener('load', initializePage);
        // Fallback in case load event doesn't fire
        setTimeout(initializePage, 3000);
    }
};

ensurePageInitialized();

/*=============== SCROLL REVEAL ANIMATION ===============*/
// Wait for ScrollReveal to be available
const initScrollReveal = () => {
    if (typeof ScrollReveal === 'undefined') {
        setTimeout(initScrollReveal, 100);
        return;
    }
    
    const sr = ScrollReveal({
        origin: 'top',
        distance: '60px',
        duration: 2500,
        delay: 400,
        reset: false
    })

    sr.reveal(`.profile__border`)
    sr.reveal(`.profile__name`, {delay: 500})
    sr.reveal(`.profile__profession`, {delay: 600})
    sr.reveal(`.profile__social`, {delay: 700})
    sr.reveal(`.profile__info-group`, {interval: 100, delay: 700})
    sr.reveal(`.profile__buttons`, {delay: 800})
    sr.reveal(`.filters__content`, {delay: 900})
    sr.reveal(`.filters`, {delay: 1000})
}

// Initialize ScrollReveal when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollReveal);
} else {
    initScrollReveal();
}

// Show projects immediately when page loads, not on scroll
const showProjectsOnLoad = () => {
    const projectCards = document.querySelectorAll('.projects__card');
    if (projectCards.length === 0) {
        // Retry if cards not found yet
        setTimeout(showProjectsOnLoad, 100);
        return;
    }
    
    projectCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 1200 + (index * 100));
    });
};

// Initialize projects to be hidden initially - with better timing
const initProjectCards = () => {
    const projectCards = document.querySelectorAll('.projects__card');
    if (projectCards.length === 0) {
        // Retry if cards not found yet
        setTimeout(initProjectCards, 100);
        return;
    }
    
    projectCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(60px)';
        card.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    });
};

// Better initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProjectCards);
} else {
    initProjectCards();
}

// Dynamic image container sizing with better error handling
const adjustImageContainers = () => {
    const images = document.querySelectorAll('.projects__img');
    const containers = document.querySelectorAll('.projects__image-container');
    
    if (images.length === 0) {
        // Retry if images not found yet
        setTimeout(adjustImageContainers, 200);
        return;
    }
    
    let maxAspectRatio = 0;
    let imagesLoaded = 0;
    const timeoutId = setTimeout(() => {
        // Fallback if images take too long to load
        console.warn('Images taking too long to load, proceeding anyway');
        showProjectsOnLoad();
    }, 5000);
    
    const checkAllImagesLoaded = () => {
        imagesLoaded++;
        if (imagesLoaded === images.length) {
            clearTimeout(timeoutId);
            // Calculate optimal height based on the widest aspect ratio
            images.forEach(img => {
                const aspectRatio = img.naturalWidth / img.naturalHeight;
                if (aspectRatio > maxAspectRatio) {
                    maxAspectRatio = aspectRatio;
                }
            });
            
            // Set container height based on container width and the max aspect ratio
            const containerWidth = containers[0]?.offsetWidth || 320;
            const optimalHeight = Math.max(280, containerWidth / maxAspectRatio);
            
            containers.forEach(container => {
                container.style.height = `${Math.min(optimalHeight, 400)}px`;
            });
            
            // Show projects after sizing is complete
            showProjectsOnLoad();
        }
    };
    
    images.forEach(img => {
        if (img.complete && img.naturalHeight !== 0) {
            checkAllImagesLoaded();
        } else {
            img.onload = checkAllImagesLoaded;
            img.onerror = () => {
                console.warn('Image failed to load:', img.src);
                checkAllImagesLoaded(); // Continue even if image fails
            };
        }
    });
};

