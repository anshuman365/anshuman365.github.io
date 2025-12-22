// physics/js/physics-common.js
class PhysicsCommon {
    constructor() {
        this.initDarkMode();
        this.initMobileMenu();
        this.initEquations();
    }

    initDarkMode() {
        // Check for saved theme or prefer-color-scheme
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        const savedTheme = localStorage.getItem('physics-theme');
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark.matches)) {
            document.documentElement.classList.add('dark');
        }
        
        // Dark mode toggle
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => {
                document.documentElement.classList.toggle('dark');
                localStorage.setItem('physics-theme', 
                    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
                );
            });
        }
    }

    initMobileMenu() {
        const mobileToggle = document.querySelector('.mobile-physics-toggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', (e) => {
                const submenu = mobileToggle.nextElementSibling;
                submenu.classList.toggle('hidden');
                const icon = mobileToggle.querySelector('i');
                icon.classList.toggle('rotate-180');
            });
        }
    }

    initEquations() {
        // Make equations copyable
        document.querySelectorAll('.physics-equation').forEach(eq => {
            eq.addEventListener('click', function() {
                const text = this.textContent || this.innerText;
                navigator.clipboard.writeText(text).then(() => {
                    const original = this.innerHTML;
                    this.innerHTML = '<i class="fas fa-check mr-2"></i>Copied!';
                    setTimeout(() => {
                        this.innerHTML = original;
                    }, 2000);
                });
            });
        });
    }

    // Particle animation for headers
    createParticleCanvas(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const particles = [];
        const particleCount = 100;
        
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.speedX = Math.random() * 1 - 0.5;
                this.speedY = Math.random() * 1 - 0.5;
                this.color = 'rgba(255, 255, 255, 0.5)';
            }
            
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                
                if (this.x > canvas.width) this.x = 0;
                else if (this.x < 0) this.x = canvas.width;
                
                if (this.y > canvas.height) this.y = 0;
                else if (this.y < 0) this.y = canvas.height;
            }
            
            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Create particles
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
        
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            
            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * (1 - distance/100)})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            
            requestAnimationFrame(animate);
        }
        
        animate();
        
        // Resize handler
        window.addEventListener('resize', () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.physicsCommon = new PhysicsCommon();
});