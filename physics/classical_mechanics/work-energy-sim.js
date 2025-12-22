// work-energy-sim.js
// Interactive simulations for Work, Energy, and Power

class WorkEnergySimulations {
    constructor() {
        this.simulations = {
            work: null,
            kineticEnergy: null,
            energyConversion: null,
            power: null,
            pendulum: null,
            spring: null
        };
        this.init();
    }

    init() {
        this.initWorkSimulation();
        this.initKineticEnergySimulation();
        this.initEnergyConversionSimulation();
        this.initPowerSimulation();
        this.initPendulumSimulation();
        this.initSpringSimulation();
        this.bindEvents();
        this.setupCanvasResizeListeners();
    }

    bindEvents() {
        // Bind global events if needed
    }

    setupCanvasResizeListeners() {
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    handleResize() {
        // Handle all canvas resizes
        this.resizeCanvas('work-canvas');
        this.resizeCanvas('kinetic-energy-canvas');
        this.resizeCanvas('energy-conversion-canvas');
        this.resizeCanvas('power-canvas');
        this.resizeCanvas('pendulum-canvas');
        this.resizeCanvas('spring-canvas');
    }

    resizeCanvas(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (canvas) {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }
    }

    // ===================== WORK SIMULATION =====================
    initWorkSimulation() {
        const canvas = document.getElementById('work-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        this.resizeCanvas('work-canvas');

        let box = {
            x: 50,
            y: canvas.height - 100,
            width: 60,
            height: 40,
            force: 50,
            angle: 0,
            distance: 10,
            moving: false,
            progress: 0
        };

        // Calculate work
        const calculateWork = () => {
            const forceComponent = box.force * Math.cos(box.angle * Math.PI / 180);
            const work = forceComponent * box.distance;
            
            document.getElementById('work-result').textContent = `${work.toFixed(1)} J`;
            document.getElementById('force-component').textContent = `${forceComponent.toFixed(1)} N`;
            document.getElementById('effectiveness').textContent = `${Math.abs(Math.cos(box.angle * Math.PI / 180) * 100).toFixed(0)}%`;
            
            return work;
        };

        // Draw function
        const drawBox = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw floor
            ctx.fillStyle = '#374151';
            ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
            
            // Draw distance line
            ctx.strokeStyle = '#9ca3af';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(box.x, box.y + box.height + 20);
            ctx.lineTo(box.x + box.distance * 30, box.y + box.height + 20);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Draw distance label
            ctx.fillStyle = '#9ca3af';
            ctx.font = '12px Inter';
            ctx.fillText(`${box.distance} m`, box.x + (box.distance * 15), box.y + box.height + 35);
            
            // Draw box
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(box.x + box.progress * (box.distance * 30), box.y, box.width, box.height);
            
            // Draw force arrow
            ctx.beginPath();
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 3;
            const arrowLength = Math.min(box.force * 0.5, 100);
            const arrowX = box.x + box.progress * (box.distance * 30) + box.width / 2;
            const arrowY = box.y + box.height / 2;
            
            // Calculate force components
            const forceX = arrowLength * Math.cos(box.angle * Math.PI / 180);
            const forceY = arrowLength * Math.sin(box.angle * Math.PI / 180);
            
            ctx.moveTo(arrowX, arrowY);
            ctx.lineTo(arrowX + forceX, arrowY - forceY);
            ctx.stroke();
            
            // Arrow head
            ctx.beginPath();
            ctx.fillStyle = '#ef4444';
            ctx.moveTo(arrowX + forceX, arrowY - forceY);
            if (box.angle >= 0) {
                ctx.lineTo(arrowX + forceX - 10, arrowY - forceY + 5);
                ctx.lineTo(arrowX + forceX - 10, arrowY - forceY - 5);
            } else {
                ctx.lineTo(arrowX + forceX + 10, arrowY - forceY + 5);
                ctx.lineTo(arrowX + forceX + 10, arrowY - forceY - 5);
            }
            ctx.closePath();
            ctx.fill();
            
            // Draw force label
            ctx.fillStyle = '#ef4444';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(`${box.force} N`, arrowX + forceX/2, arrowY - forceY/2 - 10);
            
            // Draw angle arc
            if (box.angle !== 0) {
                ctx.beginPath();
                ctx.strokeStyle = '#f59e0b';
                ctx.lineWidth = 2;
                const radius = 30;
                const startAngle = 0;
                const endAngle = box.angle * Math.PI / 180;
                ctx.arc(arrowX, arrowY, radius, startAngle, endAngle);
                ctx.stroke();
                
                // Angle label
                ctx.fillStyle = '#f59e0b';
                ctx.font = '12px Inter';
                ctx.fillText(`${box.angle}°`, arrowX + 20, arrowY - 20);
            }
        };

        // Animation loop
        let animationId = null;
        const animateWork = () => {
            if (box.moving && box.progress < 1) {
                box.progress += 0.02;
                if (box.progress > 1) box.progress = 1;
                
                drawBox();
                animationId = requestAnimationFrame(animateWork);
            } else if (box.progress >= 1) {
                box.moving = false;
            }
        };

        // Calculate work button
        document.getElementById('calculate-work')?.addEventListener('click', () => {
            box.moving = true;
            box.progress = 0;
            calculateWork();
            
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            animateWork();
        });

        // Reset button
        document.getElementById('reset-work')?.addEventListener('click', () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            
            box.moving = false;
            box.progress = 0;
            drawBox();
            calculateWork();
        });

        // Update force
        document.getElementById('force-slider-work')?.addEventListener('input', (e) => {
            box.force = parseInt(e.target.value);
            document.getElementById('force-value-work').textContent = box.force;
            calculateWork();
            drawBox();
        });

        // Update angle
        document.getElementById('angle-slider-work')?.addEventListener('input', (e) => {
            box.angle = parseInt(e.target.value);
            document.getElementById('angle-value-work').textContent = box.angle;
            calculateWork();
            drawBox();
        });

        // Update distance
        document.getElementById('distance-slider-work')?.addEventListener('input', (e) => {
            box.distance = parseInt(e.target.value);
            document.getElementById('distance-value-work').textContent = box.distance;
            calculateWork();
            drawBox();
        });

        // Initial draw and calculation
        calculateWork();
        drawBox();
    }

