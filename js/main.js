// 主 JavaScript 文件 - 现代化交互增强版

document.addEventListener('DOMContentLoaded', function() {
    // 初始化
    initScrollReveal();
    initNavScrollEffect();
    initSmoothScroll();
    initSkillBarsAnimation();
    initButtonRipple();
    initHoverEffects();

    console.log('网页已加载完成');
});

// 滚动渐入动画
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.resume-section, .agent-card, .photo-category, .photo-item');

    const revealOnScroll = () => {
        revealElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            if (rect.top < windowHeight * 0.85) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }
        });
    };

    // 初始状态
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // 初始检查
}

// 导航栏滚动效果
function initNavScrollEffect() {
    const header = document.querySelector('header');
    if (!header) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // 添加/移除滚动类
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

// 平滑滚动
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// 技能条填充动画
function initSkillBarsAnimation() {
    const skillBars = document.querySelectorAll('.skill-level');
    if (skillBars.length === 0) return;

    const animateSkillBars = () => {
        skillBars.forEach(bar => {
            const width = bar.style.width || bar.getAttribute('style');
            const match = width.match(/(\d+)%/);
            if (match) {
                const percent = match[1];
                bar.style.setProperty('--skill-percent', width);
                bar.style.width = '0';
                setTimeout(() => {
                    bar.style.width = width;
                }, 100);
            }
        });
    };

    // 当技能条进入视口时触发动画
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateSkillBars();
                observer.disconnect();
            }
        });
    }, { threshold: 0.3 });

    const skillsContainer = document.querySelector('.skills-container');
    if (skillsContainer) {
        observer.observe(skillsContainer);
    } else {
        animateSkillBars();
    }
}

// 按钮涟漪效果
function initButtonRipple() {
    document.querySelectorAll('.download-btn, .back-btn, .pdf-download-link, .back-btn-link, .use-agent-btn, .back-home-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                background: rgba(255, 255, 255, 0.4);
                border-radius: 50%;
                transform: scale(0);
                animation: rippleEffect 0.6s ease-out;
                pointer-events: none;
                left: ${x}px;
                top: ${y}px;
                width: 100px;
                height: 100px;
                margin-left: -50px;
                margin-top: -50px;
            `;

            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// 涟漪动画样式
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes rippleEffect {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// 悬停增强效果
function initHoverEffects() {
    // 卡片 3D 倾斜效果
    document.querySelectorAll('.agent-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
}

// 返回顶部功能
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 添加导航滚动样式到CSS
const navScrollStyle = document.createElement('style');
navScrollStyle.textContent = `
    header.scrolled {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
    }
`;
document.head.appendChild(navScrollStyle);
