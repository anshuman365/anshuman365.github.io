// physics/js/classical-mechanics-sim.js
class ClassicalMechanicsSimulations {
    constructor() {
        this.initSimulations();
    }

    initSimulations() {
        this.initParticleAnimation();
        this.initInertiaSimulation();
        this.initFMASimulation();
        this.initRocketSimulation();
        this.initProjectileSimulation();
        this.initPendulumSimulation();
    }

    initParticleAnimation() {
        const canvas = document.getElementById('particle-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let particles = [];
        const particleCount = 150;

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 3 + 1;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.speedY = Math.random() * 0.5 - 0.25;
                this.color = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.3})`;
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

            // Update and draw particles
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            // Draw connections between particles
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 * (1 - distance/100)})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(animate);
        }

        animate();

        window.addEventListener('resize', () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        });
    }

    initInertiaSimulation() {
        const canvas = document.getElementById('inertia-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let object = { x: 100, y: 150, width: 60, height: 40, velocity: 0, moving: false };
        const pushForce = 5;
        const friction = 0.98;

        function drawObject() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw floor
            ctx.fillStyle = '#374151';
            ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

            // Draw object
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(object.x, object.y, object.width, object.height);

            // Draw force arrow if moving
            if (object.moving && object.velocity > 0.1) {
                ctx.beginPath();
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 2;
                ctx.moveTo(object.x + object.width + 20, object.y + object.height/2);
                ctx.lineTo(object.x + object.width + 50, object.y + object.height/2);
                ctx.stroke();

                // Arrowhead
                ctx.beginPath();
                ctx.fillStyle = '#ef4444';
                ctx.moveTo(object.x + object.width + 50, object.y + object.height/2);
                ctx.lineTo(object.x + object.width + 40, object.y + object.height/2 - 5);
                ctx.lineTo(object.x + object.width + 40, object.y + object.height/2 + 5);
                ctx.closePath();
                ctx.fill();
            }

            // Draw friction arrow
            if (object.moving) {
                ctx.beginPath();
                ctx.strokeStyle = '#3b82f6';
                ctx.lineWidth = 2;
                ctx.moveTo(object.x - 20, object.y + object.height/2);
                ctx.lineTo(object.x - 50, object.y + object.height/2);
                ctx.stroke();

                ctx.beginPath();
                ctx.fillStyle = '#3b82f6';
                ctx.moveTo(object.x - 50, object.y + object.height/2);
                ctx.lineTo(object.x - 40, object.y + object.height/2 - 5);
                ctx.lineTo(object.x - 40, object.y + object.height/2 + 5);
                ctx.closePath();
                ctx.fill();
            }
        }

        function animate() {
            if (object.moving) {
                object.x += object.velocity;
                object.velocity *= friction;

                if (Math.abs(object.velocity) < 0.1) {
                    object.moving = false;
                    object.velocity = 0;
                }

                // Boundary check
                if (object.x > canvas.width - object.width) {
                    object.x = canvas.width - object.width;
                    object.velocity *= -0.5; // Bounce
                }
                if (object.x < 0) {
                    object.x = 0;
                    object.velocity *= -0.5;
                }
            }

            drawObject();
            requestAnimationFrame(animate);
        }

        // Push button event
        document.getElementById('push-object').addEventListener('click', () => {
            object.velocity = pushForce;
            object.moving = true;
        });

        // Initialize canvas
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        drawObject();
        animate();

        window.addEventListener('resize', () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            drawObject();
        });
    }

    initFMASimulation() {
        const canvas = document.getElementById('fma-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let mass = 5; // kg
        let force = 10; // N
        let acceleration = force / mass;
        let object = { x: 100, y: 150, width: 60, height: 40, velocity: 0 };

        const forceSlider = document.getElementById('force-slider');
        const forceValue = document.getElementById('force-value');
        const massDisplay = document.getElementById('mass-display');
        const accelerationDisplay = document.getElementById('acceleration-display');

        function updateCalculations() {
            acceleration = force / mass;
            accelerationDisplay.textContent = `${acceleration.toFixed(1)} m/s²`;
        }

        function drawObject() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw floor
            ctx.fillStyle = '#374151';
            ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

            // Draw mass label
            ctx.fillStyle = '#ffffff';
            ctx.font = '14px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(`${mass} kg`, object.x + object.width/2, object.y - 10);

            // Draw object
            const hue = Math.min(120, acceleration * 20);
            ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
            ctx.fillRect(object.x, object.y, object.width, object.height);

            // Draw force arrow
            ctx.beginPath();
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 3;
            ctx.moveTo(object.x + object.width + 10, object.y + object.height/2);
            ctx.lineTo(object.x + object.width + 10 + force * 3, object.y + object.height/2);
            ctx.stroke();

            // Force arrowhead
            ctx.beginPath();
            ctx.fillStyle = '#ef4444';
            ctx.moveTo(object.x + object.width + 10 + force * 3, object.y + object.height/2);
            ctx.lineTo(object.x + object.width + 10 + force * 3 - 10, object.y + object.height/2 - 5);
            ctx.lineTo(object.x + object.width + 10 + force * 3 - 10, object.y + object.height/2 + 5);
            ctx.closePath();
            ctx.fill();

            // Draw acceleration arrow
            if (acceleration > 0.1) {
                ctx.beginPath();
                ctx.strokeStyle = '#3b82f6';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.moveTo(object.x + object.width/2, object.y + object.height + 10);
                ctx.lineTo(object.x + object.width/2, object.y + object.height + 10 + acceleration * 20);
                ctx.stroke();
                ctx.setLineDash([]);

                // Acceleration arrowhead
                ctx.beginPath();
                ctx.fillStyle = '#3b82f6';
                ctx.moveTo(object.x + object.width/2, object.y + object.height + 10 + acceleration * 20);
                ctx.lineTo(object.x + object.width/2 - 5, object.y + object.height + 10 + acceleration * 20 - 10);
                ctx.lineTo(object.x + object.width/2 + 5, object.y + object.height + 10 + acceleration * 20 - 10);
                ctx.closePath();
                ctx.fill();
            }
        }

        function animate() {
            // Apply acceleration to velocity
            object.velocity += acceleration * 0.016; // Assuming 60fps
            object.x += object.velocity;

            // Boundary check with bounce
            if (object.x > canvas.width - object.width) {
                object.x = canvas.width - object.width;
                object.velocity *= -0.8;
            }
            if (object.x < 0) {
                object.x = 0;
                object.velocity *= -0.8;
            }

            drawObject();
            requestAnimationFrame(animate);
        }

        // Force slider event
        forceSlider.addEventListener('input', () => {
            force = parseInt(forceSlider.value);
            forceValue.textContent = force;
            updateCalculations();
        });

        // Mass adjustment buttons
        document.querySelectorAll('.mass-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.classList.contains('increase')) {
                    mass = Math.min(20, mass + 1);
                } else {
                    mass = Math.max(1, mass - 1);
                }
                massDisplay.textContent = `${mass} kg`;
                updateCalculations();
            });
        });

        // Initialize canvas
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        updateCalculations();
        drawObject();
        animate();

        window.addEventListener('resize', () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            drawObject();
        });
    }

    initRocketSimulation() {
        const canvas = document.getElementById('rocket-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let rocket = { x: 100, y: canvas.height - 100, width: 40, height: 80, fuel: 100, thrust: 0 };
        let exhaustParticles = [];

        class ExhaustParticle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 5 + 2;
                this.speedX = Math.random() * 4 - 2;
                this.speedY = Math.random() * 3 + 2;
                this.life = 100;
                this.color = `rgb(255, ${Math.random() * 100 + 100}, 0)`;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.life -= 2;
                this.size *= 0.98;
            }

            draw() {
                ctx.globalAlpha = this.life / 100;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }

        function drawRocket() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw stars
            for (let i = 0; i < 50; i++) {
                const x = (i * 7) % canvas.width;
                const y = (i * 13) % canvas.height;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fillRect(x, y, 2, 2);
            }

            // Draw rocket
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(rocket.x, rocket.y, rocket.width, rocket.height);

            // Draw rocket nose
            ctx.beginPath();
            ctx.moveTo(rocket.x, rocket.y);
            ctx.lineTo(rocket.x + rocket.width, rocket.y);
            ctx.lineTo(rocket.x + rocket.width/2, rocket.y - 30);
            ctx.closePath();
            ctx.fillStyle = '#ef4444';
            ctx.fill();

            // Draw exhaust particles
            exhaustParticles.forEach((particle, index) => {
                particle.update();
                particle.draw();

                if (particle.life <= 0) {
                    exhaustParticles.splice(index, 1);
                }
            });

            // Draw thrust flame
            if (rocket.thrust > 0 && rocket.fuel > 0) {
                const flameHeight = 20 + Math.random() * 10;
                ctx.fillStyle = `rgb(255, ${Math.floor(Math.random() * 100) + 100}, 0)`;
                ctx.beginPath();
                ctx.moveTo(rocket.x + 10, rocket.y + rocket.height);
                ctx.lineTo(rocket.x + rocket.width - 10, rocket.y + rocket.height);
                ctx.lineTo(rocket.x + rocket.width/2, rocket.y + rocket.height + flameHeight);
                ctx.closePath();
                ctx.fill();
            }

            // Draw fuel gauge
            ctx.fillStyle = '#374151';
            ctx.fillRect(10, 10, 20, 100);
            ctx.fillStyle = '#10b981';
            const fuelHeight = (rocket.fuel / 100) * 100;
            ctx.fillRect(10, 10 + (100 - fuelHeight), 20, fuelHeight);

            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Inter';
            ctx.fillText('Fuel', 10, 125);
            ctx.fillText(`${Math.round(rocket.fuel)}%`, 10, 140);
        }

        function animate() {
            if (rocket.thrust > 0 && rocket.fuel > 0) {
                rocket.y -= rocket.thrust;
                rocket.fuel -= 0.5;

                // Add exhaust particles
                for (let i = 0; i < 3; i++) {
                    exhaustParticles.push(new ExhaustParticle(
                        rocket.x + Math.random() * rocket.width,
                        rocket.y + rocket.height
                    ));
                }
            }

            // Gravity
            if (rocket.y < canvas.height - 100) {
                rocket.y += 0.5;
            }

            drawRocket();
            requestAnimationFrame(animate);
        }

        // Launch button event
        document.getElementById('launch-rocket').addEventListener('click', () => {
            if (rocket.fuel > 0) {
                rocket.thrust = 2;
            }
        });

        // Reset rocket when it goes too high
        setInterval(() => {
            if (rocket.y < -100) {
                rocket.y = canvas.height - 100;
                rocket.fuel = 100;
                rocket.thrust = 0;
            }
        }, 1000);

        // Initialize canvas
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        drawRocket();
        animate();

        window.addEventListener('resize', () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            drawRocket();
        });
    }

    initProjectileSimulation() {
        const canvas = document.getElementById('projectile-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const g = 9.8; // gravity m/s²
        let projectile = { x: 50, y: canvas.height - 100, radius: 10, vx: 20, vy: 0, launched: false, trail: [] };
        let time = 0;

        const velocitySlider = document.getElementById('proj-velocity-slider');
        const angleSlider = document.getElementById('proj-angle-slider');
        const velocityValue = document.getElementById('proj-velocity');
        const angleValue = document.getElementById('proj-angle');
        const maxHeightEl = document.getElementById('max-height');
        const rangeEl = document.getElementById('range');
        const flightTimeEl = document.getElementById('flight-time');

        function calculateTrajectory(v0, angle) {
            const angleRad = angle * Math.PI / 180;
            const v0x = v0 * Math.cos(angleRad);
            const v0y = v0 * Math.sin(angleRad);
            const flightTime = (2 * v0y) / g;
            const maxHeight = (v0y * v0y) / (2 * g);
            const range = v0x * flightTime;

            return { v0x, v0y, flightTime, maxHeight, range };
        }

        function updateDisplay(v0, angle) {
            const { flightTime, maxHeight, range } = calculateTrajectory(v0, angle);
            maxHeightEl.textContent = `${maxHeight.toFixed(1)} m`;
            rangeEl.textContent = `${range.toFixed(1)} m`;
            flightTimeEl.textContent = `${flightTime.toFixed(1)} s`;
        }

        function drawProjectile() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw ground
            ctx.fillStyle = '#4b5563';
            ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

            // Draw trajectory path
            if (projectile.trail.length > 1) {
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
                ctx.lineWidth = 2;
                ctx.moveTo(projectile.trail[0].x, projectile.trail[0].y);
                
                for (let i = 1; i < projectile.trail.length; i++) {
                    ctx.lineTo(projectile.trail[i].x, projectile.trail[i].y);
                }
                ctx.stroke();
            }

            // Draw trail dots
            projectile.trail.forEach(point => {
                ctx.fillStyle = 'rgba(245, 158, 11, 0.5)';
                ctx.beginPath();
                ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw projectile
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
            ctx.fill();

            // Draw velocity vector if launched
            if (projectile.launched) {
                ctx.beginPath();
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 2;
                ctx.moveTo(projectile.x, projectile.y);
                ctx.lineTo(
                    projectile.x + projectile.vx * 2,
                    projectile.y + projectile.vy * 2
                );
                ctx.stroke();
            }
        }

        function animate() {
            if (projectile.launched) {
                time += 0.016; // 60fps

                projectile.x += projectile.vx * 0.016;
                projectile.y -= projectile.vy * 0.016;
                projectile.vy -= g * 0.016;

                // Add to trail (every few frames)
                if (time % 0.1 < 0.016) {
                    projectile.trail.push({ x: projectile.x, y: projectile.y });
                }

                // Reset when hits ground
                if (projectile.y > canvas.height - 50 - projectile.radius) {
                    projectile.launched = false;
                    projectile.trail = [];
                    time = 0;
                }
            }

            drawProjectile();
            requestAnimationFrame(animate);
        }

        // Initialize
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        updateDisplay(velocitySlider.value, angleSlider.value);
        drawProjectile();
        animate();

        // Event listeners
        velocitySlider.addEventListener('input', () => {
            const v0 = parseInt(velocitySlider.value);
            const angle = parseInt(angleSlider.value);
            velocityValue.textContent = v0;
            updateDisplay(v0, angle);
        });

        angleSlider.addEventListener('input', () => {
            const v0 = parseInt(velocitySlider.value);
            const angle = parseInt(angleSlider.value);
            angleValue.textContent = angle;
            updateDisplay(v0, angle);
        });

        document.getElementById('fire-projectile').addEventListener('click', () => {
            const v0 = parseInt(velocitySlider.value);
            const angle = parseInt(angleSlider.value);
            const angleRad = angle * Math.PI / 180;
            
            projectile.x = 50;
            projectile.y = canvas.height - 100;
            projectile.vx = v0 * Math.cos(angleRad);
            projectile.vy = v0 * Math.sin(angleRad);
            projectile.launched = true;
            projectile.trail = [{ x: projectile.x, y: projectile.y }];
            time = 0;
        });

        document.getElementById('reset-projectile').addEventListener('click', () => {
            projectile.x = 50;
            projectile.y = canvas.height - 100;
            projectile.launched = false;
            projectile.trail = [];
            time = 0;
        });

        window.addEventListener('resize', () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            drawProjectile();
        });
    }

    initPendulumSimulation() {
        const canvas = document.getElementById('pendulum-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const g = 9.8;
        let pendulum = {
            angle: 30 * Math.PI / 180,
            angularVelocity: 0,
            length: 2,
            bobRadius: 15,
            pivot: { x: 0, y: 0 },
            bob: { x: 0, y: 0 },
            animating: false,
            startTime: 0
        };

        const lengthSlider = document.getElementById('pend-length-slider');
        const angleSlider = document.getElementById('pend-angle-slider');
        const lengthValue = document.getElementById('pend-length');
        const angleValue = document.getElementById('pend-angle');
        const periodDisplay = document.getElementById('period-display');
        const frequencyDisplay = document.getElementById('frequency-display');

        function calculatePendulum() {
            // Small angle approximation period
            const period = 2 * Math.PI * Math.sqrt(pendulum.length / g);
            const frequency = 1 / period;
            
            periodDisplay.textContent = `${period.toFixed(2)} s`;
            frequencyDisplay.textContent = `${frequency.toFixed(2)} Hz`;
        }

        function updatePendulum() {
            pendulum.pivot.x = canvas.width / 2;
            pendulum.pivot.y = 50;
            
            pendulum.bob.x = pendulum.pivot.x + pendulum.length * 50 * Math.sin(pendulum.angle);
            pendulum.bob.y = pendulum.pivot.y + pendulum.length * 50 * Math.cos(pendulum.angle);
        }

        function drawPendulum() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw ceiling
            ctx.fillStyle = '#4b5563';
            ctx.fillRect(0, 0, canvas.width, 60);

            // Draw pivot
            ctx.fillStyle = '#9ca3af';
            ctx.beginPath();
            ctx.arc(pendulum.pivot.x, pendulum.pivot.y, 8, 0, Math.PI * 2);
            ctx.fill();

            // Draw string
            ctx.strokeStyle = '#d1d5db';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(pendulum.pivot.x, pendulum.pivot.y);
            ctx.lineTo(pendulum.bob.x, pendulum.bob.y);
            ctx.stroke();

            // Draw bob
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(pendulum.bob.x, pendulum.bob.y, pendulum.bobRadius, 0, Math.PI * 2);
            ctx.fill();

            // Draw angle arc
            if (pendulum.angle !== 0) {
                ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(pendulum.pivot.x, pendulum.pivot.y, 30, -Math.PI/2, -Math.PI/2 - pendulum.angle, pendulum.angle > 0);
                ctx.stroke();

                // Angle label
                ctx.fillStyle = '#f59e0b';
                ctx.font = '14px Inter';
                ctx.fillText(
                    `${Math.abs(Math.round(pendulum.angle * 180 / Math.PI))}°`,
                    pendulum.pivot.x + 20,
                    pendulum.pivot.y - 10
                );
            }

            // Draw length label
            ctx.fillStyle = '#9ca3af';
            ctx.font = '12px Inter';
            ctx.fillText(
                `L = ${pendulum.length}m`,
                pendulum.pivot.x - 20,
                pendulum.pivot.y + pendulum.length * 25
            );
        }

        function animatePendulum(timestamp) {
            if (!pendulum.startTime) pendulum.startTime = timestamp;
            const elapsed = (timestamp - pendulum.startTime) / 1000;

            if (pendulum.animating) {
                // Numerical integration using Euler method
                const angularAcceleration = -(g / pendulum.length) * Math.sin(pendulum.angle);
                pendulum.angularVelocity += angularAcceleration * 0.016;
                pendulum.angle += pendulum.angularVelocity * 0.016;

                // Damping
                pendulum.angularVelocity *= 0.999;
            }

            updatePendulum();
            drawPendulum();

            if (pendulum.animating) {
                requestAnimationFrame(animatePendulum);
            }
        }

        // Initialize
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        updatePendulum();
        calculatePendulum();
        drawPendulum();

        // Event listeners
        lengthSlider.addEventListener('input', () => {
            pendulum.length = parseFloat(lengthSlider.value);
            lengthValue.textContent = pendulum.length;
            calculatePendulum();
            updatePendulum();
            drawPendulum();
        });

        angleSlider.addEventListener('input', () => {
            pendulum.angle = parseFloat(angleSlider.value) * Math.PI / 180;
            angleValue.textContent = angleSlider.value;
            updatePendulum();
            drawPendulum();
        });

        document.getElementById('start-pendulum').addEventListener('click', () => {
            if (!pendulum.animating) {
                pendulum.animating = true;
                pendulum.startTime = 0;
                requestAnimationFrame(animatePendulum);
            }
        });

        document.getElementById('stop-pendulum').addEventListener('click', () => {
            pendulum.animating = false;
            pendulum.angularVelocity = 0;
        });

        window.addEventListener('resize', () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            updatePendulum();
            drawPendulum();
        });
    }
}

// Initialize simulations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.classicalSims = new ClassicalMechanicsSimulations();
});