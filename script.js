// Ensure background video plays
const bgVideo = document.getElementById('bg-video');
if (bgVideo) {
    bgVideo.play().catch(e => {
        console.log('Video autoplay prevented, attempting to play:', e);
        // Try to play on user interaction
        document.addEventListener('click', () => {
            bgVideo.play().catch(err => console.log('Video play failed:', err));
        }, { once: true });
    });
}

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 70;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.style.backgroundColor = 'rgba(10, 10, 10, 0.95)';
        } else {
            navbar.style.backgroundColor = 'rgba(10, 10, 10, 0.8)';
        }
    }
});

// Auto-play videos in portfolio grid on hover
document.querySelectorAll('.portfolio-video video').forEach(video => {
    const portfolioItem = video.closest('.portfolio-item');
    
    portfolioItem.addEventListener('mouseenter', () => {
        video.play().catch(e => console.log('Video play failed:', e));
    });
    
    portfolioItem.addEventListener('mouseleave', () => {
        video.pause();
        video.currentTime = 0;
    });
});

// Form submission handler
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = contactForm.querySelector('input[type="text"]').value;
        const email = contactForm.querySelector('input[type="email"]').value;
        const message = contactForm.querySelector('textarea').value;
        
        // Here you would typically send the data to a server
        alert(`Thank you for your message, ${name}! I'll get back to you at ${email} soon.`);
        
        // Reset form
        contactForm.reset();
    });
}

// Fade in animation on scroll for portfolio items
const portfolioItems = document.querySelectorAll('.portfolio-item');

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 100);
            fadeObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

portfolioItems.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    fadeObserver.observe(item);
});

// Set active nav link based on current page
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-link').forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref === currentPage || (currentPage === '' && linkHref === 'index.html')) {
        link.classList.add('active');
    } else {
        link.classList.remove('active');
    }
});

// Fullscreen Image Viewer
let currentProjectIndex = 0;
let projectsData = []; // Array of {images: [], title: '', description: ''}
let allProjects = []; // All projects/companies for navigation

