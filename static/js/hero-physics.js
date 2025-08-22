// Hero Physics Background - Particle Swarm with Simplex Noise
// Organic, flowing particle system inspired by magnetic field recreation

// Mobile detection utility
const DeviceDetector = {
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isLowEnd: navigator.hardwareConcurrency <= 4 || navigator.deviceMemory <= 4,
    
    getPerformanceProfile() {
        if (this.isMobile || this.isLowEnd) {
            return {
                particleCount: Math.min(150, Math.floor(window.innerWidth * window.innerHeight / 3000)),
                updateFrequency: 2, // Update every 2nd frame
                velocityMultiplier: 2.2, // Compensate for reduced update frequency
                trailOpacity: 0.4,
                noiseComplexity: 0.06, // Reduced noise sampling
                velocityDamping: 0.88, // Less damping to maintain speed
                timeScale: 1.8, // Faster time progression
                maxVelocity: 3.5, // Higher velocity cap for mobile
                positionScale: 2.0 // Scale position updates for mobile
            };
        }
        return {
            particleCount: Math.min(400, Math.floor(window.innerWidth * window.innerHeight / 1200)),
            updateFrequency: 1, // Update every frame
            velocityMultiplier: 1.0,
            trailOpacity: 0.25,
            noiseComplexity: 0.08,
            velocityDamping: 0.94,
            timeScale: 1.0,
            maxVelocity: 2.0,
            positionScale: 1.0
        };
    }
};

class Vector3D {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    
    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }
    
    add(other) {
        if (typeof other === 'number') {
            this.x += other;
            this.y += other;
            this.z += other;
        } else {
            this.x += other.x;
            this.y += other.y;
            this.z += other.z;
        }
        return this;
    }
    
    sub(other) {
        if (typeof other === 'number') {
            this.x -= other;
            this.y -= other;
            this.z -= other;
        } else {
            this.x -= other.x;
            this.y -= other.y;
            this.z -= other.z;
        }
        return this;
    }
    
    mul(other) {
        if (typeof other === 'number') {
            this.x *= other;
            this.y *= other;
            this.z *= other;
        } else {
            this.x *= other.x;
            this.y *= other.y;
            this.z *= other.z;
        }
        return this;
    }
    
    clone() {
        return new Vector3D(this.x, this.y, this.z);
    }
    
    distance(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    move(dest) {
        if (dest instanceof Vector3D) {
            dest.x = this.x;
            dest.y = this.y;
            dest.z = this.z;
        }
        return this;
    }
    
    wrap2d(bounds) {
        if (this.x > bounds.x) {
            this.x = 0;
            return true;
        }
        if (this.x < 0) {
            this.x = bounds.x;
            return true;
        }
        if (this.y > bounds.y) {
            this.y = 0;
            return true;
        }
        if (this.y < 0) {
            this.y = bounds.y;
            return true;
        }
        return false;
    }
}

class SimplexNoise {
    constructor() {
        this.grad3 = [
            new Vector3D(1,1,0), new Vector3D(-1,1,0), new Vector3D(1,-1,0), new Vector3D(-1,-1,0),
            new Vector3D(1,0,1), new Vector3D(-1,0,1), new Vector3D(1,0,-1), new Vector3D(-1,0,-1),
            new Vector3D(0,1,1), new Vector3D(0,-1,1), new Vector3D(0,1,-1), new Vector3D(0,-1,-1)
        ];
        
        this.p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
        
        this.permutation = new Array(512);
        this.gradP = new Array(512);
        
        this.F3 = 1/3;
        this.G3 = 1/6;
        
        this.init();
    }
    
    init() {
        for (let i = 0; i < 256; i++) {
            this.permutation[i] = this.permutation[i + 256] = this.p[i];
            this.gradP[i] = this.gradP[i + 256] = this.grad3[this.p[i] % 12];
        }
    }
    
    dot3d(grad, x, y, z) {
        return grad.x * x + grad.y * y + grad.z * z;
    }
    
