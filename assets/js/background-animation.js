// 背景粒子动画 - 精炼版
document.addEventListener('DOMContentLoaded', function() {
    // 创建背景容器
    const backgroundContainer = document.createElement('div');
    backgroundContainer.className = 'animated-background';
    document.body.prepend(backgroundContainer);

    // 创建渐变背景
    const gradientBg = document.createElement('div');
    gradientBg.className = 'gradient-bg';
    backgroundContainer.appendChild(gradientBg);

    // 创建连接线画布
    const connectionCanvas = document.createElement('canvas');
    connectionCanvas.className = 'connection-lines';
    backgroundContainer.appendChild(connectionCanvas);

    // 设置画布
    const ctx = connectionCanvas.getContext('2d');
    resizeCanvas();

    // 创建粒子
    const particles = [];
    const particleCount = 8;

    for (let i = 0; i < particleCount; i++) {
        createParticle(backgroundContainer, particles);
    }

    // 动画循环
    animateParticles(particles, ctx);

    window.addEventListener('resize', resizeCanvas);

    function resizeCanvas() {
        connectionCanvas.width = window.innerWidth;
        connectionCanvas.height = window.innerHeight;
    }
});

function createParticle(container, particles) {
    const particle = document.createElement('div');
    particle.className = 'particle';

    const size = Math.random() * 2 + 0.5;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;

    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;

    const opacity = Math.random() * 0.1 + 0.03;
    particle.style.opacity = opacity;

    container.appendChild(particle);

    particles.push({
        element: particle,
        x: x,
        y: y,
        size: size,
        speedX: Math.random() * 0.06 - 0.03,
        speedY: Math.random() * 0.06 - 0.03
    });
}

function animateParticles(particles, ctx) {
    function animate() {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        particles.forEach(particle => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            if (particle.x < 0 || particle.x > window.innerWidth) {
                particle.speedX *= -1;
            }
            if (particle.y < 0 || particle.y > window.innerHeight) {
                particle.speedY *= -1;
            }

            particle.element.style.left = `${particle.x}px`;
            particle.element.style.top = `${particle.y}px`;
        });

        drawConnections(particles, ctx);
        requestAnimationFrame(animate);
    }

    animate();
}

function drawConnections(particles, ctx) {
    ctx.strokeStyle = 'rgba(26, 54, 93, 0.06)';
    ctx.lineWidth = 0.5;

    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 120) {
                const opacity = 1 - distance / 120;
                ctx.strokeStyle = `rgba(26, 54, 93, ${opacity * 0.06})`;

                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
}
