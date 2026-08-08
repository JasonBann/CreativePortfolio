document.addEventListener('DOMContentLoaded', function() {
    
    // --- RETRO THEME SWITCHER & TEXTURE OVERLAY LOGIC ---
    if (!document.getElementById('retro-grain-overlay')) {
        const grainOverlay = document.createElement('div');
        grainOverlay.id = 'retro-grain-overlay';
        grainOverlay.className = 'retro-grain-overlay';
        grainOverlay.setAttribute('aria-hidden', 'true');
        document.body.appendChild(grainOverlay);
    }

    const themeSwitch = document.getElementById('checkbox');
    const themeSwitchMobile = document.getElementById('checkbox-mobile');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeToggleBtnMobile = document.getElementById('theme-toggle-btn-mobile');

    function updateThemeUI(isLight) {
        document.documentElement.setAttribute('data-theme', isLight ? 'light' : 'dark');
        if (themeSwitch) themeSwitch.checked = isLight;
        if (themeSwitchMobile) themeSwitchMobile.checked = isLight;

        const labelText = isLight ? '📜 ANALOG-PRINT' : '💻 RETRO-TECH';
        if (themeToggleBtn) {
            themeToggleBtn.innerHTML = `<span>${labelText}</span>`;
        }
        if (themeToggleBtnMobile) {
            themeToggleBtnMobile.innerHTML = `<span>${labelText}</span>`;
        }
    }

    function triggerCalibrationEffect(isLight) {
        let overlay = document.getElementById('theme-calibration-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'theme-calibration-overlay';
            overlay.className = 'theme-calibration-overlay';
            overlay.setAttribute('aria-hidden', 'true');
            document.body.appendChild(overlay);
        }

        const label = isLight ? '📜 [ RE-INDEXING ANALOG PAPER... ]' : '💻 [ CALIBRATING CRT SIGNAL... ]';
        overlay.innerHTML = `
            <div class="calibration-sweep-bar"></div>
            <div class="calibration-content">
                <span class="calibration-badge">${label}</span>
            </div>
        `;

        overlay.classList.remove('active');
        void overlay.offsetWidth; // Force reflow to restart animation
        overlay.classList.add('active');

        setTimeout(() => {
            overlay.classList.remove('active');
        }, 580);
    }

    function setTheme(isLight, userTriggered = false) {
        updateThemeUI(isLight);
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        if (userTriggered) {
            triggerCalibrationEffect(isLight);
        }
    }

    function toggleTheme() {
        const currentIsLight = document.documentElement.getAttribute('data-theme') === 'light';
        setTheme(!currentIsLight, true);
    }

    if (themeSwitch) themeSwitch.addEventListener('change', function() { setTheme(this.checked, true); });
    if (themeSwitchMobile) themeSwitchMobile.addEventListener('change', function() { setTheme(this.checked, true); });
    if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
    if (themeToggleBtnMobile) themeToggleBtnMobile.addEventListener('click', toggleTheme);

    // Set initial theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme === 'light');
    } else {
        const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
        setTheme(prefersLight);
    }

    // Mobile menu functionality
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            mobileMenuBtn.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        document.addEventListener('click', function(e) {
            if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                mobileMenuBtn.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    mobileMenuBtn.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            });
        });
    }

    // --- GALLERY PAGE (gallery.html) SCRIPTS ---
    const galleryModal = document.getElementById('gallery-modal');
    if (galleryModal) {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const modalContentContainer = document.getElementById('modal-content-container');
        const closeModalBtn = document.getElementById('modal-close-btn');
        const galleryItems = document.querySelectorAll('.gallery-item');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                const filter = button.getAttribute('data-tab');
                galleryItems.forEach(item => {
                    const category = item.getAttribute('data-category');
                    if (filter === 'all' || category === filter) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });

        function closeGalleryModal() {
            galleryModal.classList.remove('active');
            modalContentContainer.innerHTML = ''; // Stop video playback
        }

        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const type = item.getAttribute('data-type');
                const source = item.getAttribute('data-source');
                const titleEl = item.querySelector('.gallery-item-title');
                const descEl = item.querySelector('.gallery-item-desc');
                
                const title = titleEl ? titleEl.textContent : 'Gallery Artwork';
                const desc = descEl ? descEl.textContent : '';

                modalContentContainer.innerHTML = '';
                
                let mediaHtml = '';
                if (type === 'image') {
                    mediaHtml = `<img src="${source}" alt="${title}" class="max-h-[75vh] w-full mx-auto rounded-lg object-contain">`;
                } else if (type === 'video') {
                    mediaHtml = `<div class="modal-video-container"><iframe src="${source}?autoplay=1" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;
                }

                modalContentContainer.innerHTML = `
                    <div class="bg-surface rounded-xl border border-border-color p-4 shadow-2xl overflow-hidden max-w-4xl mx-auto text-left">
                        ${mediaHtml}
                        <div class="mt-4 px-2">
                            <h3 class="text-xl font-bold text-text-primary mb-1">${title}</h3>
                            <p class="text-sm text-text-secondary leading-relaxed">${desc}</p>
                        </div>
                    </div>
                `;
                
                galleryModal.classList.add('active');
            });
        });

        if (closeModalBtn) closeModalBtn.addEventListener('click', closeGalleryModal);
        galleryModal.addEventListener('click', (e) => {
            if (e.target === galleryModal) {
                closeGalleryModal();
            }
        });
    }

    // --- BLOG PAGE (blog.html) SCRIPTS ---
    const blogModal = document.getElementById('blog-modal');
    if (blogModal) {
        const closeModalBtn = document.getElementById('blog-modal-close-btn');
        const modalTitle = document.getElementById('modal-blog-title');
        const modalContent = document.getElementById('modal-blog-content');
        const blogCards = document.querySelectorAll('.blog-card');

        function openBlogModal(card) {
            const titleEl = card.querySelector('.blog-card-title a') || card.querySelector('.blog-card-title');
            const title = titleEl ? titleEl.innerText : 'Blog Post';
            const fullContentElement = card.querySelector('.blog-card-full-content');
            if (modalTitle) modalTitle.innerText = title;
            if (modalContent) modalContent.innerHTML = fullContentElement ? fullContentElement.innerHTML : '<p>Content coming soon...</p>';
            blogModal.classList.add('active');
        }

        function closeBlogModal() {
            blogModal.classList.remove('active');
        }

        blogCards.forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                openBlogModal(card);
            });
        });

        if (closeModalBtn) closeModalBtn.addEventListener('click', closeBlogModal);
        blogModal.addEventListener('click', (e) => {
            if (e.target === blogModal) {
                closeBlogModal();
            }
        });
    }

    // --- HOME PAGE (index.html) SCRIPTS ---

    // Dynamic Role Typing / Rotator Effect
    const roleTypingEl = document.getElementById('hero-role-typing');
    if (roleTypingEl) {
        const roles = [
            "Multimedia Designer",
            "Motion Graphics Artist",
            "Static & Print Specialist",
            "Visual Storyteller",
            "Video & Brand Creator"
        ];
        let roleIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingDelay = 100;

        function typeRole() {
            const currentRole = roles[roleIndex];
            if (isDeleting) {
                roleTypingEl.textContent = currentRole.substring(0, charIndex - 1);
                charIndex--;
                typingDelay = 40;
            } else {
                roleTypingEl.textContent = currentRole.substring(0, charIndex + 1);
                charIndex++;
                typingDelay = 90;
            }

            if (!isDeleting && charIndex === currentRole.length) {
                typingDelay = 2200; // Pause at end of phrase
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
                typingDelay = 400; // Pause before next phrase
            }

            setTimeout(typeRole, typingDelay);
        }
        
        setTimeout(typeRole, 600);
    }

    // --- RETRO INTERACTIVE MULTIMEDIA CANVAS BACKGROUND ---
    const heroCanvas = document.getElementById('hero-canvas');
    if (heroCanvas) {
        const ctx = heroCanvas.getContext('2d');
        let width = 0;
        let height = 0;

        let mouseX = -1000;
        let mouseY = -1000;
        let targetMouseX = -1000;
        let targetMouseY = -1000;

        function resizeCanvas() {
            const parent = heroCanvas.parentElement || document.body;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = parent.clientWidth;
            height = parent.clientHeight;
            heroCanvas.width = width * dpr;
            heroCanvas.height = height * dpr;
            ctx.scale(dpr, dpr);
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const heroSection = document.getElementById('hero');
        if (heroSection) {
            heroSection.addEventListener('mousemove', (e) => {
                const rect = heroCanvas.getBoundingClientRect();
                targetMouseX = e.clientX - rect.left;
                targetMouseY = e.clientY - rect.top;
            });

            heroSection.addEventListener('mouseleave', () => {
                targetMouseX = -1000;
                targetMouseY = -1000;
            });
            
            heroSection.addEventListener('touchmove', (e) => {
                if (e.touches.length > 0) {
                    const rect = heroCanvas.getBoundingClientRect();
                    targetMouseX = e.touches[0].clientX - rect.left;
                    targetMouseY = e.touches[0].clientY - rect.top;
                }
            }, { passive: true });
        }

        // Color Blobs for Ambient Atmosphere
        const blobs = [
            { x: 0.2, y: 0.3, radius: 280, colorDark: 'rgba(0, 240, 255, 0.18)', colorLight: 'rgba(34, 86, 153, 0.12)', vx: 0.0003, vy: 0.0004 },
            { x: 0.8, y: 0.2, radius: 320, colorDark: 'rgba(255, 0, 127, 0.18)', colorLight: 'rgba(216, 74, 56, 0.10)', vx: -0.0004, vy: 0.0003 },
            { x: 0.7, y: 0.8, radius: 300, colorDark: 'rgba(255, 183, 0, 0.15)', colorLight: 'rgba(226, 156, 41, 0.10)', vx: -0.0003, vy: -0.0004 },
            { x: 0.3, y: 0.7, radius: 260, colorDark: 'rgba(0, 255, 157, 0.15)', colorLight: 'rgba(130, 56, 88, 0.10)', vx: 0.0005, vy: -0.0002 }
        ];

        // Nodes (Keyframes, Bezier anchors, Crop marks)
        const nodeCount = 45;
        const nodes = [];
        const types = ['keyframe', 'anchor', 'control'];

        for (let i = 0; i < nodeCount; i++) {
            nodes.push({
                x: Math.random() * (width || 1000),
                y: Math.random() * (height || 800),
                vx: (Math.random() - 0.5) * 0.6,
                vy: (Math.random() - 0.5) * 0.6,
                size: Math.random() * 3 + 2,
                type: types[i % types.length],
                colorDark: ['#00f0ff', '#ff007f', '#ffb700', '#00ff9d'][i % 4],
                colorLight: ['#225699', '#d84a38', '#e29c29', '#823858'][i % 4],
                pulse: Math.random() * Math.PI * 2
            });
        }

        // 3D Wireframe Cube Projection Data
        let cubeRotationX = 0;
        let cubeRotationY = 0;
        const cubeVertices = [
            [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
            [-1, -1, 1],  [1, -1, 1],  [1, 1, 1],  [-1, 1, 1]
        ];
        const cubeEdges = [
            [0,1],[1,2],[2,3],[3,0],
            [4,5],[5,6],[6,7],[7,4],
            [0,4],[1,5],[2,6],[3,7]
        ];

        function animateCanvas() {
            ctx.clearRect(0, 0, width, height);

            // Smooth mouse interpolation
            mouseX += (targetMouseX - mouseX) * 0.08;
            mouseY += (targetMouseY - mouseY) * 0.08;

            const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

            // 1. Perspective Cyber Grid (Dark) / Blueprint Graph Lines (Light)
            ctx.save();
            if (isDark) {
                // Retro CRT Synthwave Grid Floor
                ctx.strokeStyle = 'rgba(0, 240, 255, 0.06)';
                ctx.lineWidth = 1;
                const horizonY = height * 0.6;
                
                // Vertical perspective lines
                for (let x = -width; x < width * 2; x += 60) {
                    ctx.beginPath();
                    ctx.moveTo(x, height);
                    ctx.lineTo(width / 2 + (x - width / 2) * 0.1, horizonY);
                    ctx.stroke();
                }
                // Horizontal grid lines
                for (let y = horizonY; y < height; y += 18) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(width, y);
                    ctx.stroke();
                }
            } else {
                // Analog Blueprint Graph Paper Lines
                ctx.strokeStyle = 'rgba(34, 86, 153, 0.06)';
                ctx.lineWidth = 1;
                const gridSize = 40;
                for (let x = 0; x < width; x += gridSize) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, height);
                    ctx.stroke();
                }
                for (let y = 0; y < height; y += gridSize) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(width, y);
                    ctx.stroke();
                }
            }
            ctx.restore();

            // 2. Draw Fluid Ambient Color Blobs
            blobs.forEach((blob) => {
                blob.x += blob.vx;
                blob.y += blob.vy;
                if (blob.x < 0.05 || blob.x > 0.95) blob.vx *= -1;
                if (blob.y < 0.05 || blob.y > 0.95) blob.vy *= -1;

                const bx = blob.x * width;
                const by = blob.y * height;
                const grad = ctx.createRadialGradient(bx, by, 0, bx, by, blob.radius);
                const col = isDark ? blob.colorDark : blob.colorLight;
                grad.addColorStop(0, col);
                grad.addColorStop(1, 'rgba(0,0,0,0)');

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(bx, by, blob.radius, 0, Math.PI * 2);
                ctx.fill();
            });

            // 3. Draw Vector Nodes & Retro Art Splines
            for (let i = 0; i < nodes.length; i++) {
                const n = nodes[i];
                n.x += n.vx;
                n.y += n.vy;
                n.pulse += 0.03;

                if (n.x < 0 || n.x > width) n.vx *= -1;
                if (n.y < 0 || n.y > height) n.vy *= -1;

                // Interactive Mouse Connector
                const dxMouse = mouseX - n.x;
                const dyMouse = mouseY - n.y;
                const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
                if (distMouse < 180) {
                    ctx.beginPath();
                    ctx.moveTo(n.x, n.y);
                    ctx.lineTo(mouseX, mouseY);
                    ctx.strokeStyle = isDark ? `rgba(0, 240, 255, ${0.45 * (1 - distMouse / 180)})` : `rgba(216, 74, 56, ${0.45 * (1 - distMouse / 180)})`;
                    ctx.lineWidth = 1;
                    if (isDark) ctx.setLineDash([3, 3]);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }

                // Inter-node connections
                for (let j = i + 1; j < nodes.length; j++) {
                    const n2 = nodes[j];
                    const dx = n2.x - n.x;
                    const dy = n2.y - n.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 120) {
                        const alpha = (1 - dist / 120) * (isDark ? 0.3 : 0.2);
                        ctx.beginPath();
                        ctx.moveTo(n.x, n.y);
                        const cx = (n.x + n2.x) / 2 + Math.sin(n.pulse) * 12;
                        const cy = (n.y + n2.y) / 2 + Math.cos(n2.pulse) * 12;
                        ctx.quadraticCurveTo(cx, cy, n2.x, n2.y);
                        ctx.strokeStyle = isDark ? `rgba(255, 0, 127, ${alpha})` : `rgba(34, 86, 153, ${alpha})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }

                // Draw Node Shape
                ctx.save();
                ctx.translate(n.x, n.y);
                ctx.fillStyle = isDark ? n.colorDark : n.colorLight;
                ctx.strokeStyle = isDark ? '#ffffff' : '#1a2233';
                ctx.lineWidth = 1;

                const pulseSize = n.size + Math.sin(n.pulse) * 1.2;

                if (isDark) {
                    // Retro Cyber HUD Node (Diamond keyframe or square)
                    if (n.type === 'keyframe') {
                        ctx.rotate(Math.PI / 4);
                        ctx.beginPath();
                        ctx.rect(-pulseSize, -pulseSize, pulseSize * 2, pulseSize * 2);
                        ctx.fill();
                        ctx.stroke();
                    } else {
                        ctx.beginPath();
                        ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
                        ctx.fill();
                    }
                } else {
                    // Vintage Print Registration Mark or Crop Crosshair (+)
                    ctx.beginPath();
                    ctx.moveTo(-pulseSize - 2, 0); ctx.lineTo(pulseSize + 2, 0);
                    ctx.moveTo(0, -pulseSize - 2); ctx.lineTo(0, pulseSize + 2);
                    ctx.strokeStyle = isDark ? n.colorDark : n.colorLight;
                    ctx.stroke();
                }
                ctx.restore();
            }

            // 4. Draw 3D Rotating Wireframe Cube (Multimedia Workstation Icon)
            ctx.save();
            const cubeCenterX = width * (width < 768 ? 0.5 : 0.82);
            const cubeCenterY = height * (width < 768 ? 0.25 : 0.38);
            const scale = Math.min(width, height) * 0.08;

            cubeRotationX += 0.006;
            cubeRotationY += 0.008;

            const projected = cubeVertices.map(v => {
                let y1 = v[1] * Math.cos(cubeRotationX) - v[2] * Math.sin(cubeRotationX);
                let z1 = v[1] * Math.sin(cubeRotationX) + v[2] * Math.cos(cubeRotationX);
                let x2 = v[0] * Math.cos(cubeRotationY) + z1 * Math.sin(cubeRotationY);

                return [
                    cubeCenterX + x2 * scale,
                    cubeCenterY + y1 * scale
                ];
            });

            ctx.strokeStyle = isDark ? 'rgba(0, 240, 255, 0.35)' : 'rgba(216, 74, 56, 0.25)';
            ctx.lineWidth = isDark ? 1.5 : 2;
            if (isDark) ctx.setLineDash([4, 4]);

            cubeEdges.forEach(edge => {
                const p1 = projected[edge[0]];
                const p2 = projected[edge[1]];
                ctx.beginPath();
                ctx.moveTo(p1[0], p1[1]);
                ctx.lineTo(p2[0], p2[1]);
                ctx.stroke();
            });

            // Vertices
            projected.forEach(p => {
                ctx.fillStyle = isDark ? '#ffb700' : '#225699';
                ctx.beginPath();
                ctx.arc(p[0], p[1], 3, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.restore();

            requestAnimationFrame(animateCanvas);
        }

        requestAnimationFrame(animateCanvas);
    }

    const navbar = document.getElementById('navbar');
    const backToTopBtn = document.getElementById('back-to-top');

    // Navbar scroll effects
    if (navbar) {
        let ticking = false;
        function updateNavbar() {
            if (window.scrollY > 40) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            ticking = false;
        }
        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(updateNavbar);
                ticking = true;
            }
        });
    }

    // Active navigation highlighting
    if (navLinks.length > 0) {
        function updateActiveLink() {
            const sections = document.querySelectorAll('section[id]');
            if (sections.length === 0) return;
            const scrollPos = window.scrollY + 100;
            sections.forEach(section => {
                if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    const activeLink = document.querySelector(`.nav-link[href="#${section.getAttribute('id')}"]`);
                    if (activeLink) activeLink.classList.add('active');
                }
            });
        }
        let linkTicking = false;
        window.addEventListener('scroll', function() {
            if (!linkTicking) {
                requestAnimationFrame(updateActiveLink);
                linkTicking = true;
            }
        });
    }

    // Back to top button
    if (backToTopBtn) {
        let backToTopTicking = false;
        function updateBackToTop() {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
            backToTopTicking = false;
        }
        window.addEventListener('scroll', function() {
            if (!backToTopTicking) {
                requestAnimationFrame(updateBackToTop);
                backToTopTicking = true;
            }
        });
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Smooth scrolling for nav links
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetSection = document.querySelector(href);
                if (targetSection) {
                    const headerHeight = navbar ? navbar.offsetHeight : 80;
                    const targetPosition = targetSection.offsetTop - headerHeight;
                    window.scrollTo({
                        top: Math.max(0, targetPosition),
                        behavior: 'smooth'
                    });
                }
            });
        }
    });

    // Fade-in animations on scroll
    const observerOptions = { threshold: 0.05, rootMargin: '0px 0px 50px 0px' };
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    // --- PARALLAX & 3D INTERACTIVE ENGINE ---
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function initParallaxEngine() {
        if (prefersReducedMotion) return;
        const parallaxElements = document.querySelectorAll('[data-parallax-speed]');
        if (parallaxElements.length === 0) return;

        let isTicking = false;
        function updateParallax() {
            const viewportHeight = window.innerHeight;
            parallaxElements.forEach(el => {
                const speed = parseFloat(el.getAttribute('data-parallax-speed')) || 0;
                const rect = el.getBoundingClientRect();
                if (rect.bottom >= -100 && rect.top <= viewportHeight + 100) {
                    const elementCenter = rect.top + rect.height / 2;
                    const viewportCenter = viewportHeight / 2;
                    const distanceFromCenter = elementCenter - viewportCenter;
                    const translateY = Math.max(-100, Math.min(100, distanceFromCenter * speed));
                    el.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0)`;
                }
            });
            isTicking = false;
        }

        window.addEventListener('scroll', () => {
            if (!isTicking) {
                requestAnimationFrame(updateParallax);
                isTicking = true;
            }
        }, { passive: true });
        updateParallax();
    }

    function initCardTiltParallax() {
        if (prefersReducedMotion || window.innerWidth < 768) return;
        const cards = document.querySelectorAll('.project-card, .skill-card, .card, .gallery-item, .blog-card, .hero-profile-wrapper');

        cards.forEach(card => {
            card.classList.add('tilt-card');
            if (!card.querySelector('.tilt-glare')) {
                const glare = document.createElement('div');
                glare.className = 'tilt-glare';
                card.appendChild(glare);
            }
            const glare = card.querySelector('.tilt-glare');

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = (((y - centerY) / centerY) * -6).toFixed(2);
                const rotateY = (((x - centerX) / centerX) * 6).toFixed(2);

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px) scale(1.01)`;

                if (glare) {
                    const glareX = (x / rect.width) * 100;
                    const glareY = (y / rect.height) * 100;
                    glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, color-mix(in srgb, var(--accent-cyan) 25%, rgba(255, 255, 255, 0.25)) 0%, transparent 70%)`;
                    glare.style.opacity = '1';
                }
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)';
                if (glare) glare.style.opacity = '0';
            });
        });
    }

    function initHeroInteractiveDepth() {
        if (prefersReducedMotion || window.innerWidth < 768) return;
        const hero = document.getElementById('hero');
        if (!hero) return;

        const badges = hero.querySelectorAll('.floating-badge');
        const orbitRings = hero.querySelectorAll('.orbit-ring');
        const profileFrame = hero.querySelector('.hero-profile-frame');
        const expCard = hero.querySelector('.hero-experience-card');

        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            const mouseX = e.clientX - rect.left - rect.width / 2;
            const mouseY = e.clientY - rect.top - rect.height / 2;

            badges.forEach((badge, idx) => {
                const depth = 0.02 + (idx + 1) * 0.015;
                badge.style.transform = `translate3d(${(mouseX * depth).toFixed(2)}px, ${(mouseY * depth).toFixed(2)}px, 15px) scale(1.05)`;
            });

            orbitRings.forEach((ring, idx) => {
                const depth = (idx + 1) * 0.01;
                ring.style.transform = `translate3d(${(-mouseX * depth).toFixed(2)}px, ${(-mouseY * depth).toFixed(2)}px, 0)`;
            });

            if (profileFrame) {
                profileFrame.style.transform = `perspective(1000px) rotateY(${(mouseX * 0.012).toFixed(2)}deg) rotateX(${(-mouseY * 0.012).toFixed(2)}deg)`;
            }

            if (expCard) {
                expCard.style.transform = `translate3d(${(mouseX * 0.02).toFixed(2)}px, ${(mouseY * 0.02).toFixed(2)}px, 20px)`;
            }
        });

        hero.addEventListener('mouseleave', () => {
            badges.forEach(badge => badge.style.transform = 'translate3d(0, 0, 0) scale(1)');
            orbitRings.forEach(ring => ring.style.transform = 'translate3d(0, 0, 0)');
            if (profileFrame) profileFrame.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
            if (expCard) expCard.style.transform = 'translate3d(0, 0, 0)';
        });
    }

    // Initialize Parallax Systems
    initParallaxEngine();
    initCardTiltParallax();
    initHeroInteractiveDepth();

    // Load dynamic data from JSON
    async function loadJsonData() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            
            const experienceGrid = document.getElementById('experience-grid');
            if (experienceGrid && data.experience) {
                experienceGrid.innerHTML = data.experience.map(job => `
                    <div class="card">
                        <div class="flex items-start gap-4">
                            <div class="w-12 h-12 bg-primary-blue/20 rounded-xl flex items-center justify-center flex-shrink-0 p-1 border border-border-color">
                                <img class="rounded max-h-full max-w-full" src="${job.logo}" alt="${job.alt}">
                            </div>
                            <div>
                                <h4 class="font-semibold text-lg mb-1">${job.title}</h4>
                                <p class="text-primary-blue mono text-sm mb-2">${job.company} • ${job.period}</p>
                                <p class="text-text-secondary text-sm">${job.description}</p>
                            </div>
                        </div>
                    </div>
                `).join('');

                initCardTiltParallax();
            }
        } catch (error) {
            console.error("Could not load data from JSON:", error);
        }
    }

    loadJsonData();
});