    // ===================== KINETIC ENERGY SIMULATION =====================
    initKineticEnergySimulation() {
        const canvas = document.getElementById('kinetic-energy-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        this.resizeCanvas('kinetic-energy-canvas');

        let ball = {
            x: 100,
            y: canvas.height - 100,
            radius: 25,
            mass: 5,
            velocity: 0,
            maxVelocity: 20,
            color: '#ef4444'
        };

        // Calculate kinetic energy
        const calculateKE = () => {
            const ke = 0.5 * ball.mass * ball.velocity * ball.velocity;
            document.getElementById('ke-display').textContent = `${ke.toFixed(1)} J`;
            document.getElementById('velocity-display').textContent = `${ball.velocity.toFixed(1)} m/s`;
            return ke;
        };

        // Draw function
        const drawBall = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw track
            ctx.fillStyle = '#4b5563';
            ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
            
            // Draw ball
            ctx.fillStyle = ball.color;
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw ball outline
            ctx.strokeStyle = '#991b1b';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Draw velocity arrow
            if (ball.velocity > 0) {
                ctx.beginPath();
                ctx.strokeStyle = '#f59e0b';
                ctx.lineWidth = 3;
                const arrowLength = Math.min(ball.velocity * 10, 150);
                ctx.moveTo(ball.x + ball.radius + 10, ball.y);
                ctx.lineTo(ball.x + ball.radius + 10 + arrowLength, ball.y);
                ctx.stroke();
                
                // Arrow head
                ctx.beginPath();
                ctx.fillStyle = '#f59e0b';
                ctx.moveTo(ball.x + ball.radius + 10 + arrowLength, ball.y);
                ctx.lineTo(ball.x + ball.radius + 10 + arrowLength - 10, ball.y - 5);
                ctx.lineTo(ball.x + ball.radius + 10 + arrowLength - 10, ball.y + 5);
                ctx.closePath();
                ctx.fill();
                
                // Velocity label
                ctx.fillStyle = '#f59e0b';
                ctx.font = '12px Inter';
                ctx.fillText(`${ball.velocity.toFixed(1)} m/s`, ball.x + ball.radius + 10 + arrowLength/2, ball.y - 15);
            }
            
            // Draw mass label
            ctx.fillStyle = '#ffffff';
            ctx.font = '14px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(`${ball.mass} kg`, ball.x, ball.y - ball.radius - 10);
            
            // Draw KE equation
            ctx.fillStyle = '#ef4444';
            ctx.font = '16px Inter';
            ctx.textAlign = 'left';
            ctx.fillText(`KE = ½ × ${ball.mass} × ${ball.velocity.toFixed(1)}²`, 10, 30);
            ctx.fillText(`= ${(0.5 * ball.mass * ball.velocity * ball.velocity).toFixed(1)} J`, 10, 50);
        };

        // Animation loop
        let animationId = null;
        const animateBall = () => {
            if (ball.velocity > 0) {
                ball.x += ball.velocity * 0.5;
                
                // Apply friction
                ball.velocity *= 0.99;
                
                // Reset if off screen
                if (ball.x > canvas.width + ball.radius) {
                    ball.x = -ball.radius;
                }
                
                // Stop if velocity is very small
                if (ball.velocity < 0.1) {
                    ball.velocity = 0;
                }
                
                calculateKE();
                drawBall();
                animationId = requestAnimationFrame(animateBall);
            }
        };

        // Accelerate button
        document.getElementById('accelerate-object')?.addEventListener('click', () => {
            if (ball.velocity < ball.maxVelocity) {
                ball.velocity += 5;
                calculateKE();
                
                if (!animationId) {
                    animateBall();
                }
            }
        });

        // Brake button
        document.getElementById('brake-object')?.addEventListener('click', () => {
            ball.velocity = Math.max(0, ball.velocity - 5);
            calculateKE();
        });

        // Update mass
        document.getElementById('mass-slider-ke')?.addEventListener('input', (e) => {
            ball.mass = parseInt(e.target.value);
            document.getElementById('mass-value-ke').textContent = ball.mass;
            calculateKE();
            drawBall();
        });

        // Update velocity directly
        document.getElementById('velocity-slider-ke')?.addEventListener('input', (e) => {
            ball.velocity = parseInt(e.target.value);
            document.getElementById('velocity-value-ke').textContent = ball.velocity;
            calculateKE();
            drawBall();
        });

        // Initial draw and calculation
        calculateKE();
        drawBall();
    }

