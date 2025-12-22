// newtons-laws-sim.js
// Interactive simulations for Newton's Laws of Motion

class NewtonsLawsSimulations {
    constructor() {
        this.simulations = {
            inertia: null,
            fma: null,
            actionReaction: null,
            rocket: null,
            collision: null
        };
        this.init();
    }

    init() {
        this.initInertiaSimulation();
        this.initFMASimulation();
        this.initActionReactionSimulation();
        this.initRocketSimulation();
        this.initCollisionSimulation();
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
        this.resizeCanvas('inertia-canvas');
        this.resizeCanvas('fma-canvas');
        this.resizeCanvas('action-reaction-canvas');
        this.resizeCanvas('rocket-canvas');
        this.resizeCanvas('collision-canvas');
    }

    resizeCanvas(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (canvas) {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }
    }

    // ===================== INERTIA SIMULATION =====================
    initInertiaSimulation() {
        const canvas = document.getElementById('inertia-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        this.resizeCanvas('inertia-canvas');

        let box = {
            x: 50,
            y: canvas.height - 100,
            width: 60,
            height: 40,
            velocity: 0,
            mass: 10,
            friction: 0.1,
            moving: false,
            color: '#3b82f6'
        };

        // Draw function
        const drawBox = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw floor
            ctx.fillStyle = '#374151';
            ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
            
            // Draw box
            ctx.fillStyle = box.color;
            ctx.fillRect(box.x, box.y, box.width, box.height);
            
            // Draw box details
            ctx.strokeStyle = '#1e40af';
            ctx.lineWidth = 2;
            ctx.strokeRect(box.x, box.y, box.width, box.height);
            
            // Draw mass label
            ctx.fillStyle = '#ffffff';
            ctx.font = '14px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(`${box.mass} kg`, box.x + box.width/2, box.y - 10);
            
            // Draw force arrow if moving
            if (box.moving && Math.abs(box.velocity) > 0.1) {
                ctx.beginPath();
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 3;
                const arrowX = box.velocity > 0 ? box.x + box.width + 20 : box.x - 20;
                const arrowLength = Math.min(Math.abs(box.velocity) * 15, 120);
                
                ctx.moveTo(arrowX, box.y + box.height/2);
                ctx.lineTo(
                    box.velocity > 0 ? arrowX + arrowLength : arrowX - arrowLength,
                    box.y + box.height/2
                );
                ctx.stroke();
                
                // Arrow head
                ctx.beginPath();
                ctx.fillStyle = '#ef4444';
                if (box.velocity > 0) {
                    ctx.moveTo(arrowX + arrowLength, box.y + box.height/2);
                    ctx.lineTo(arrowX + arrowLength - 10, box.y + box.height/2 - 5);
                    ctx.lineTo(arrowX + arrowLength - 10, box.y + box.height/2 + 5);
                } else {
                    ctx.moveTo(arrowX - arrowLength, box.y + box.height/2);
                    ctx.lineTo(arrowX - arrowLength + 10, box.y + box.height/2 - 5);
                    ctx.lineTo(arrowX - arrowLength + 10, box.y + box.height/2 + 5);
                }
                ctx.closePath();
                ctx.fill();
                
                // Draw force label
                ctx.fillStyle = '#ef4444';
                ctx.font = '12px Inter';
                ctx.fillText(
                    `${(box.velocity * box.mass).toFixed(1)} N`,
                    arrowX + (box.velocity > 0 ? arrowLength/2 : -arrowLength/2),
                    box.y + box.height/2 - 15
                );
            }
            
            // Draw friction arrow
            if (box.moving && box.velocity !== 0) {
                ctx.beginPath();
                ctx.strokeStyle = '#f59e0b';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                const frictionForce = box.mass * box.friction * 9.8;
                const frictionLength = Math.min(frictionForce * 2, 60);
                
                ctx.moveTo(box.x + box.width/2, box.y + box.height + 10);
                ctx.lineTo(box.x + box.width/2, box.y + box.height + 10 + frictionLength);
                ctx.stroke();
                ctx.setLineDash([]);
                
                // Friction label
                ctx.fillStyle = '#f59e0b';
                ctx.font = '12px Inter';
                ctx.textAlign = 'center';
                ctx.fillText(
                    `${frictionForce.toFixed(1)} N`,
                    box.x + box.width/2,
                    box.y + box.height + 30 + frictionLength
                );
            }
        };

        // Animation loop
        const animate = () => {
            if (box.moving) {
                // Apply friction
                const frictionForce = box.mass * box.friction * 9.8;
                const frictionAcceleration = frictionForce / box.mass;
                
                if (box.velocity > 0) {
                    box.velocity -= frictionAcceleration * 0.016;
                    if (box.velocity < 0) box.velocity = 0;
                } else if (box.velocity < 0) {
                    box.velocity += frictionAcceleration * 0.016;
                    if (box.velocity > 0) box.velocity = 0;
                }
                
                // Update position
                box.x += box.velocity;
                
                // Check boundaries
                if (box.x < 0) {
                    box.x = 0;
                    box.velocity *= -0.5; // Bounce
                }
                if (box.x > canvas.width - box.width) {
                    box.x = canvas.width - box.width;
                    box.velocity *= -0.5;
                }
                
                // Stop if velocity is very small
                if (Math.abs(box.velocity) < 0.1) {
                    box.velocity = 0;
                    box.moving = false;
                }
            }
            
            drawBox();
            requestAnimationFrame(animate);
        };

        // Apply force
        document.getElementById('push-object')?.addEventListener('click', () => {
            const force = 50; // Constant force
            box.velocity = force / box.mass;
            box.moving = true;
            
            // Visual feedback
            const button = document.getElementById('push-object');
            button.classList.add('animate-shake');
            setTimeout(() => {
                button.classList.remove('animate-shake');
            }, 500);
        });

        // Reset
        document.getElementById('reset-inertia')?.addEventListener('click', () => {
            box.x = 50;
            box.velocity = 0;
            box.moving = false;
            drawBox();
        });

        // Update mass from slider
        const massSlider = document.getElementById('mass-slider');
        const massValue = document.getElementById('mass-value');
        if (massSlider && massValue) {
            massSlider.addEventListener('input', (e) => {
                box.mass = parseInt(e.target.value);
                massValue.textContent = box.mass;
                box.y = canvas.height - 100 - (box.mass / 20); // Adjust position based on mass
            });
        }

        // Update friction from slider
        const frictionSlider = document.getElementById('friction-slider');
        const frictionValue = document.getElementById('friction-value');
        if (frictionSlider && frictionValue) {
            frictionSlider.addEventListener('input', (e) => {
                box.friction = parseFloat(e.target.value);
                frictionValue.textContent = box.friction.toFixed(2);
            });
        }

        // Initial draw
        drawBox();
        animate();
    }

