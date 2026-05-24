(function () {
    const header = document.querySelector('header');
    const toggleBtn = document.querySelector('.nav-toggle');
    let hideTimer = null;

    function showNav() {
        header.classList.add('nav-visible');
        clearTimeout(hideTimer);
        
        // Pause autohide while the mobile navigation is open
        if (header.classList.contains('nav-active')) return;
        
        hideTimer = setTimeout(function () {
            header.classList.remove('nav-visible');
        }, 2500);
    }

    // Toggle Mobile Navigation
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            const isOpen = header.classList.toggle('nav-active');
            toggleBtn.setAttribute('aria-expanded', isOpen);
            
            if (isOpen) {
                header.classList.add('nav-visible');
                clearTimeout(hideTimer);
            } else {
                showNav();
            }
        });
    }

    // Close menu on link click
    document.querySelectorAll('nav a').forEach(function (link) {
        link.addEventListener('click', function () {
            if (header.classList.contains('nav-active')) {
                header.classList.remove('nav-active');
                if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
                showNav();
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
        if (header.classList.contains('nav-active') && !header.contains(e.target)) {
            header.classList.remove('nav-active');
            if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
            showNav();
        }
    });

    document.addEventListener('mousemove', showNav);
    document.addEventListener('scroll', showNav, { passive: true });
    document.addEventListener('touchstart', showNav, { passive: true });
})();


/* ==========================================================================
   SMOOTH SCROLL — honour native anchor links
   ========================================================================== */
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});


/* ==========================================================================
   SCROLL-IN ANIMATION — sections fade + slide up on enter
   ========================================================================== */
(function () {
    const sections = document.querySelectorAll('section');

    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(function (section) {
        section.classList.add('will-animate');
        observer.observe(section);
    });
})();


/* ==========================================================================
   PROJECTS — Gracefully fetch projects from the backend database server
   ========================================================================== */
// Gracefully fetch projects from the backend database server
fetch("http://localhost:5000/projects")
    .then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then((data) => {
        const projectList = document.getElementById("project-list");
        
        // If data is returned successfully and is not empty, clear the static fallbacks
        if (data && data.length > 0) {
            projectList.innerHTML = ''; // Clear fallback projects
            
            data.forEach((project) => {
                const div = document.createElement("div");
                div.classList.add("project-card");
                
                // Parse technologies into tags
                let techHTML = '';
                if (project.technologies) {
                    const techList = project.technologies.split(/[,•|]+/).map(t => t.trim());
                    techHTML = techList.map(tech => `<span class="project-tech">${tech}</span>`).join('');
                }
                
                div.innerHTML = `
                    <div class="project-content-wrap">
                        <div class="project-header">
                            <span class="project-category">Project API</span>
                            <a href="https://github.com/govathotijoshna" target="_blank" class="project-link-icon" aria-label="View Project Source">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                            </a>
                        </div>
                        <h3>${project.title}</h3>
                        <p>${project.description}</p>
                    </div>
                    <div class="project-tech-list">
                        ${techHTML}
                    </div>
                `;
                
                projectList.appendChild(div);
            });
            console.log("Successfully loaded dynamic projects from MongoDB API.");
        }
    })
    .catch((error) => {
        // Quietly fail and keep the static local fallbacks visible
        console.warn("Backend API offline. Displaying pre-rendered portfolio projects instead.", error);
    });