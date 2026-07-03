// ---- Fundo animado de partículas ----
// Efeito ambiente: pontos roxos flutuando, conectados por linhas quando próximos.
// Roda em <canvas>, fica atrás do conteúdo, não interfere em cliques.

(function initParticleBackground() {
    const canvas = document.getElementById('bg-particles');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    ).matches;

    const PARTICLE_COLOR = '124, 92, 252'; // var(--accent) em RGB
    const PARTICLE_COUNT = 150;
    const MAX_LINE_DISTANCE = 160;
    const SPEED = 0.15;

    let particles = [];
    let width, height;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function createParticles() {
        particles = Array.from({ length: PARTICLE_COUNT }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * SPEED,
            vy: (Math.random() - 0.5) * SPEED,
            radius: Math.random() * 1.5 + 0.5,
            pulseSpeed: Math.random() * 0.02 + 0.01,
            pulsePhase: Math.random() * Math.PI * 2
        }));
    }

    function step() {
        ctx.clearRect(0, 0, width, height);

        // atualiza posição e desenha cada partícula
        for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            p.pulsePhase += p.pulseSpeed;
            const pulse = Math.sin(p.pulsePhase);

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius + pulse * 0.8, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${PARTICLE_COLOR}, ${0.6 + pulse * 0.3})`;
            ctx.fill();
        }

        // conecta partículas próximas com uma linha fina
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < MAX_LINE_DISTANCE) {
                    const opacity = 0.12 * (1 - distance / MAX_LINE_DISTANCE);
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(${PARTICLE_COLOR}, ${opacity})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(step);
    }

    resize();
    createParticles();
    window.addEventListener('resize', () => {
        resize();
        createParticles();
    });

    if (prefersReducedMotion) {
        // desenha um único quadro estático em vez de animar
        step_static();
    } else {
        requestAnimationFrame(step);
    }

    function step_static() {
        ctx.clearRect(0, 0, width, height);
        for (const p of particles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${PARTICLE_COLOR}, 0.4)`;
            ctx.fill();
        }
    }
})();