    simplex3d(x, y, z) {
        let n0, n1, n2, n3;
        let s = (x + y + z) * this.F3;
        let i = Math.floor(x + s);
        let j = Math.floor(y + s);
        let k = Math.floor(z + s);
        let t = (i + j + k) * this.G3;
        let x0 = x - i + t;
        let y0 = y - j + t;
        let z0 = z - k + t;
        
        let i1, j1, k1, i2, j2, k2;
        if (x0 >= y0) {
            if (y0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=1; k2=0; }
            else if (x0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=0; k2=1; }
            else { i1=0; j1=0; k1=1; i2=1; j2=0; k2=1; }
        } else {
            if (y0 < z0) { i1=0; j1=0; k1=1; i2=0; j2=1; k2=1; }
            else if (x0 < z0) { i1=0; j1=1; k1=0; i2=0; j2=1; k2=1; }
            else { i1=0; j1=1; k1=0; i2=1; j2=1; k2=0; }
        }
        
        let x1 = x0 - i1 + this.G3;
        let y1 = y0 - j1 + this.G3;
        let z1 = z0 - k1 + this.G3;
        let x2 = x0 - i2 + 2 * this.G3;
        let y2 = y0 - j2 + 2 * this.G3;
        let z2 = z0 - k2 + 2 * this.G3;
        let x3 = x0 - 1 + 3 * this.G3;
        let y3 = y0 - 1 + 3 * this.G3;
        let z3 = z0 - 1 + 3 * this.G3;
        
        i &= 255; j &= 255; k &= 255;
        
        let gi0 = this.gradP[i + this.permutation[j + this.permutation[k]]];
        let gi1 = this.gradP[i + i1 + this.permutation[j + j1 + this.permutation[k + k1]]];
        let gi2 = this.gradP[i + i2 + this.permutation[j + j2 + this.permutation[k + k2]]];
        let gi3 = this.gradP[i + 1 + this.permutation[j + 1 + this.permutation[k + 1]]];
        
        let t0 = 0.6 - x0*x0 - y0*y0 - z0*z0;
        let t1 = 0.6 - x1*x1 - y1*y1 - z1*z1;
        let t2 = 0.6 - x2*x2 - y2*y2 - z2*z2;
        let t3 = 0.6 - x3*x3 - y3*y3 - z3*z3;
        
        n0 = t0 < 0 ? 0 : (t0 *= t0, t0 * t0 * this.dot3d(gi0, x0, y0, z0));
        n1 = t1 < 0 ? 0 : (t1 *= t1, t1 * t1 * this.dot3d(gi1, x1, y1, z1));
        n2 = t2 < 0 ? 0 : (t2 *= t2, t2 * t2 * this.dot3d(gi2, x2, y2, z2));
        n3 = t3 < 0 ? 0 : (t3 *= t3, t3 * t3 * this.dot3d(gi3, x3, y3, z3));
        
        return 32 * (n0 + n1 + n2 + n3);
    }
}

class SwarmParticle {
    constructor(bounds, noise, profile) {
        this.p = new Vector3D(); // position
        this.t = new Vector3D(); // trail position
        this.v = new Vector3D(); // velocity
        this.bounds = bounds;
        this.noise = noise;
        this.life = 0;
        this.maxLife = 0;
        this.hue = Math.random() * 360;
        this.profile = profile;
        this.reset();
    }
    
    reset() {
        this.p.x = this.t.x = Math.random() * this.bounds.x;
        this.p.y = this.t.y = Math.random() * this.bounds.y;
        this.v.set(0, 0, 0); // Start with zero velocity
        this.life = 0;
        this.maxLife = 2000 + Math.random() * 3000;
        this.hue = Math.random() * 360;
    }
    