    // ===================== F=MA SIMULATION =====================
    initFMASimulation() {
        const canvas = document.getElementById('fma-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        this.resizeCanvas('fma-canvas');

        let car = {
            x: 50,
            y: canvas.height - 80,
            width: 80,
            height: 40,
            velocity: 0,
            mass: 5,
            force: 10,
            acceleration: 0,
            color: '#ef4444'
        };

        // Calculate acceleration
        const calculateAcceleration = () => {
            car.acceleration = car.force / car.mass;
            document.getElementById('force-display').textContent = `${car.force} N`;
            document.getElementById('acceleration-display').textContent = `${car.acceleration.toFixed(1)} m/s²`;
        };

        // Draw function
        const drawCar = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw road
            ctx.fillStyle = '#4b5563';
            ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
            
            // Draw lane markings
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.setLineDash([20, 20]);
            ctx.beginPath();
            ctx.moveTo(0, canvas.height - 25);
            ctx.lineTo(canvas.width, canvas.height - 25);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Draw car body
            ctx.fillStyle = car.color;
            ctx.fillRect(car.x, car.y, car.width, car.height);
            
            // Draw car details
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(car.x + 10, car.y - 10, 60, 10); // Roof
            
            // Draw wheels
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(car.x + 10, car.y + car.height, 15, 10);
            ctx.fillRect(car.x + car.width - 25, car.y + car.height, 15, 10);
            
            // Draw force arrow
            if (car.force > 0) {
                ctx.beginPath();
                ctx.strokeStyle = '#3b82f6';
                ctx.lineWidth = 4;
                const arrowLength = Math.min(car.force * 2, 100);
                ctx.moveTo(car.x + car.width + 10, car.y + car.height/2);
                ctx.lineTo(car.x + car.width + 10 + arrowLength, car.y + car.height/2);
                ctx.stroke();
                
                // Force arrow head
                ctx.beginPath();
                ctx.fillStyle = '#3b82f6';
                ctx.moveTo(car.x + car.width + 10 + arrowLength, car.y + car.height/2);
                ctx.lineTo(car.x + car.width + 10 + arrowLength - 10, car.y + car.height/2 - 5);
                ctx.lineTo(car.x + car.width + 10 + arrowLength - 10, car.y + car.height/2 + 5);
                ctx.closePath();
                ctx.fill();
                
                // Force label
                ctx.fillStyle = '#3b82f6';
                ctx.font = '12px Inter';
                ctx.fillText(
                    `${car.force} N`,
                    car.x + car.width + 10 + arrowLength/2,
                    car.y + car.height/2 - 15
                );
            }
            
            // Draw acceleration arrow
            if (car.acceleration > 0.1) {
                ctx.beginPath();
                ctx.strokeStyle = '#10b981';
                ctx.lineWidth = 3;
                ctx.setLineDash([5, 5]);
                const accelLength = Math.min(car.acceleration * 30, 150);
                ctx.moveTo(car.x + car.width/2, car.y - 10);
                ctx.lineTo(car.x + car.width/2, car.y - 10 - accelLength);
                ctx.stroke();
                ctx.setLineDash([]);
                
                // Acceleration label
                ctx.fillStyle = '#10b981';
                ctx.font = '12px Inter';
                ctx.textAlign = 'center';
                ctx.fillText(
                    `${car.acceleration.toFixed(1)} m/s²`,
                    car.x + car.width/2,
                    car.y - 20 - accelLength
                );
            }
            
            // Draw mass label
            ctx.fillStyle = '#ffffff';
            ctx.font = '14px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(`Mass: ${car.mass} kg`, car.x + car.width/2, car.y - 30);
            
            // Draw velocity indicator
            if (Math.abs(car.velocity) > 0.5) {
                ctx.fillStyle = '#f59e0b';
                ctx.font = '12px Inter';
                ctx.textAlign = 'left';
                ctx.fillText(`Velocity: ${car.velocity.toFixed(1)} m/s`, 10, 20);
            }
        };

        // Animation loop
        const animate = () => {
            // Apply acceleration
            if (car.acceleration > 0) {
                car.velocity += car.acceleration * 0.016;
                car.x += car.velocity;
                
                // Reset if off screen
                if (car.x > canvas.width) {
                    car.x = -car.width;
                    car.velocity = 0;
                }
            }
            
            drawCar();
            requestAnimationFrame(animate);
        };

        // Update force
        const forceSlider = document.getElementById('force-slider-fma');
        const forceValue = document.getElementById('force-value-fma');
        if (forceSlider && forceValue) {
            forceSlider.addEventListener('input', (e) => {
                car.force = parseInt(e.target.value);
                forceValue.textContent = car.force;
                calculateAcceleration();
            });
        }

        // Update mass
        const massSlider = document.getElementById('mass-slider-fma');
        const massValue = document.getElementById('mass-value-fma');
        if (massSlider && massValue) {
            massSlider.addEventListener('input', (e) => {
                car.mass = parseInt(e.target.value);
                massValue.textContent = car.mass;
                calculateAcceleration();
            });
        }

        // Initial calculations
        calculateAcceleration();
        drawCar();
        animate();
    }

