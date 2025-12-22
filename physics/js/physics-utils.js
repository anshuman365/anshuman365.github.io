// physics/js/physics-utils.js
class PhysicsUtils {
    static formatEquation(latex) {
        // Utility for displaying equations
        return `\\(${latex}\\)`;
    }

    static calculateForce(mass, acceleration) {
        return mass * acceleration;
    }

    static calculateAcceleration(force, mass) {
        return force / mass;
    }

    static calculateProjectileRange(velocity, angle, gravity = 9.8) {
        const angleRad = angle * Math.PI / 180;
        const v0x = velocity * Math.cos(angleRad);
        const v0y = velocity * Math.sin(angleRad);
        const flightTime = (2 * v0y) / gravity;
        return v0x * flightTime;
    }

    static calculatePendulumPeriod(length, gravity = 9.8) {
        // Small angle approximation
        return 2 * Math.PI * Math.sqrt(length / gravity);
    }

    static convertUnits(value, fromUnit, toUnit) {
        const conversions = {
            'm_s': { 'km_h': 3.6, 'mph': 2.237 },
            'kg': { 'lbs': 2.205 },
            'm': { 'ft': 3.281, 'cm': 100 }
        };
        
        if (conversions[fromUnit] && conversions[fromUnit][toUnit]) {
            return value * conversions[fromUnit][toUnit];
        }
        return value;
    }

    static vectorToComponents(magnitude, angle) {
        const angleRad = angle * Math.PI / 180;
        return {
            x: magnitude * Math.cos(angleRad),
            y: magnitude * Math.sin(angleRad)
        };
    }

    static componentsToVector(x, y) {
        return {
            magnitude: Math.sqrt(x*x + y*y),
            angle: Math.atan2(y, x) * 180 / Math.PI
        };
    }

    static calculateKE(mass, velocity) {
        return 0.5 * mass * velocity * velocity;
    }

    static calculatePE(mass, height, gravity = 9.8) {
        return mass * gravity * height;
    }
}