    // ===================== ENERGY CONVERSION SIMULATION =====================
    initEnergyConversionSimulation() {
        const canvas = document.getElementById('energy-conversion-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        this.resizeCanvas('energy-conversion-canvas');

        let ball = {
            x: canvas.width / 2,
            y: 50,
            radius: 15,
            mass: 5,
            velocity: 0,
            height: 10,
            falling: false,
            energyLoss: 0.1,
            maxHeight: 0,
            bounces: 0
        };

        // Calculate energies
        const calculateEnergies = () => {
            const g = 9.8;
            const heightFromBottom = canvas.height - 50 - ball.y;
            const pe = ball.mass * g * heightFromBottom;
            const ke = 0.5 * ball.mass * ball.velocity * ball.velocity;
            const totalEnergy = pe + ke;
            
            // Calculate percentages
            const pePercent = (pe / totalEnergy) * 100 || 0;
            const kePercent = (ke / totalEnergy) * 100 || 0;
            
            // Update displays
            document.getElementById('ke-value').textContent = `${ke.toFixed(1)} J`;
            document.getElementById('pe-value').textContent = `${pe.toFixed(1)} J`;
            document.getElementById('ke-percentage').textContent = `${kePercent.toFixed(0)}%`;
            document.getElementById('pe-percentage').textContent = `${pePercent.toFixed(0)}%`;
            
            // Update bars
            document.getElementById('ke-bar').style.width = `${kePercent}%`;
            document.getElementById('pe-bar').style.width = `${pePercent}%`;
            
            return { pe, ke, totalEnergy };
        };

        // Draw function
        const drawFallingBall = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw ground
            ctx.fillStyle = '#374151';
            ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
            
            // Draw height scale
            ctx.strokeStyle = '#6b7280';
            ctx.lineWidth = 1;
            for (let i = 0; i <= ball.height; i++) {
                const y = canvas.height - 50 - (i * ((canvas.height - 100) / ball.height));
                ctx.beginPath();
                ctx.moveTo(20, y);
                ctx.lineTo(40, y);
                ctx.stroke();
                
                ctx.fillStyle = '#6b7280';
                ctx.font = '10px Inter';
                ctx.fillText(`${i} m`, 10, y + 3);
            }
            
            // Draw ball
            const gradient = ctx.createRadialGradient(
                ball.x, ball.y - ball.radius/2,
                0,
                ball.x, ball.y,
                ball.radius
            );
            gradient.addColorStop(0, '#10b981');
            gradient.addColorStop(1, '#047857');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw ball outline
            ctx.strokeStyle = '#064e3b';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Draw energy indicators
            const energies = calculateEnergies();
            
            // Draw PE indicator
            if (energies.pe > 0) {
                ctx.fillStyle = '#10b981';
                ctx.font = '12px Inter';
                ctx.textAlign = 'center';
                ctx.fillText(`PE: ${energies.pe.toFixed(1)} J`, ball.x, ball.y - ball.radius - 15);
            }
            
            // Draw KE indicator
            if (energies.ke > 0) {
                ctx.fillStyle = '#ef4444';
                ctx.font = '12px Inter';
                ctx.textAlign = 'center';
                ctx.fillText(`KE: ${energies.ke.toFixed(1)} J`, ball.x, ball.y + ball.radius + 20);
                
                // Draw velocity arrow
                ctx.beginPath();
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 2;
                const arrowLength = Math.min(ball.velocity * 5, 50);
                ctx.moveTo(ball.x, ball.y + ball.radius + 5);
                ctx.lineTo(ball.x, ball.y + ball.radius + 5 + arrowLength);
                ctx.stroke();
                
                // Arrow head
                ctx.beginPath();
                ctx.fillStyle = '#ef4444';
                ctx.moveTo(ball.x, ball.y + ball.radius + 5 + arrowLength);
                ctx.lineTo(ball.x - 5, ball.y + ball.radius + 5 + arrowLength - 10);
                ctx.lineTo(ball.x + 5, ball.y + ball.radius + 5 + arrowLength - 10);
                ctx.closePath();
                ctx.fill();
            }
        };

        // Animation loop
        let animationId = null;
        const animateFalling = () => {
            if (ball.falling) {
                const g = 9.8;
                
                // Update velocity and position
                ball.velocity += g * 0.016;
                ball.y += ball.velocity * 0.016 * 20; // Scale for visualization
                
                // Check if hit ground
                if (ball.y >= canvas.height - 50 - ball.radius) {
                    ball.y = canvas.height - 50 - ball.radius;
                    ball.velocity *= -0.8; // Bounce with energy loss
                    ball.bounces++;
                    
                    // Stop after too many bounces
                    if (ball.bounces > 10 || Math.abs(ball.velocity) < 1) {
                        ball.falling = false;
                        ball.velocity = 0;
                    }
                }
                
                drawFallingBall();
                animationId = requestAnimationFrame(animateFalling);
            }
        };

        // Drop object button
        document.getElementById('drop-object')?.addEventListener('click', () => {
            if (!ball.falling) {
                ball.falling = true;
                ball.velocity = 0;
                ball.y = canvas.height - 50 - (ball.height * ((canvas.height - 100) / ball.height));
                ball.bounces = 0;
                
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
                animateFalling();
            }
        });

        // Reset button
        document.getElementById('reset-energy')?.addEventListener('click', () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            
            ball.falling = false;
            ball.velocity = 0;
            ball.y = canvas.height - 50 - (ball.height * ((canvas.height - 100) / ball.height));
            ball.bounces = 0;
            
            drawFallingBall();
        });