    // ===================== ACTION-REACTION SIMULATION =====================
    initActionReactionSimulation() {
        const canvas = document.getElementById('action-reaction-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        this.resizeCanvas('action-reaction-canvas');

        let objects = {
            a: { 
                x: 100, 
                y: canvas.height/2, 
                mass: 5, 
                radius: 30, 
                velocity: 0, 
                color: '#3b82f6',
                name: 'A'
            },
            b: { 
                x: 300, 
                y: canvas.height/2, 
                mass: 10, 
                radius: 40, 
                velocity: 0, 
                color: '#ef4444',
                name: 'B'
            }
        };

        // Update mass displays
        document.getElementById('mass-a').textContent = `${objects.a.mass} kg`;
        document.getElementById('mass-b').textContent = `${objects.b.mass} kg`;

        // Draw function
        const drawObjects = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw surface
            const gradient = ctx.createLinearGradient(0, canvas.height/2 + 50, 0, canvas.height);
            gradient.addColorStop(0, '#374151');
            gradient.addColorStop(1, '#1f2937');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, canvas.height/2 + 50, canvas.width, 50);
            
            // Draw object A with shadow
            ctx.shadowColor = 'rgba(59, 130, 246, 0.5)';
            ctx.shadowBlur = 10;
            ctx.fillStyle = objects.a.color;
            ctx.beginPath();
            ctx.arc(objects.a.x, objects.a.y, objects.a.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Draw object B with shadow
            ctx.shadowColor = 'rgba(239, 68, 68, 0.5)';
            ctx.shadowBlur = 10;
            ctx.fillStyle = objects.b.color;
            ctx.beginPath();
            ctx.arc(objects.b.x, objects.b.y, objects.b.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Draw object outlines
            ctx.strokeStyle = '#1e40af';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(objects.a.x, objects.a.y, objects.a.radius, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.strokeStyle = '#991b1b';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(objects.b.x, objects.b.y, objects.b.radius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Draw labels
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(objects.a.name, objects.a.x, objects.a.y + 5);
            ctx.fillText(objects.b.name, objects.b.x, objects.b.y + 5);
            
            // Draw mass labels
            ctx.font = '14px Inter';
            ctx.fillText(`${objects.a.mass} kg`, objects.a.x, objects.a.y - objects.a.radius - 10);
            ctx.fillText(`${objects.b.mass} kg`, objects.b.x, objects.b.y - objects.b.radius - 10);
            
            // Draw force arrows if moving
            const drawForceArrow = (object, direction) => {
                if (Math.abs(object.velocity) > 0.1) {
                    ctx.beginPath();
                    ctx.strokeStyle = '#10b981';
                    ctx.lineWidth = 3;
                    const force = object.mass * Math.abs(object.velocity) * 10;
                    const arrowLength = Math.min(force, 100);
                    
                    const startX = direction === 'right' 
                        ? object.x + object.radius + 10 
                        : object.x - object.radius - 10;
                    
                    ctx.moveTo(startX, object.y);
                    ctx.lineTo(
                        direction === 'right' ? startX + arrowLength : startX - arrowLength,
                        object.y
                    );
                    ctx.stroke();
                    
                    // Arrow head
                    ctx.beginPath();
                    ctx.fillStyle = '#10b981';
                    if (direction === 'right') {
                        ctx.moveTo(startX + arrowLength, object.y);
                        ctx.lineTo(startX + arrowLength - 10, object.y - 5);
                        ctx.lineTo(startX + arrowLength - 10, object.y + 5);
                    } else {
                        ctx.moveTo(startX - arrowLength, object.y);
                        ctx.lineTo(startX - arrowLength + 10, object.y - 5);
                        ctx.lineTo(startX - arrowLength + 10, object.y + 5);
                    }
                    ctx.closePath();
                    ctx.fill();
                    
                    // Force label
                    ctx.fillStyle = '#10b981';
                    ctx.font = '12px Inter';
                    ctx.textAlign = direction === 'right' ? 'left' : 'right';
                    ctx.fillText(
                        `${(object.mass * Math.abs(object.velocity) * 10).toFixed(1)} N`,
                        direction === 'right' ? startX + arrowLength/2 : startX - arrowLength/2,
                        object.y - 15
                    );
                }
            };
            
            if (objects.a.velocity !== 0) {
                drawForceArrow(objects.a, objects.a.velocity > 0 ? 'right' : 'left');
            }
            if (objects.b.velocity !== 0) {
                drawForceArrow(objects.b, objects.b.velocity > 0 ? 'right' : 'left');
            }
        };

        // Animation loop
        let animationId = null;
        const animate = () => {
            let moving = false;
            
            // Update positions
            objects.a.x += objects.a.velocity;
            objects.b.x += objects.b.velocity;
            
            // Apply air resistance (simplified)
            objects.a.velocity *= 0.995;
            objects.b.velocity *= 0.995;
            
            // Check if still moving
            if (Math.abs(objects.a.velocity) > 0.1 || Math.abs(objects.b.velocity) > 0.1) {
                moving = true;
            }
            
            // Check boundaries
            const leftBoundary = 20;
            const rightBoundary = canvas.width - 20;
            
            if (objects.a.x < leftBoundary + objects.a.radius) {
                objects.a.x = leftBoundary + objects.a.radius;
                objects.a.velocity *= -0.7; // Bounce with energy loss
            }
            if (objects.a.x > rightBoundary - objects.a.radius) {
                objects.a.x = rightBoundary - objects.a.radius;
                objects.a.velocity *= -0.7;
            }
            
            if (objects.b.x < leftBoundary + objects.b.radius) {
                objects.b.x = leftBoundary + objects.b.radius;
                objects.b.velocity *= -0.7;
            }
            if (objects.b.x > rightBoundary - objects.b.radius) {
                objects.b.x = rightBoundary - objects.b.radius;
                objects.b.velocity *= -0.7;
            }
            
            // Check collision
            const dx = objects.b.x - objects.a.x;
            const dy = objects.b.y - objects.a.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = objects.a.radius + objects.b.radius;
            
            if (distance < minDistance) {
                // Calculate collision response (simplified 1D elastic collision)
                const v1 = objects.a.velocity;
                const v2 = objects.b.velocity;
                const m1 = objects.a.mass;
                const m2 = objects.b.mass;
                
                // 1D elastic collision formulas
                const newV1 = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2);
                const newV2 = ((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2);
                
                objects.a.velocity = newV1;
                objects.b.velocity = newV2;
                
                // Separate objects to prevent sticking
                const overlap = minDistance - distance;
                const separation = overlap * 0.5;
                objects.a.x -= (dx / distance) * separation;
                objects.b.x += (dx / distance) * separation;
            }
            
            drawObjects();
            if (moving) {
                animationId = requestAnimationFrame(animate);
            } else {
                if (animationId) {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
            }
        };

        // A pushes B
        document.getElementById('push-a')?.addEventListener('click', () => {
            const force = 100;
            // A pushes B to the right, so A moves left (reaction)
            objects.a.velocity = -force / objects.a.mass;
            objects.b.velocity = force / objects.b.mass;
            
            if (!animationId) {
                animate();
            }
        });

        // B pushes A
        document.getElementById('push-b')?.addEventListener('click', () => {
            const force = 100;
            // B pushes A to the left, so B moves right (reaction)
            objects.a.velocity = force / objects.a.mass;
            objects.b.velocity = -force / objects.b.mass;
            
            if (!animationId) {
                animate();
            }
        });

        // Simulate collision
        document.getElementById('collide-objects')?.addEventListener('click', () => {
            // Reset positions
            objects.a.x = 100;
            objects.b.x = canvas.width - 100;
            
            // Give them opposite velocities
            objects.a.velocity = 3;
            objects.b.velocity = -2;
            
            if (!animationId) {
                animate();
            }
        });

        // Initial draw
        drawObjects();
    }

// ===================== ROCKET SIMULATION =====================
initRocketSimulation() {
    const canvas = document.getElementById('rocket-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    this.resizeCanvas('rocket-canvas');

    let rocket = {
        x: canvas.width/2,
        y: canvas.height - 50,
        width: 40,
        height: 80,
        velocity: 0,
        acceleration: 0,
        thrust: 15000, // 5000 se badhaya (30000 ki jagah 15000 rakh rahe hain)
        fuel: 1000,
        totalMass: 2000,
        dryMass: 1000,
        launched: false,
        exhaustParticles: [],
        maxHeight: 0,
        time: 0
    };

    // Update displays
    const updateDisplays = () => {
        const height = Math.max(0, Math.round(canvas.height - rocket.y - 50));
        rocket.maxHeight = Math.max(rocket.maxHeight, height);
        
        document.getElementById('rocket-height').textContent = `${height} m`;
        document.getElementById('rocket-velocity').textContent = `${rocket.velocity.toFixed(1)} m/s`;
        document.getElementById('rocket-acceleration').textContent = `${rocket.acceleration.toFixed(1)} m/s²`;
        document.getElementById('thrust-value').textContent = rocket.thrust;
        document.getElementById('fuel-value').textContent = rocket.fuel;
    };

    // Draw function
    const drawRocket = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw space background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#0f172a');
        gradient.addColorStop(1, '#1e293b');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw stars
        for (let i = 0; i < 50; i++) {
            const x = (i * 17) % canvas.width;
            const y = (i * 11) % canvas.height;
            const size = 1 + Math.random();
            ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + Math.random() * 0.5})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw rocket body
        const rocketGradient = ctx.createLinearGradient(
            rocket.x - rocket.width/2, rocket.y,
            rocket.x + rocket.width/2, rocket.y + rocket.height
        );
        rocketGradient.addColorStop(0, '#dc2626');
        rocketGradient.addColorStop(1, '#991b1b');
        
        ctx.fillStyle = rocketGradient;
        ctx.fillRect(rocket.x - rocket.width/2, rocket.y, rocket.width, rocket.height);
        
        // Draw rocket nose cone
        ctx.beginPath();
        ctx.moveTo(rocket.x - rocket.width/2, rocket.y);
        ctx.lineTo(rocket.x + rocket.width/2, rocket.y);
        ctx.lineTo(rocket.x, rocket.y - 30);
        ctx.closePath();
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        
        // Draw rocket fins
        ctx.fillStyle = '#b91c1c';
        // Left fin
        ctx.beginPath();
        ctx.moveTo(rocket.x - rocket.width/2, rocket.y + rocket.height);
        ctx.lineTo(rocket.x - rocket.width/2 - 15, rocket.y + rocket.height);
        ctx.lineTo(rocket.x - rocket.width/2, rocket.y + rocket.height - 30);
        ctx.closePath();
        ctx.fill();
        
        // Right fin
        ctx.beginPath();
        ctx.moveTo(rocket.x + rocket.width/2, rocket.y + rocket.height);
        ctx.lineTo(rocket.x + rocket.width/2 + 15, rocket.y + rocket.height);
        ctx.lineTo(rocket.x + rocket.width/2, rocket.y + rocket.height - 30);
        ctx.closePath();
        ctx.fill();
        
        // Draw window
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(rocket.x, rocket.y + 30, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw exhaust
        if (rocket.launched && rocket.fuel > 0) {
            // Main flame
            const flameGradient = ctx.createRadialGradient(
                rocket.x, rocket.y + rocket.height + 20,
                0,
                rocket.x, rocket.y + rocket.height + 40,
                30
            );
            flameGradient.addColorStop(0, 'rgba(255, 255, 100, 0.9)');
            flameGradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.7)');
            flameGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
            
            ctx.fillStyle = flameGradient;
            ctx.beginPath();
            ctx.ellipse(
                rocket.x, rocket.y + rocket.height + 40,
                15, 40, 0, 0, Math.PI * 2
            );
            ctx.fill();
            
            // Exhaust particles
            rocket.exhaustParticles.forEach((p, i) => {
                p.y += p.velocity;
                p.x += (Math.random() - 0.5) * 2;
                p.life--;
                
                const alpha = p.life / 100;
                ctx.fillStyle = `rgba(255, ${p.color}, 0, ${alpha})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                
                if (p.life <= 0) {
                    rocket.exhaustParticles.splice(i, 1);
                }
            });
            
            // Add new particles
            if (Math.random() > 0.2) {
                for (let i = 0; i < 3; i++) {
                    rocket.exhaustParticles.push({
                        x: rocket.x + (Math.random() - 0.5) * 20,
                        y: rocket.y + rocket.height,
                        velocity: 5 + Math.random() * 5,
                        size: 2 + Math.random() * 4,
                        color: 100 + Math.random() * 155,
                        life: 30 + Math.random() * 40
                    });
                }
            }
        }
        
        // Draw fuel gauge
        ctx.fillStyle = '#374151';
        ctx.fillRect(20, 20, 20, 100);
        ctx.fillStyle = '#10b981';
        const fuelHeight = (rocket.fuel / 1000) * 100;
        ctx.fillRect(20, 20 + (100 - fuelHeight), 20, fuelHeight);
        
        // Draw gauge border
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, 20, 20, 100);
        
        // Draw fuel label
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Inter';
        ctx.fillText('FUEL', 15, 140);
        ctx.fillText(`${Math.round(rocket.fuel)} kg`, 15, 160);
        
        // Draw info panel
        ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
        ctx.fillRect(canvas.width - 150, 20, 130, 100);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Inter';
        ctx.textAlign = 'left';
        ctx.fillText(`Height: ${Math.round(canvas.height - rocket.y - 50)} m`, canvas.width - 140, 45);
        ctx.fillText(`Velocity: ${rocket.velocity.toFixed(1)} m/s`, canvas.width - 140, 65);
        ctx.fillText(`Accel: ${rocket.acceleration.toFixed(1)} m/s²`, canvas.width - 140, 85);
        ctx.fillText(`Time: ${rocket.time.toFixed(1)} s`, canvas.width - 140, 105);
    };

    // Animation loop
    let animationId = null;
    const animateRocket = () => {
        if (rocket.launched && rocket.fuel > 0 && rocket.y > 0) {
            rocket.time += 0.016;
            
            // Calculate current mass (fuel burning)
            const fuelBurnRate = 20; // kg per second
            rocket.fuel = Math.max(0, rocket.fuel - fuelBurnRate * 0.016);
            const currentMass = rocket.dryMass + rocket.fuel;
            
            // Calculate net force (thrust - gravity)
            const gravityForce = currentMass * 9.8;
            const netForce = rocket.thrust - gravityForce;
            rocket.acceleration = netForce / currentMass;
            
            // Debug info - rocket upar jaane ke liye positive acceleration hona chahiye
            console.log(`Thrust: ${rocket.thrust}, Gravity: ${gravityForce.toFixed(1)}, Net: ${netForce.toFixed(1)}, Acc: ${rocket.acceleration.toFixed(1)}`);
            
            // Update velocity and position
            // Positive acceleration = upar ki taraf (y decrease)
            rocket.velocity += rocket.acceleration * 0.016;
            rocket.y -= rocket.velocity * 0.016;
            
            // Stop if rocket goes above canvas
            if (rocket.y < -rocket.height) {
                rocket.y = -rocket.height;
                rocket.launched = false;
            }
            
            updateDisplays();
            drawRocket();
            animationId = requestAnimationFrame(animateRocket);
        } else if (rocket.launched && rocket.fuel <= 0) {
            // Fuel khatam ho gaya, ab gravity ke effect me
            rocket.time += 0.016;
            
            // Sirf gravity ka effect
            rocket.acceleration = -9.8; // Niche ki taraf gravity
            rocket.velocity += rocket.acceleration * 0.016;
            
            // Rocket neeche aaye (y increase)
            rocket.y -= rocket.velocity * 0.016;
            
            // Ground tak pahunchne ke baad stop
            if (rocket.y >= canvas.height - 50) {
                rocket.y = canvas.height - 50;
                rocket.velocity = 0;
                rocket.launched = false;
            }
            
            updateDisplays();
            drawRocket();
            animationId = requestAnimationFrame(animateRocket);
        } else if (rocket.launched) {
            // Any other case
            updateDisplays();
            drawRocket();
        }
    };

    // Launch rocket
    document.getElementById('launch-rocket')?.addEventListener('click', () => {
        if (!rocket.launched) {
            rocket.launched = true;
            rocket.velocity = 0;
            rocket.time = 0;
            rocket.y = canvas.height - 50;
            rocket.exhaustParticles = [];
            
            // Slider ki values update karo
            const thrustSlider = document.getElementById('thrust-slider');
            const fuelSlider = document.getElementById('fuel-slider');
            
            if (thrustSlider) thrustSlider.value = rocket.thrust;
            if (fuelSlider) fuelSlider.value = rocket.fuel;
            
            updateDisplays();
            animateRocket();
            
            // Button feedback
            const button = document.getElementById('launch-rocket');
            button.classList.add('animate-pulse-glow');
        }
    });

    // Reset rocket
    document.getElementById('reset-rocket')?.addEventListener('click', () => {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        
        rocket.launched = false;
        rocket.y = canvas.height - 50;
        rocket.velocity = 0;
        rocket.acceleration = 0;
        rocket.time = 0;
        rocket.exhaustParticles = [];
        rocket.fuel = 1000;
        rocket.thrust = 15000;
        
        // Slider reset karo
        const thrustSlider = document.getElementById('thrust-slider');
        const fuelSlider = document.getElementById('fuel-slider');
        
        if (thrustSlider) {
            thrustSlider.value = rocket.thrust;
            thrustSlider.min = 10000;
            thrustSlider.max = 30000;
        }
        if (fuelSlider) fuelSlider.value = rocket.fuel;
        
        updateDisplays();
        drawRocket();
        
        // Remove button animation
        const button = document.getElementById('launch-rocket');
        button.classList.remove('animate-pulse-glow');
    });

    // Update thrust - HTML me slider range badhani padegi
    const thrustSlider = document.getElementById('thrust-slider');
    if (thrustSlider) {
        // Slider range adjust karo
        thrustSlider.min = 10000;
        thrustSlider.max = 30000;
        thrustSlider.value = rocket.thrust;
        
        thrustSlider.addEventListener('input', (e) => {
            rocket.thrust = parseInt(e.target.value);
            document.getElementById('thrust-value').textContent = rocket.thrust;
        });
    }

    // Update fuel
    const fuelSlider = document.getElementById('fuel-slider');
    if (fuelSlider) {
        fuelSlider.value = rocket.fuel;
        fuelSlider.addEventListener('input', (e) => {
            rocket.fuel = parseInt(e.target.value);
            document.getElementById('fuel-value').textContent = rocket.fuel;
        });
    }

    // Initial draw
    updateDisplays();
    drawRocket();
}

    // ===================== COLLISION SIMULATION =====================
    initCollisionSimulation() {
        const canvas = document.getElementById('collision-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        this.resizeCanvas('collision-canvas');

        let objects = {
            ball1: {
                x: 100,
                y: canvas.height/2,
                radius: 25,
                mass: 5,
                velocity: 10,
                color: '#3b82f6',
                name: 'Ball 1'
            },
            ball2: {
                x: canvas.width - 100,
                y: canvas.height/2,
                radius: 35,
                mass: 10,
                velocity: 0,
                color: '#ef4444',
                name: 'Ball 2'
            }
        };

        let collisionOccurred = false;
        let momentumBefore = 0;
        let momentumAfter = 0;

        // Calculate momentum
        const calculateMomentum = () => {
            momentumBefore = objects.ball1.mass * objects.ball1.velocity + 
                            objects.ball2.mass * objects.ball2.velocity;
            document.getElementById('momentum-before').textContent = `${momentumBefore.toFixed(1)} kg·m/s`;
        };

        // Draw function
        const drawBalls = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw track
            ctx.fillStyle = '#374151';
            ctx.fillRect(0, canvas.height/2 - 5, canvas.width, 10);
            
            // Draw ball 1 with shadow
            ctx.shadowColor = 'rgba(59, 130, 246, 0.5)';
            ctx.shadowBlur = 10;
            ctx.fillStyle = objects.ball1.color;
            ctx.beginPath();
            ctx.arc(objects.ball1.x, objects.ball1.y, objects.ball1.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw ball 2 with shadow
            ctx.shadowColor = 'rgba(239, 68, 68, 0.5)';
            ctx.shadowBlur = 10;
            ctx.fillStyle = objects.ball2.color;
            ctx.beginPath();
            ctx.arc(objects.ball2.x, objects.ball2.y, objects.ball2.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Draw ball outlines
            ctx.strokeStyle = '#1e40af';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(objects.ball1.x, objects.ball1.y, objects.ball1.radius, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.strokeStyle = '#991b1b';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(objects.ball2.x, objects.ball2.y, objects.ball2.radius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Draw labels
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(objects.ball1.name, objects.ball1.x, objects.ball1.y + 5);
            ctx.fillText(objects.ball2.name, objects.ball2.x, objects.ball2.y + 5);
            
            // Draw mass labels
            ctx.font = '12px Inter';
            ctx.fillText(`${objects.ball1.mass} kg`, objects.ball1.x, objects.ball1.y - objects.ball1.radius - 10);
            ctx.fillText(`${objects.ball2.mass} kg`, objects.ball2.x, objects.ball2.y - objects.ball2.radius - 10);
            
            // Draw velocity arrows
            if (Math.abs(objects.ball1.velocity) > 0.1) {
                drawVelocityArrow(objects.ball1);
            }
            if (Math.abs(objects.ball2.velocity) > 0.1) {
                drawVelocityArrow(objects.ball2);
            }
            
            // Draw collision point if collision occurred
            if (collisionOccurred) {
                const collisionX = (objects.ball1.x + objects.ball2.x) / 2;
                ctx.strokeStyle = '#10b981';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(collisionX, canvas.height/2 - 50);
                ctx.lineTo(collisionX, canvas.height/2 + 50);
                ctx.stroke();
                ctx.setLineDash([]);
                
                // Draw collision marker
                ctx.fillStyle = '#10b981';
                ctx.beginPath();
                ctx.arc(collisionX, canvas.height/2, 8, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        // Draw velocity arrow for a ball
        const drawVelocityArrow = (ball) => {
            ctx.beginPath();
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 3;
            
            const direction = ball.velocity > 0 ? 1 : -1;
            const arrowLength = Math.min(Math.abs(ball.velocity) * 10, 100);
            const startX = ball.x + (ball.radius + 10) * direction;
            
            ctx.moveTo(startX, ball.y);
            ctx.lineTo(startX + arrowLength * direction, ball.y);
            ctx.stroke();
            
            // Arrow head
            ctx.beginPath();
            ctx.fillStyle = '#f59e0b';
            if (direction > 0) {
                ctx.moveTo(startX + arrowLength, ball.y);
                ctx.lineTo(startX + arrowLength - 10, ball.y - 5);
                ctx.lineTo(startX + arrowLength - 10, ball.y + 5);
            } else {
                ctx.moveTo(startX + arrowLength, ball.y);
                ctx.lineTo(startX + arrowLength + 10, ball.y - 5);
                ctx.lineTo(startX + arrowLength + 10, ball.y + 5);
            }
            ctx.closePath();
            ctx.fill();
            
            // Velocity label
            ctx.fillStyle = '#f59e0b';
            ctx.font = '12px Inter';
            ctx.textAlign = direction > 0 ? 'left' : 'right';
            ctx.fillText(
                `${Math.abs(ball.velocity).toFixed(1)} m/s`,
                startX + (arrowLength/2) * direction,
                ball.y - 15
            );
        };

        // Animation loop
        let animationId = null;
        const animateCollision = () => {
            // Update positions
            objects.ball1.x += objects.ball1.velocity * 0.016 * 10; // Scale for visualization
            objects.ball2.x += objects.ball2.velocity * 0.016 * 10;
            
            // Check boundaries
            const leftBoundary = objects.ball1.radius;
            const rightBoundary = canvas.width - objects.ball2.radius;
            
            objects.ball1.x = Math.max(leftBoundary, Math.min(objects.ball1.x, rightBoundary));
            objects.ball2.x = Math.max(leftBoundary, Math.min(objects.ball2.x, rightBoundary));
            
            // Check collision
            const dx = objects.ball2.x - objects.ball1.x;
            const distance = Math.abs(dx);
            const minDistance = objects.ball1.radius + objects.ball2.radius;
            
            if (distance < minDistance && !collisionOccurred) {
                collisionOccurred = true;
                
                // Calculate elastic collision
                const v1 = objects.ball1.velocity;
                const v2 = objects.ball2.velocity;
                const m1 = objects.ball1.mass;
                const m2 = objects.ball2.mass;
                
                // 1D elastic collision formulas
                const newV1 = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2);
                const newV2 = ((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2);
                
                objects.ball1.velocity = newV1;
                objects.ball2.velocity = newV2;
                
                // Calculate momentum after collision
                momentumAfter = m1 * newV1 + m2 * newV2;
                document.getElementById('momentum-after').textContent = `${momentumAfter.toFixed(1)} kg·m/s`;
                
                // Separate balls
                const overlap = minDistance - distance;
                objects.ball1.x -= overlap * 0.5;
                objects.ball2.x += overlap * 0.5;
            }
            
            // Apply slowing (friction)
            objects.ball1.velocity *= 0.99;
            objects.ball2.velocity *= 0.99;
            
            // Stop animation if balls are barely moving
            if (Math.abs(objects.ball1.velocity) < 0.1 && Math.abs(objects.ball2.velocity) < 0.1) {
                objects.ball1.velocity = 0;
                objects.ball2.velocity = 0;
                if (animationId) {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
            }
            
            drawBalls();
            if (animationId) {
                animationId = requestAnimationFrame(animateCollision);
            }
        };

        // Start collision
        document.getElementById('start-collision')?.addEventListener('click', () => {
            // Reset positions
            objects.ball1.x = 100;
            objects.ball2.x = canvas.width - 100;
            
            // Reset collision flag
            collisionOccurred = false;
            
            // Calculate initial momentum
            calculateMomentum();
            document.getElementById('momentum-after').textContent = `${momentumBefore.toFixed(1)} kg·m/s`;
            
            // Start animation
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            animationId = requestAnimationFrame(animateCollision);
        });

        // Reset collision
        document.getElementById('reset-collision')?.addEventListener('click', () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            
            // Reset to initial state
            objects.ball1.x = 100;
            objects.ball2.x = canvas.width - 100;
            objects.ball1.velocity = 10;
            objects.ball2.velocity = 0;
            collisionOccurred = false;
            
            calculateMomentum();
            document.getElementById('momentum-after').textContent = `${momentumBefore.toFixed(1)} kg·m/s`;
            
            drawBalls();
        });

        // Update mass 1
        document.getElementById('mass1-slider')?.addEventListener('input', (e) => {
            objects.ball1.mass = parseInt(e.target.value);
            document.getElementById('collision-mass1').textContent = objects.ball1.mass;
            // Adjust radius based on mass (for visualization)
            objects.ball1.radius = 15 + objects.ball1.mass * 2;
            calculateMomentum();
            drawBalls();
        });

        // Update mass 2
        document.getElementById('mass2-slider')?.addEventListener('input', (e) => {
            objects.ball2.mass = parseInt(e.target.value);
            document.getElementById('collision-mass2').textContent = objects.ball2.mass;
            // Adjust radius based on mass (for visualization)
            objects.ball2.radius = 15 + objects.ball2.mass * 2;
            calculateMomentum();
            drawBalls();
        });

        // Update velocity
        document.getElementById('velocity-slider')?.addEventListener('input', (e) => {
            objects.ball1.velocity = parseInt(e.target.value);
            document.getElementById('collision-velocity').textContent = objects.ball1.velocity;
            calculateMomentum();
            drawBalls();
        });

        // Initial setup
        calculateMomentum();
        document.getElementById('momentum-after').textContent = `${momentumBefore.toFixed(1)} kg·m/s`;
        drawBalls();
    }
}

// Initialize simulations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NewtonsLawsSimulations();
});

// Make class available globally
window.NewtonsLawsSimulations = NewtonsLawsSimulations;