    step(time) {
        if (this.life++ > this.maxLife) {
            this.reset();
        }
        
        // Sample noise field for organic movement
        const xx = this.p.x / 200; // Larger scale for smoother movement
        const yy = this.p.y / 200;
        const zz = time / 15000 * this.profile.timeScale; // Adjust time progression
        
        // Add some randomness
        const angle = Math.random() * Math.PI * 2;
        const randomForce = Math.random() / 50 * this.profile.velocityMultiplier; // Scale random force
        
        // Apply velocity damping first to prevent buildup
        this.v.mul(this.profile.velocityDamping); // Adjust damping
        
        // Calculate velocity based on noise - much more gentle
        this.v.x += randomForce * Math.sin(angle) + this.noise.simplex3d(xx, yy, -zz) * this.profile.noiseComplexity;
        this.v.y += randomForce * Math.cos(angle) + this.noise.simplex3d(xx, yy, zz) * this.profile.noiseComplexity;
        
        // Limit velocity to maintain visual speed parity
        const speed = Math.sqrt(this.v.x * this.v.x + this.v.y * this.v.y);
        if (speed > this.profile.maxVelocity) {
            this.v.mul(this.profile.maxVelocity / speed);
        }
        
        // Store current position for trail
        this.p.move(this.t);
        
        // Apply velocity with scaling - create new vector to avoid modifying original
        const scaledVelocity = new Vector3D(
            this.v.x * this.profile.positionScale,
            this.v.y * this.profile.positionScale,
            this.v.z * this.profile.positionScale
        );
        this.p.add(scaledVelocity);
        
        // Wrap around edges
        if (this.p.wrap2d(this.bounds)) {
            this.reset();
        }
        
        // Slowly change hue
        this.hue = (this.hue + 0.1) % 360; // Slower color change
    }
    
    render(context) {
        const alpha = Math.max(0.1, 1 - (this.life / this.maxLife));
        const speed = Math.sqrt(this.v.x * this.v.x + this.v.y * this.v.y);
        const brightness = Math.min(70, 40 + speed * 10);
        const radius = Math.max(4, speed * 6 + 3); // Large circular particles
        
        // Create radial gradient for glow effect
        const gradient = context.createRadialGradient(
            this.p.x, this.p.y, 0,
            this.p.x, this.p.y, radius * 2
        );
        
        gradient.addColorStop(0, `hsla(${this.hue}, 75%, ${brightness}%, ${alpha * 0.9})`);
        gradient.addColorStop(0.6, `hsla(${this.hue}, 75%, ${brightness}%, ${alpha * 0.4})`);
        gradient.addColorStop(1, `hsla(${this.hue}, 75%, ${brightness}%, 0)`);
        
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(this.p.x, this.p.y, radius, 0, Math.PI * 2);
        context.fill();
    }
}

class HeroPhysicsBackground {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.noise = new SimplexNoise();
        this.animationId = null;
        this.frameCount = 0;
        
        // Get performance profile based on device
        this.profile = DeviceDetector.getPerformanceProfile();
        
        this.bounds = new Vector3D();
        this.resize = this.resize.bind(this);
        
        this.setupCanvas();
        this.createParticles();
        this.animate();
        
        window.addEventListener('resize', this.resize);
    }
    
    setupCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, DeviceDetector.isMobile ? 1.5 : 2);
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        this.ctx.scale(dpr, dpr);
        this.bounds.set(rect.width, rect.height, 0);
    }
    
    resize() {
        this.setupCanvas();
        // Recreate particles with new count for new screen size
        this.particles = [];
        this.createParticles();
    }
    
    createParticles() {
        const particleCount = this.profile.particleCount;
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(new SwarmParticle(this.bounds, this.noise, this.profile));
        }
    }
    
    draw() {
        const currentTime = Date.now();
        
        // Clear with fade effect matching hero background
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.fillStyle = `rgba(26, 35, 50, ${this.profile.trailOpacity})`;
        this.ctx.fillRect(0, 0, this.bounds.x, this.bounds.y);
        
        // Set blend mode for particle trails
        this.ctx.globalCompositeOperation = 'lighter';
        
        // Update and render particles based on update frequency
        this.frameCount++;
        const shouldUpdate = this.frameCount % this.profile.updateFrequency === 0;
        
        for (let particle of this.particles) {
            if (shouldUpdate) {
                particle.step(currentTime);
            }
            particle.render(this.ctx);
        }
        
        this.ctx.globalCompositeOperation = 'source-over';
    }
    
    animate() {
        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        window.removeEventListener('resize', this.resize);
    }
}

// Initialize hero physics background
function initHeroPhysics() {
    const canvas = document.getElementById('hero-physics');
    if (canvas) {
        console.log('Initializing particle swarm background...');
        new HeroPhysicsBackground(canvas);
    } else {
        console.warn('Hero physics canvas not found');
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroPhysics);
} else {
    initHeroPhysics();
}
