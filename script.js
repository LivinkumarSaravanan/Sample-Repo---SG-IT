/**
 * SG Software Solutions - Main JavaScript
 * Handles animations, interactions, particle effects, and theme toggle
 */

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initParticles();
    initScrollAnimations();
    initNavigation();
    initContactForm();
});

/**
 * Theme Toggle (Light/Dark)
 */
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

/**
 * Canvas particle background for hero section
 */
function initParticles() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;
    let isRunning = true;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createParticles() {
        const particleCount = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
        particles = [];

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 2 + 0.5,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                alpha: Math.random() * 0.5 + 0.2
            });
        }
    }

    function drawParticles() {
        if (!isRunning) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(99, 102, 241, ${p.alpha})`;
            ctx.fill();
        });

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(99, 102, 241, ${0.15 * (1 - distance / 150)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        animationId = requestAnimationFrame(drawParticles);
    }

    resize();
    createParticles();
    drawParticles();

    window.addEventListener('resize', () => {
        resize();
        createParticles();
    });

    // Pause animation when not visible
    document.addEventListener('visibilitychange', () => {
        isRunning = !document.hidden;
        if (isRunning) drawParticles();
    });
}

/**
 * GSAP ScrollTrigger Animations
 */
function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Hero elements animation on load
    gsap.fromTo('.hero-badge', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.2 });
    gsap.fromTo('.hero-title', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.4 });
    gsap.fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.6 });
    gsap.fromTo('.hero-cta', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.8 });
    gsap.fromTo('.hero-stats', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, delay: 1.0 });

    // Scroll-based reveal animations
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight * 0.95;

            if (isVisible && !el.classList.contains('animated')) {
                el.classList.add('animated');

                if (el.classList.contains('reveal-left')) {
                    gsap.fromTo(el, { opacity: 0, x: -60 }, {
                        opacity: 1, x: 0, duration: 0.8, ease: 'power2.out'
                    });
                } else if (el.classList.contains('reveal-right')) {
                    gsap.fromTo(el, { opacity: 0, x: 60 }, {
                        opacity: 1, x: 0, duration: 0.8, ease: 'power2.out'
                    });
                } else {
                    gsap.fromTo(el, { opacity: 0, y: 60 }, {
                        opacity: 1, y: 0, duration: 0.8, ease: 'power2.out'
                    });
                }
            }
        });
    };

    // Initial check
    setTimeout(animateOnScroll, 100);

    // On scroll
    window.addEventListener('scroll', animateOnScroll, { passive: true });

    // Stats counter animation with ScrollTrigger
    const statNumbers = document.querySelectorAll('[data-count]');
    statNumbers.forEach(stat => {
        const target = parseInt(stat.dataset.count);

        ScrollTrigger.create({
            trigger: stat,
            start: 'top 85%',
            onEnter: () => {
                if (stat.classList.contains('counted')) return;
                stat.classList.add('counted');
                animateCounter(stat, target);
            },
            once: true
        });
    });

    // Parallax effect for hero gradient
    gsap.to('.hero-gradient', {
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1
        },
        y: 100,
        ease: 'none'
    });

    // Service cards staggered animation
    ScrollTrigger.batch('.service-card', {
        start: 'top 85%',
        onEnter: (cards) => {
            gsap.fromTo(cards, { opacity: 0, y: 60 }, {
                opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out'
            });
        },
        once: true
    });

    // Advantage cards staggered animation
    ScrollTrigger.batch('.advantage-card', {
        start: 'top 85%',
        onEnter: (cards) => {
            gsap.fromTo(cards, { opacity: 0, y: 60 }, {
                opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out'
            });
        },
        once: true
    });

    // Process steps staggered animation
    ScrollTrigger.batch('.process-step', {
        start: 'top 85%',
        onEnter: (steps) => {
            gsap.fromTo(steps, { opacity: 0, y: 60 }, {
                opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out'
            });
        },
        once: true
    });

    // Testimonial cards staggered animation
    ScrollTrigger.batch('.testimonial-card', {
        start: 'top 85%',
        onEnter: (cards) => {
            gsap.fromTo(cards, { opacity: 0, y: 60 }, {
                opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out'
            });
        },
        once: true
    });

    // Job cards staggered animation
    ScrollTrigger.batch('.job-card', {
        start: 'top 85%',
        onEnter: (cards) => {
            gsap.fromTo(cards, { opacity: 0, y: 60 }, {
                opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out'
            });
        },
        once: true
    });

    // CTA section animation
    gsap.fromTo('.cta-content', { opacity: 0, y: 60 }, {
        scrollTrigger: {
            trigger: '.cta-content',
            start: 'top 85%'
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out'
    });

    // Section headers animation
    ScrollTrigger.batch('.section-header', {
        start: 'top 85%',
        onEnter: (headers) => {
            gsap.fromTo(headers, { opacity: 0, y: 60 }, {
                opacity: 1, y: 0, duration: 0.8, ease: 'power2.out'
            });
        },
        once: true
    });

    // Stats row animation
    gsap.fromTo('.stats-row', { opacity: 0, y: 60 }, {
        scrollTrigger: {
            trigger: '.stats-row',
            start: 'top 85%'
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out'
    });

    // Careers CTA animation
    gsap.fromTo('.careers-cta', { opacity: 0, y: 60 }, {
        scrollTrigger: {
            trigger: '.careers-cta',
            start: 'top 85%'
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out'
    });

    // Image grid items animation
    ScrollTrigger.batch('.image-grid-item', {
        start: 'top 85%',
        onEnter: (items) => {
            gsap.fromTo(items, { opacity: 0, y: 50, scale: 0.9 }, {
                opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.15, ease: 'power2.out'
            });
        },
        once: true
    });
}

/**
 * Animated counter
 */
function animateCounter(element, target) {
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (target - start) * easeProgress);

        element.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

/**
 * Navigation functionality
 */
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.querySelector('.nav-links');
    const navLinkItems = document.querySelectorAll('.nav-link');

    // Scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;

        updateActiveLink();
    }, { passive: true });

    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('open');
        navLinks.classList.toggle('open');
    });

    // Close mobile menu on link click
    navLinkItems.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('open');
            navLinks.classList.remove('open');
        });
    });

    // Smooth scroll for nav links
    navLinkItems.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Update active navigation link based on scroll position
 */
function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const scrollPosition = window.scrollY + 150;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

/**
 * Contact form handling
 */
function initContactForm() {
    const form = document.getElementById('contactForm');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = form.querySelector('#name').value.trim();
            const email = form.querySelector('#email').value.trim();
            const message = form.querySelector('#message').value.trim();
            const antispam = form.querySelector('#antispam').value.trim();

            // Simple validation
            if (!name || !email || !message) {
                showFormMessage('Please fill in all required fields.', 'error');
                return;
            }

            if (!isValidEmail(email)) {
                showFormMessage('Please enter a valid email address.', 'error');
                return;
            }

            // Anti-spam check (7 + 3 = 10)
            if (antispam !== '10') {
                showFormMessage('Please answer the anti-spam question correctly.', 'error');
                return;
            }

            // Simulate form submission
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Sending...';
            submitBtn.disabled = true;

            setTimeout(() => {
                showFormMessage("Thank you! Your message has been sent. We'll get back to you soon.", 'success');
                form.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 1500);
        });
    }
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Show form message
 */
function showFormMessage(message, type) {
    // Remove existing message
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageEl = document.createElement('div');
    messageEl.className = `form-message ${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        font-weight: 500;
        ${type === 'success'
            ? 'background: #dcfce7; color: #166534; border: 1px solid #bbf7d0;'
            : 'background: #fee2e2; color: #991b1b; border: 1px solid #fecaca;'
        }
    `;

    const form = document.getElementById('contactForm');
    form.insertBefore(messageEl, form.firstChild);

    // Remove after 5 seconds
    setTimeout(() => {
        messageEl.remove();
    }, 5000);
}