function initImageViewer() {
    const imageViewer = document.getElementById('imageViewer');
    const viewerContent = document.querySelector('.image-viewer-content');
    const closeViewer = document.getElementById('closeViewer');
    const prevImage = document.getElementById('prevImage');
    const nextImage = document.getElementById('nextImage');

    if (!imageViewer || !viewerContent) return;

    // Use event delegation to fix the click bug
    const portfolioGrid = document.querySelector('.portfolio-grid');
    if (!portfolioGrid) return;

    // Collect all projects/companies
    collectAllProjects();

    // Event delegation for clicks (fixes the bug)
    portfolioGrid.addEventListener('click', (e) => {
        const portfolioItem = e.target.closest('.portfolio-item');
        if (!portfolioItem) return;
        
        const img = portfolioItem.querySelector('.portfolio-image img');
        if (!img || img.closest('.portfolio-video-link')) return;
        
        e.stopPropagation();
        e.preventDefault();
        
        // Re-collect projects in case content changed
        collectAllProjects();
        
        // Find which project this belongs to
        const projectIndex = findProjectIndex(portfolioItem);
        if (projectIndex !== -1) {
            currentProjectIndex = projectIndex;
            openImageViewer();
        }
    });

    // Set cursor style on images
    portfolioGrid.querySelectorAll('.portfolio-item .portfolio-image img').forEach(img => {
        if (!img.closest('.portfolio-video-link')) {
            img.style.cursor = 'pointer';
        }
    });

    function collectAllProjects() {
        allProjects = [];
        const isMarketingPage = document.querySelector('.portfolio-item[data-company-id]') !== null;
        
        if (isMarketingPage) {
            // Marketing page: group by company
            const portfolioItems = document.querySelectorAll('.portfolio-item[data-company-id]');
            const companyMap = new Map();
            
            portfolioItems.forEach((item) => {
                const companyId = item.getAttribute('data-company-id');
                if (!companyMap.has(companyId)) {
                    const title = item.getAttribute('data-title') || '';
                    const description = item.getAttribute('data-description') || '';
                    const allImages = JSON.parse(item.getAttribute('data-all-images') || '[]');
                    companyMap.set(companyId, {
                        images: allImages,
                        title: title,
                        description: description
                    });
                }
            });
            
            allProjects = Array.from(companyMap.values());
        } else {
            // UX/Branding pages: group by data-title or h3 text
            const portfolioItems = document.querySelectorAll('.portfolio-item');
            const projectMap = new Map();
            
            portfolioItems.forEach((item) => {
                const img = item.querySelector('.portfolio-image img');
                if (!img || img.closest('.portfolio-video-link')) return;
                
                const title = item.getAttribute('data-title') || item.querySelector('.portfolio-overlay h3')?.textContent || '';
                const description = item.getAttribute('data-description') || item.querySelector('.portfolio-overlay p')?.textContent || '';
                
                // Check if item has data-all-images (grouped projects)
                const allImagesAttr = item.getAttribute('data-all-images');
                
                if (allImagesAttr) {
                    // Use the stored images array
                    const allImages = JSON.parse(allImagesAttr);
                    const key = title || `project-${projectMap.size}`;
                    
                    if (!projectMap.has(key)) {
                        projectMap.set(key, {
                            images: allImages,
                            title: title || 'Untitled Project',
                            description: description
                        });
                    }
                } else {
                    // Fallback: group by title
                    const key = title || `project-${projectMap.size}`;
                    
                    if (!projectMap.has(key)) {
                        projectMap.set(key, {
                            images: [],
                            title: title || 'Untitled Project',
                            description: description
                        });
                    }
                    
                    projectMap.get(key).images.push(img.src);
                }
            });
            
            allProjects = Array.from(projectMap.values());
        }
    }

    function findProjectIndex(portfolioItem) {
        const isMarketingPage = document.querySelector('.portfolio-item[data-company-id]') !== null;
        
        if (isMarketingPage) {
            const companyId = portfolioItem.getAttribute('data-company-id');
            const portfolioItems = document.querySelectorAll('.portfolio-item[data-company-id]');
            let foundIndex = -1;
            const seenIds = new Set();
            
            portfolioItems.forEach((item, idx) => {
                const id = item.getAttribute('data-company-id');
                if (!seenIds.has(id)) {
                    seenIds.add(id);
                    if (id === companyId && foundIndex === -1) {
                        foundIndex = seenIds.size - 1;
                    }
                }
            });
            
            return foundIndex;
        } else {
            const title = portfolioItem.getAttribute('data-title') || portfolioItem.querySelector('.portfolio-overlay h3')?.textContent || '';
            return allProjects.findIndex(p => p.title === title);
        }
    }

    function openImageViewer() {
        if (allProjects.length === 0 || currentProjectIndex < 0 || currentProjectIndex >= allProjects.length) return;
        
        const currentProject = allProjects[currentProjectIndex];
        projectsData = [currentProject];
        
        // Clear and rebuild content
        viewerContent.innerHTML = '';
        
        // Create scrollable container
        const scrollContainer = document.createElement('div');
        scrollContainer.className = 'image-viewer-scroll';
        
        // Add all images
        currentProject.images.forEach((imgSrc, idx) => {
            const imgWrapper = document.createElement('div');
            imgWrapper.className = 'image-viewer-img-wrapper';
            
            const img = document.createElement('img');
            img.src = imgSrc;
            img.alt = currentProject.title;
            imgWrapper.appendChild(img);
            
            // Add title and description after first image
            if (idx === 0) {
                const infoDiv = document.createElement('div');
                infoDiv.className = 'image-viewer-info';
                infoDiv.innerHTML = `
                    <h2>${currentProject.title}</h2>
                    <p>${currentProject.description}</p>
                `;
                scrollContainer.appendChild(imgWrapper);
                scrollContainer.appendChild(infoDiv);
            } else {
                scrollContainer.appendChild(imgWrapper);
            }
        });
        
        viewerContent.appendChild(scrollContainer);
        imageViewer.classList.add('active');
        document.body.style.overflow = 'hidden';
        updateNavButtons();
    }

    function closeImageViewer() {
        imageViewer.classList.remove('active');
        document.body.style.overflow = '';
        currentProjectIndex = 0;
        projectsData = [];
    }

    function showNextProject() {
        if (currentProjectIndex < allProjects.length - 1) {
            currentProjectIndex++;
            openImageViewer();
        }
    }

    function showPrevProject() {
        if (currentProjectIndex > 0) {
            currentProjectIndex--;
            openImageViewer();
        }
    }

    function updateNavButtons() {
        if (prevImage) prevImage.disabled = currentProjectIndex === 0;
        if (nextImage) nextImage.disabled = currentProjectIndex === allProjects.length - 1;
    }

    // Event listeners
    closeViewer?.addEventListener('click', closeImageViewer);
    prevImage?.addEventListener('click', showPrevProject);
    nextImage?.addEventListener('click', showNextProject);

    // Close on background click
    imageViewer.addEventListener('click', (e) => {
        if (e.target === imageViewer) {
            closeImageViewer();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!imageViewer.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeImageViewer();
        } else if (e.key === 'ArrowLeft') {
            showPrevProject();
        } else if (e.key === 'ArrowRight') {
            showNextProject();
        }
    });
}

// Initialize image viewer when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initImageViewer);
} else {
    initImageViewer();
}


/* =========================================
   LANDING PAGE: HERO WORD ROTATION
   (Safe, isolated, index-only)
   ========================================= */

(function () {
    const rotatingText = document.getElementById('rotatingText');
    const blockReveal = rotatingText?.closest('.block-reveal');

    // Exit if not on landing page
    if (!rotatingText || !blockReveal) return;

    const words = [
        'ui/ux',
        'brands',
        'campaigns',
        'motion',
        'imagevideos',
        'ai images',
        'ai videos',
        'ai projects',
        'logos',
        'print',
        'out of home'
    ];

    let index = 0;

    function rotateWord() {
        blockReveal.classList.remove('block-reveal--active');

        // Force reflow so CSS animation restarts
        void blockReveal.offsetWidth;

        rotatingText.textContent = words[index];
        blockReveal.classList.add('block-reveal--active');

        index = (index + 1) % words.length;
    }

    // Initial render
    rotateWord();

    // Rotate every 2.2s
    setInterval(rotateWord, 2200);
})();

