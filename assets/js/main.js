/*=============== DARK LIGHT THEME ===============*/
const root = document.documentElement;
const themeButton = document.getElementById('theme-button');
const themeIcon = themeButton?.querySelector('i');
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const darkTheme = 'dark-theme';

const getStoredTheme = () => localStorage.getItem('selected-theme');
const getCurrentTheme = () => root.classList.contains(darkTheme) ? 'dark' : 'light';

const applyTheme = (theme, persist = false) => {
    const isDark = theme === 'dark';
    const nextIcon = isDark ? 'ri-sun-line' : 'ri-moon-line';

    root.classList.toggle(darkTheme, isDark);
    root.dataset.theme = theme;
    document.body.classList.toggle(darkTheme, isDark);

    if (themeIcon) {
        themeIcon.className = nextIcon;
    }

    if (themeButton) {
        themeButton.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
        themeButton.setAttribute('title', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    }

    if (themeColorMeta) {
        themeColorMeta.setAttribute('content', isDark ? '#101722' : '#fcfaf5');
    }

    if (persist) {
        localStorage.setItem('selected-theme', theme);
    }
};

applyTheme(getStoredTheme() === 'dark' ? 'dark' : 'light');

themeButton?.addEventListener('click', () => {
    applyTheme(getCurrentTheme() === 'dark' ? 'light' : 'dark', true);
});

/*=============== FIXED EXPANDING HEADER ===============*/
const siteNav = document.querySelector('.site-nav');
const profilePanel = document.querySelector('.hero__panel');
let headerFrame = null;

const updateFixedHeader = () => {
    const navBottom = siteNav?.getBoundingClientRect().bottom ?? 0;
    const panelTop = profilePanel?.getBoundingClientRect().top ?? 0;
    const isHeaderAboveProfile = profilePanel
        ? panelTop > navBottom + 8
        : window.scrollY <= 24;

    siteNav?.classList.toggle('is-expanded', isHeaderAboveProfile);
    headerFrame = null;
};

updateFixedHeader();

const requestHeaderUpdate = () => {
    if (!headerFrame) {
        headerFrame = window.requestAnimationFrame(updateFixedHeader);
    }
};

window.addEventListener('scroll', requestHeaderUpdate, { passive: true });
window.addEventListener('resize', requestHeaderUpdate, { passive: true });
window.addEventListener('load', requestHeaderUpdate);

/*=============== LOADING OVERLAY ===============*/
const fadeOutOverlay = () => {
    const overlay = document.getElementById('loading-overlay');

    if (!overlay) {
        return;
    }

    overlay.classList.add('fade-out');
    setTimeout(() => overlay.remove(), 800);
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fadeOutOverlay);
} else {
    fadeOutOverlay();
}

window.addEventListener('load', fadeOutOverlay);