        // Update height
        document.getElementById('height-slider')?.addEventListener('input', (e) => {
            ball.height = parseInt(e.target.value);
            document.getElementById('height-value').textContent = ball.height;
            ball.y = canvas.height - 50 - (ball.height * ((canvas.height - 100) / ball.height));
            drawFallingBall();
        });

        // Update air resistance
        document.getElementById('air-resistance-slider')?.addEventListener('input', (e) => {
            ball.energyLoss = parseFloat(e.target.value);
            document.getElementById('air-resistance-value').textContent = ball.energyLoss.toFixed(2);
        });

        // Initial draw
        ball.y = canvas.height - 50 - (ball.height * ((canvas.height - 100) / ball.height));
        drawFallingBall();
    }

    // ===================== POWER SIMULATION =====================
    initPowerSimulation() {
        const canvas = document.getElementById('power-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        this.resizeCanvas('power-canvas');

        let engine = {
            force: 500,
            velocity: 10,
            angle: 0,
            power: 0,
            efficiency: 0.85
        };

        // Calculate power
        const calculatePower = () => {
            const forceComponent = engine.force * Math.cos(engine.angle * Math.PI / 180);
            engine.power = forceComponent * engine.velocity;
            const horsepower = engine.power / 745.7; // Convert to horsepower
            
            document.getElementById('power-display').textContent = `${engine.power.toFixed(0)} W`;
            document.getElementById('horsepower-display').textContent = `${horsepower.toFixed(1)} hp`;
            
            return { power: engine.power, horsepower };
        };

        // Draw function
        const drawEngine = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw background
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#1e293b');
            gradient.addColorStop(1, '#0f172a');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw engine/vehicle
            const vehicleX = canvas.width / 2 - 60;
            const vehicleY = canvas.height / 2;
            
            // Draw vehicle body
            ctx.fillStyle = '#8b5cf6';
            ctx.fillRect(vehicleX, vehicleY, 120, 60);
            
            // Draw vehicle details
            ctx.fillStyle = '#7c3aed';
            ctx.fillRect(vehicleX + 10, vehicleY - 20, 100, 20); // Cabin
            
            // Draw wheels
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(vehicleX + 20, vehicleY + 60, 25, 15);
            ctx.fillRect(vehicleX + 75, vehicleY + 60, 25, 15);
            
            // Draw force arrow
            ctx.beginPath();
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 4;
            const arrowLength = Math.min(engine.force * 0.2, 100);
            const forceX = arrowLength * Math.cos(engine.angle * Math.PI / 180);
            const forceY = arrowLength * Math.sin(engine.angle * Math.PI / 180);
            
            ctx.moveTo(vehicleX + 120, vehicleY + 30);
            ctx.lineTo(vehicleX + 120 + forceX, vehicleY + 30 - forceY);
            ctx.stroke();
            
            // Arrow head
            ctx.beginPath();
            ctx.fillStyle = '#3b82f6';
            ctx.moveTo(vehicleX + 120 + forceX, vehicleY + 30 - forceY);
            if (engine.angle <= 90) {
                ctx.lineTo(vehicleX + 120 + forceX - 10, vehicleY + 30 - forceY + 5);
                ctx.lineTo(vehicleX + 120 + forceX - 10, vehicleY + 30 - forceY - 5);
            } else {
                ctx.lineTo(vehicleX + 120 + forceX + 10, vehicleY + 30 - forceY + 5);
                ctx.lineTo(vehicleX + 120 + forceX + 10, vehicleY + 30 - forceY - 5);
            }
            ctx.closePath();
            ctx.fill();
            
            // Draw force label
            ctx.fillStyle = '#3b82f6';
            ctx.font = '14px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(`${engine.force} N`, vehicleX + 120 + forceX/2, vehicleY + 30 - forceY/2 - 10);
            
            // Draw velocity arrow
            ctx.beginPath();
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 3;
            const velArrowLength = Math.min(engine.velocity * 10, 150);
            ctx.moveTo(vehicleX + 60, vehicleY - 40);
            ctx.lineTo(vehicleX + 60 + velArrowLength, vehicleY - 40);
            ctx.stroke();
            
            // Velocity arrow head
            ctx.beginPath();
            ctx.fillStyle = '#10b981';
            ctx.moveTo(vehicleX + 60 + velArrowLength, vehicleY - 40);
            ctx.lineTo(vehicleX + 60 + velArrowLength - 10, vehicleY - 40 - 5);
            ctx.lineTo(vehicleX + 60 + velArrowLength - 10, vehicleY - 40 + 5);
            ctx.closePath();
            ctx.fill();
            
            // Velocity label
            ctx.fillStyle = '#10b981';
            ctx.font = '14px Inter';
            ctx.fillText(`${engine.velocity} m/s`, vehicleX + 60 + velArrowLength/2, vehicleY - 55);
            
            // Draw angle if not zero
            if (engine.angle !== 0) {
                ctx.beginPath();
                ctx.strokeStyle = '#f59e0b';
                ctx.lineWidth = 2;
                const radius = 40;
                ctx.arc(vehicleX + 120, vehicleY + 30, radius, 0, engine.angle * Math.PI / 180);
                ctx.stroke();
                
                // Angle label
                ctx.fillStyle = '#f59e0b';
                ctx.font = '12px Inter';
                ctx.fillText(`${engine.angle}°`, vehicleX + 120 + 50, vehicleY + 30 - 25);
            }
            
            // Draw power calculation
            const power = calculatePower();
            ctx.fillStyle = '#ffffff';
            ctx.font = '16px Inter';
            ctx.textAlign = 'left';
            ctx.fillText(`P = F × v × cosθ`, 20, 50);
            ctx.fillText(`= ${engine.force} × ${engine.velocity} × cos(${engine.angle}°)`, 20, 75);
            ctx.fillText(`= ${power.power.toFixed(0)} W`, 20, 100);
            ctx.fillText(`= ${power.horsepower.toFixed(1)} hp`, 20, 125);
        };

        // Calculate power button
        document.getElementById('calculate-power')?.addEventListener('click', () => {
            calculatePower();
            drawEngine();
        });

        // Update force
        document.getElementById('force-slider-power')?.addEventListener('input', (e) => {
            engine.force = parseInt(e.target.value);
            document.getElementById('force-value-power').textContent = engine.force;
            calculatePower();
            drawEngine();
        });

        // Update velocity
        document.getElementById('velocity-slider-power')?.addEventListener('input', (e) => {
            engine.velocity = parseInt(e.target.value);
            document.getElementById('velocity-value-power').textContent = engine.velocity;
            calculatePower();
            drawEngine();
        });

        // Update angle
        document.getElementById('angle-slider-power')?.addEventListener('input', (e) => {
            engine.angle = parseInt(e.target.value);
            document.getElementById('angle-value-power').textContent = engine.angle;
            calculatePower();
            drawEngine();
        });

        // Initial draw and calculation
        calculatePower();
        drawEngine();
    }

    // ===================== PENDULUM SIMULATION =====================
    initPendulumSimulation() {
        const canvas = document.getElementById('pendulum-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        this.resizeCanvas('pendulum-canvas');

        let pendulum = {
            length: 2, // meters
            mass: 2, // kg
            angle: 30, // degrees
            angularVelocity: 0,
            angularAcceleration: 0,
            pivotX: canvas.width / 2,
            pivotY: 100,
            bobX: 0,
            bobY: 0,
            damping: 0.995,
            running: false,
            time: 0
        };

        // Update pendulum position
        const updatePendulum = () => {
            const angleRad = pendulum.angle * Math.PI / 180;
            pendulum.bobX = pendulum.pivotX + pendulum.length * 50 * Math.sin(angleRad);
            pendulum.bobY = pendulum.pivotY + pendulum.length * 50 * Math.cos(angleRad);
        };

        // Calculate energies
        const calculatePendulumEnergies = () => {
            const g = 9.8;
            const height = pendulum.length * (1 - Math.cos(pendulum.angle * Math.PI / 180));
            const pe = pendulum.mass * g * height;
            const velocity = pendulum.length * pendulum.angularVelocity * (Math.PI / 180);
            const ke = 0.5 * pendulum.mass * velocity * velocity;
            const total = pe + ke;
            
            document.getElementById('pendulum-ke').textContent = `${ke.toFixed(2)} J`;
            document.getElementById('pendulum-pe').textContent = `${pe.toFixed(2)} J`;
            document.getElementById('pendulum-total').textContent = `${total.toFixed(2)} J`;
            
            return { ke, pe, total };
        };

        // Draw function
        const drawPendulum = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw background
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw pivot
            ctx.fillStyle = '#6b7280';
            ctx.beginPath();
            ctx.arc(pendulum.pivotX, pendulum.pivotY, 10, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw string
            ctx.strokeStyle = '#9ca3af';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(pendulum.pivotX, pendulum.pivotY);
            ctx.lineTo(pendulum.bobX, pendulum.bobY);
            ctx.stroke();
            
            // Draw bob
            const gradient = ctx.createRadialGradient(
                pendulum.bobX, pendulum.bobY - 5,
                0,
                pendulum.bobX, pendulum.bobY,
                pendulum.mass * 10
            );
            gradient.addColorStop(0, '#ef4444');
            gradient.addColorStop(1, '#991b1b');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(pendulum.bobX, pendulum.bobY, pendulum.mass * 10, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw bob outline
            ctx.strokeStyle = '#7f1d1d';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(pendulum.bobX, pendulum.bobY, pendulum.mass * 10, 0, Math.PI * 2);
            ctx.stroke();
            
            // Draw angle arc
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2;
            const arcRadius = 30;
            ctx.beginPath();
            ctx.arc(pendulum.pivotX, pendulum.pivotY, arcRadius, 0, pendulum.angle * Math.PI / 180);
            ctx.stroke();
            
            // Draw angle label
            ctx.fillStyle = '#f59e0b';
            ctx.font = '14px Inter';
            ctx.fillText(`${Math.abs(pendulum.angle).toFixed(1)}°`, pendulum.pivotX + 40, pendulum.pivotY - 20);
            
            // Draw velocity indicator
            if (Math.abs(pendulum.angularVelocity) > 0.1) {
                const velocity = pendulum.length * pendulum.angularVelocity * (Math.PI / 180);
                ctx.fillStyle = '#10b981';
                ctx.font = '12px Inter';
                ctx.textAlign = 'center';
                ctx.fillText(`${velocity.toFixed(2)} m/s`, pendulum.bobX, pendulum.bobY - pendulum.mass * 10 - 15);
            }
            
            // Draw energy info
            const energies = calculatePendulumEnergies();
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Inter';
            ctx.textAlign = 'left';
            ctx.fillText(`Length: ${pendulum.length} m`, 10, 30);
            ctx.fillText(`Mass: ${pendulum.mass} kg`, 10, 50);
            ctx.fillText(`Time: ${pendulum.time.toFixed(1)} s`, 10, 70);
        };

        // Animation loop
        let animationId = null;
        const animatePendulum = () => {
            if (pendulum.running) {
                pendulum.time += 0.016;
                
                // Physics calculations
                const g = 9.8;
                const angleRad = pendulum.angle * Math.PI / 180;
                
                // Calculate angular acceleration
                pendulum.angularAcceleration = - (g / pendulum.length) * Math.sin(angleRad) * (180 / Math.PI);
                
                // Update angular velocity and angle
                pendulum.angularVelocity += pendulum.angularAcceleration * 0.016;
                pendulum.angularVelocity *= pendulum.damping; // Apply damping
                pendulum.angle += pendulum.angularVelocity * 0.016;
                
                // Update position
                updatePendulum();
                
                // Stop if energy is very low
                const energies = calculatePendulumEnergies();
                if (energies.total < 0.01) {
                    pendulum.running = false;
                    pendulum.angularVelocity = 0;
                }
                
                drawPendulum();
                animationId = requestAnimationFrame(animatePendulum);
            }
        };

        // Start button
        document.getElementById('start-pendulum')?.addEventListener('click', () => {
            if (!pendulum.running) {
                pendulum.running = true;
                pendulum.time = 0;
                pendulum.angularVelocity = 0;
                updatePendulum();
                
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
                animatePendulum();
            }
        });

        // Reset button
        document.getElementById('reset-pendulum')?.addEventListener('click', () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            
            pendulum.running = false;
            pendulum.angle = 30;
            pendulum.angularVelocity = 0;
            pendulum.time = 0;
            updatePendulum();
            drawPendulum();
        });

        // Update mass
        document.getElementById('pendulum-mass-slider')?.addEventListener('input', (e) => {
            pendulum.mass = parseInt(e.target.value);
            document.getElementById('pendulum-mass').textContent = pendulum.mass;
            updatePendulum();
            drawPendulum();
        });

        // Update length
        document.getElementById('pendulum-length-slider')?.addEventListener('input', (e) => {
            pendulum.length = parseFloat(e.target.value);
            document.getElementById('pendulum-length').textContent = pendulum.length;
            updatePendulum();
            drawPendulum();
        });

        // Update angle
        document.getElementById('pendulum-angle-slider')?.addEventListener('input', (e) => {
            pendulum.angle = parseInt(e.target.value);
            document.getElementById('pendulum-angle').textContent = pendulum.angle;
            updatePendulum();
            drawPendulum();
        });

        // Initial setup
        updatePendulum();
        drawPendulum();
    }

    // ===================== SPRING SIMULATION =====================
    initSpringSimulation() {
        const canvas = document.getElementById('spring-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        this.resizeCanvas('spring-canvas');

        let spring = {
            mass: 1, // kg
            springConstant: 100, // N/m
            compression: 0.2, // m
            velocity: 0,
            position: 0,
            equilibrium: canvas.width / 2,
            amplitude: 0,
            running: false,
            time: 0,
            coils: 15
        };

        // Calculate spring properties
        const calculateSpringProperties = () => {
            const maxVelocity = spring.compression * Math.sqrt(spring.springConstant / spring.mass);
            const pe = 0.5 * spring.springConstant * spring.compression * spring.compression;
            const period = 2 * Math.PI * Math.sqrt(spring.mass / spring.springConstant);
            
            document.getElementById('spring-velocity').textContent = `${maxVelocity.toFixed(2)} m/s`;
            
            return { maxVelocity, pe, period };
        };

        // Draw function
        const drawSpring = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw background
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw fixed wall
            ctx.fillStyle = '#4b5563';
            ctx.fillRect(50, canvas.height/2 - 50, 20, 100);
            
            // Draw spring
            const springLength = 300;
            const startX = 70;
            const startY = canvas.height/2;
            const endX = spring.equilibrium + spring.position * 100; // Scale for visualization
            const endY = canvas.height/2;
            
            // Draw spring coils
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            
            const coilSpacing = (endX - startX) / spring.coils;
            for (let i = 0; i < spring.coils; i++) {
                const x = startX + i * coilSpacing;
                const coilHeight = 30 * Math.sin(i * 0.5);
                ctx.lineTo(x, startY + coilHeight);
            }
            ctx.lineTo(endX, endY);
            ctx.stroke();
            
            // Draw mass
            const massRadius = spring.mass * 8;
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(endX, endY, massRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw mass outline
            ctx.strokeStyle = '#991b1b';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(endX, endY, massRadius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Draw mass label
            ctx.fillStyle = '#ffffff';
            ctx.font = '14px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(`${spring.mass} kg`, endX, endY - massRadius - 10);
            
            // Draw equilibrium line
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(spring.equilibrium, canvas.height/2 - 100);
            ctx.lineTo(spring.equilibrium, canvas.height/2 + 100);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Draw equilibrium label
            ctx.fillStyle = '#10b981';
            ctx.font = '12px Inter';
            ctx.fillText('Equilibrium', spring.equilibrium + 10, canvas.height/2 - 80);
            
            // Draw compression/extenstion indicator
            if (spring.position !== 0) {
                const indicatorX = spring.position > 0 ? spring.equilibrium : endX;
                const indicatorWidth = Math.abs(spring.position * 100);
                
                ctx.strokeStyle = '#f59e0b';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(spring.equilibrium, canvas.height/2 + 80);
                ctx.lineTo(endX, canvas.height/2 + 80);
                ctx.stroke();
                
                // Draw arrow heads
                ctx.beginPath();
                ctx.fillStyle = '#f59e0b';
                if (spring.position > 0) {
                    // Right arrow
                    ctx.moveTo(endX, canvas.height/2 + 80);
                    ctx.lineTo(endX - 10, canvas.height/2 + 75);
                    ctx.lineTo(endX - 10, canvas.height/2 + 85);
                } else {
                    // Left arrow
                    ctx.moveTo(endX, canvas.height/2 + 80);
                    ctx.lineTo(endX + 10, canvas.height/2 + 75);
                    ctx.lineTo(endX + 10, canvas.height/2 + 85);
                }
                ctx.closePath();
                ctx.fill();
                
                // Draw displacement label
                ctx.fillStyle = '#f59e0b';
                ctx.font = '12px Inter';
                ctx.textAlign = 'center';
                ctx.fillText(`${Math.abs(spring.position).toFixed(2)} m`, 
                    spring.equilibrium + spring.position * 50, 
                    canvas.height/2 + 100);
            }
            
            // Draw energy info
            const ke = 0.5 * spring.mass * spring.velocity * spring.velocity;
            const pe = 0.5 * spring.springConstant * spring.position * spring.position;
            
            document.getElementById('spring-ke').textContent = `${ke.toFixed(2)} J`;
            document.getElementById('spring-pe').textContent = `${pe.toFixed(2)} J`;
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Inter';
            ctx.textAlign = 'left';
            ctx.fillText(`k = ${spring.springConstant} N/m`, 10, 30);
            ctx.fillText(`KE = ${ke.toFixed(2)} J`, 10, 50);
            ctx.fillText(`PE = ${pe.toFixed(2)} J`, 10, 70);
        };

        // Animation loop
        let animationId = null;
        const animateSpring = () => {
            if (spring.running) {
                spring.time += 0.016;
                
                // Simple harmonic motion physics
                const omega = Math.sqrt(spring.springConstant / spring.mass);
                spring.position = spring.compression * Math.cos(omega * spring.time);
                spring.velocity = -spring.compression * omega * Math.sin(omega * spring.time);
                
                drawSpring();
                animationId = requestAnimationFrame(animateSpring);
            }
        };

        // Release spring button
        document.getElementById('start-spring')?.addEventListener('click', () => {
            if (!spring.running) {
                spring.running = true;
                spring.time = 0;
                spring.position = spring.compression;
                spring.velocity = 0;
                
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
                animateSpring();
            }
        });

        // Reset button
        document.getElementById('reset-spring')?.addEventListener('click', () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            
            spring.running = false;
            spring.time = 0;
            spring.position = spring.compression;
            spring.velocity = 0;
            drawSpring();
        });

        // Update mass
        document.getElementById('spring-mass-slider')?.addEventListener('input', (e) => {
            spring.mass = parseFloat(e.target.value);
            document.getElementById('spring-mass').textContent = spring.mass;
            calculateSpringProperties();
            drawSpring();
        });

        // Update spring constant
        document.getElementById('spring-constant-slider')?.addEventListener('input', (e) => {
            spring.springConstant = parseInt(e.target.value);
            document.getElementById('spring-constant').textContent = spring.springConstant;
            calculateSpringProperties();
            drawSpring();
        });

        // Update compression
        document.getElementById('spring-compression-slider')?.addEventListener('input', (e) => {
            spring.compression = parseFloat(e.target.value);
            document.getElementById('spring-compression').textContent = spring.compression;
            spring.position = spring.compression;
            calculateSpringProperties();
            drawSpring();
        });

        // Initial setup
        calculateSpringProperties();
        drawSpring();
    }
}

// Initialize simulations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WorkEnergySimulations();
});

// Make class available globally
window.WorkEnergySimulations = WorkEnergySimulations;