/*=============== NEURAL FIELD ===============*/
const initNeuralField = () => {
    const canvas = document.getElementById('neural-field');
    const ctx = canvas?.getContext('2d', { alpha: true });

    if (!canvas || !ctx) {
        return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const TAU = Math.PI * 2;
    const MAX_DPR = 2;
    const pointer = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 3,
        targetX: window.innerWidth / 2,
        targetY: window.innerHeight / 3,
        active: false,
        strength: 0
    };

    let width = 0;
    let height = 0;
    let dpr = 1;
    let frame = null;
    let seed = 2027;
    let particles = [];
    let isRunning = false;

    const rand = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
    };

    const randomBetween = (min, max) => min + rand() * (max - min);
    const rgba = (rgb, alpha) => `rgba(${rgb}, ${alpha})`;

    const getPalette = () => {
        const isDark = root.classList.contains(darkTheme);

        return isDark ? {
            line: '238, 143, 82',
            lineSoft: '178, 84, 49',
            soma: '255, 218, 184',
            pulse: '255, 184, 92',
            speck: '230, 124, 72'
        } : {
            line: '150, 63, 28',
            lineSoft: '110, 50, 34',
            soma: '92, 38, 20',
            pulse: '190, 93, 28',
            speck: '128, 56, 30'
        };
    };

    const createParticle = (index) => {
        const speed = randomBetween(0.055, 0.18);
        const angle = randomBetween(0, TAU);
        const radius = randomBetween(0.85, 1.9);
        const branchCount = Math.floor(randomBetween(3, 6));

        return {
            index,
            x: randomBetween(0, width),
            y: randomBetween(0, height),
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius,
            phase: randomBetween(0, TAU),
            alpha: randomBetween(0.5, 1),
            dendrites: Array.from({ length: branchCount }, () => ({
                angle: randomBetween(0, TAU),
                length: randomBetween(14, 34),
                bend: randomBetween(-0.8, 0.8),
                phase: randomBetween(0, TAU)
            }))
        };
    };

    const resize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        seed = 2027 + width * 13 + height * 29;
        const area = width * height;
        const particleCount = Math.max(120, Math.min(260, Math.floor(area / 6200)));
        const count = prefersReducedMotion ? Math.floor(particleCount * 0.68) : particleCount;

        particles = Array.from({ length: count }, (_, index) => createParticle(index));
    };

    const updateParticle = (particle) => {
        if (prefersReducedMotion) {
            return;
        }

        if (pointer.strength > 0.01) {
            const dx = particle.x - pointer.x;
            const dy = particle.y - pointer.y;
            const distance = Math.hypot(dx, dy) || 1;
            const reach = 145;

            if (distance < reach) {
                const force = (1 - distance / reach) * pointer.strength * 0.018;
                particle.vx += (dx / distance) * force;
                particle.vy += (dy / distance) * force;
            }
        }

        const speed = Math.hypot(particle.vx, particle.vy) || 1;
        const maxSpeed = 0.24;

        if (speed > maxSpeed) {
            particle.vx = (particle.vx / speed) * maxSpeed;
            particle.vy = (particle.vy / speed) * maxSpeed;
        }

        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < -36) particle.x = width + 36;
        if (particle.x > width + 36) particle.x = -36;
        if (particle.y < -36) particle.y = height + 36;
        if (particle.y > height + 36) particle.y = -36;
    };

    const drawLinks = (palette, time) => {
        const linkDistance = Math.min(154, Math.max(110, width * 0.105));

        for (let i = 0; i < particles.length; i += 1) {
            const a = particles[i];

            for (let j = i + 1; j < particles.length; j += 1) {
                const b = particles[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const distance = Math.hypot(dx, dy);

                if (distance > linkDistance) {
                    continue;
                }

                const falloff = 1 - distance / linkDistance;
                const pulseKey = (a.index * 17 + b.index * 31) % 23;

                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.strokeStyle = rgba(palette.line, falloff * 0.13);
                ctx.lineWidth = 0.42 + falloff * 0.38;
                ctx.stroke();

                if (pulseKey === 0) {
                    const progress = (time * 0.00009 + a.phase) % 1;
                    const px = a.x + (b.x - a.x) * progress;
                    const py = a.y + (b.y - a.y) * progress;

                    ctx.beginPath();
                    ctx.arc(px, py, 0.8, 0, TAU);
                    ctx.fillStyle = rgba(palette.pulse, falloff * 0.16);
                    ctx.fill();
                }
            }
        }
    };

    const drawParticle = (particle, palette, time) => {
        const breath = (Math.sin(time * 0.001 + particle.phase) + 1) * 0.5;

        particle.dendrites.forEach((dendrite) => {
            const angle = dendrite.angle + Math.sin(time * 0.0005 + dendrite.phase) * 0.18;
            const length = dendrite.length * (0.82 + breath * 0.22);
            const endX = particle.x + Math.cos(angle) * length;
            const endY = particle.y + Math.sin(angle) * length;
            const ctrlX = particle.x + Math.cos(angle + dendrite.bend) * length * 0.46;
            const ctrlY = particle.y + Math.sin(angle + dendrite.bend) * length * 0.46;

            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
            ctx.strokeStyle = rgba(palette.lineSoft, 0.115 * particle.alpha);
            ctx.lineWidth = 0.62;
            ctx.stroke();
        });

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * 4.4, 0, TAU);
        ctx.fillStyle = rgba(palette.line, 0.012 + breath * 0.012);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, TAU);
        ctx.fillStyle = rgba(palette.soma, 0.18 + breath * 0.08);
        ctx.fill();
    };

    const render = (time = performance.now(), scheduleNext = true) => {
        const palette = getPalette();

        pointer.x += (pointer.targetX - pointer.x) * 0.08;
        pointer.y += (pointer.targetY - pointer.y) * 0.08;
        pointer.strength += ((pointer.active ? 1 : 0) - pointer.strength) * 0.055;

        ctx.clearRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'lighter';

        particles.forEach(updateParticle);
        drawLinks(palette, time);
        particles.forEach((particle) => drawParticle(particle, palette, time));

        if (pointer.strength > 0.01) {
            const gradient = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 260);
            gradient.addColorStop(0, `rgba(104, 230, 230, ${0.09 * pointer.strength})`);
            gradient.addColorStop(0.38, `rgba(72, 180, 206, ${0.045 * pointer.strength})`);
            gradient.addColorStop(1, 'rgba(72, 180, 206, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        }

        ctx.globalCompositeOperation = 'source-over';

        if (scheduleNext && !prefersReducedMotion) {
            frame = window.requestAnimationFrame(render);
        }
    };

    const start = () => {
        if (isRunning || prefersReducedMotion) {
            render(performance.now(), false);
            return;
        }

        isRunning = true;
        frame = window.requestAnimationFrame(render);
    };

    resize();

    if (hasFinePointer && !prefersReducedMotion) {
        window.addEventListener('pointermove', (event) => {
            pointer.targetX = event.clientX;
            pointer.targetY = event.clientY;
            pointer.active = true;
        }, { passive: true });

        document.addEventListener('mouseleave', () => {
            pointer.active = false;
        });
    }

    window.addEventListener('resize', () => {
        resize();
        render(performance.now(), false);
    }, { passive: true });
    themeButton?.addEventListener('click', () => window.requestAnimationFrame((time) => render(time, false)));
    start();

    window.addEventListener('pagehide', () => {
        if (frame) {
            window.cancelAnimationFrame(frame);
        }
        isRunning = false;
    });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNeuralField);
} else {
    initNeuralField();
}
