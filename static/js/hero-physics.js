// Hero Physics Background - Particle Swarm with Simplex Noise
// Organic, flowing particle system inspired by magnetic field recreation

// Device detection and performance profiling
const DeviceDetector = {
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isLowEnd: navigator.hardwareConcurrency <= 4 || navigator.deviceMemory <= 4,
    
    // Returns optimized settings based on device capabilities
    getPerformanceProfile() {
        if (this.isMobile || this.isLowEnd) {
            return {
                particleCount: Math.min(40, Math.floor(window.innerWidth * window.innerHeight / 8000)),
                updateFrequency: 3, // Update every 3 frames for smoother motion on low-end devices
                velocityMultiplier: 8.0,
                trailOpacity: 0.4,
                noiseComplexity: 0.15,
                velocityDamping: 0.88, // Higher damping for smoother transitions
                timeScale: 6.0,
                maxVelocity: 12.0,
                positionScale: 6.5
            };
        }
        return {
            particleCount: Math.min(100, Math.floor(window.innerWidth * window.innerHeight / 4000)),
            updateFrequency: 3,
            velocityMultiplier: 2.5,
            trailOpacity: 0.25,
            noiseComplexity: 0.08,
            velocityDamping: 0.94,
            timeScale: 2.5,
            maxVelocity: 5.0,
            positionScale: 2.5
        };
    }
};

// 3D vector class for particle positions and velocities
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
    
    // Vector operations - support both vectors and scalars
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
    
    // Efficient vector copying (optimized for performance)
    copyFrom(other) {
        this.x = other.x;
        this.y = other.y;
        this.z = other.z;
        return this;
    }
    
    // Handle screen wrapping for particles that move off-screen
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

// Simplex noise generator for organic particle movement
class SimplexNoise {
    constructor() {
        // Gradient vectors and permutation table for 3D noise generation
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
    
    // Generate 3D simplex noise - creates organic flowing patterns
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

// Individual particle in the swarm system
class SwarmParticle {
    constructor(bounds, noise, profile) {
        this.p = new Vector3D(); // Current position
        this.t = new Vector3D(); // Trail position
        this.v = new Vector3D(); // Velocity
        this._tempVector = new Vector3D(); // Reusable temp vector to avoid allocations
        this.bounds = bounds;
        this.noise = noise;
        this.life = 0;
        this.maxLife = 0;
        this.hue = Math.random() * 360;
        this.profile = profile;
        this.reset();
    }
    
    // Reset particle with random position and fresh lifecycle
    reset() {
        this.p.x = this.t.x = Math.random() * this.bounds.x;
        this.p.y = this.t.y = Math.random() * this.bounds.y;
        this.v.set(0, 0, 0);
        this.life = 0;
        this.maxLife = 3000 + Math.random() * 6000; // 3-9 second lifespan
        this.hue = Math.random() * 360;
    }
    
    // Update particle physics - the core movement logic
    step(time) {
        if (++this.life > this.maxLife) {
            this.reset();
            return;
        }
        
        // Sample noise field for organic movement
        const scale = 1/200;
        const xx = this.p.x * scale;
        const yy = this.p.y * scale;
        const zz = time * this.profile.timeScale / 15000; // Time creates flow
        
        // Apply damping to prevent runaway acceleration
        this.v.mul(this.profile.velocityDamping);
        
        // Combine random forces with noise-based movement
        const angle = Math.random() * Math.PI * 2;
        const randomForce = Math.random() * this.profile.velocityMultiplier / 50;
        
        this.v.x += randomForce * Math.sin(angle) + this.noise.simplex3d(xx, yy, -zz) * this.profile.noiseComplexity;
        this.v.y += randomForce * Math.cos(angle) + this.noise.simplex3d(xx, yy, zz) * this.profile.noiseComplexity;
        
        // Velocity limiting with optimized squared comparison
        const speedSq = this.v.x * this.v.x + this.v.y * this.v.y;
        const maxVelSq = this.profile.maxVelocity * this.profile.maxVelocity;
        if (speedSq > maxVelSq) {
            const scale = this.profile.maxVelocity / Math.sqrt(speedSq);
            this.v.mul(scale);
        }
        
        this.t.copyFrom(this.p);
        
        // Apply velocity using temp vector to avoid allocations
        this._tempVector.set(
            this.v.x * this.profile.positionScale,
            this.v.y * this.profile.positionScale,
            0
        );
        this.p.add(this._tempVector);
        
        if (this.p.wrap2d(this.bounds)) {
            this.reset();
        }
        
        this.hue = (this.hue + 0.1) % 360; // Slow color shift
    }
    
    // Render particle with dynamic glow effect
    render(context) {
        // Offscreen culling for performance
        if (this.p.x < -50 || this.p.x > this.bounds.x + 50 || 
            this.p.y < -50 || this.p.y > this.bounds.y + 50) {
            return;
        }
        
        // Visual properties based on particle state
        const alpha = Math.max(0.1, 1 - (this.life / this.maxLife));
        const speed = Math.sqrt(this.v.x * this.v.x + this.v.y * this.v.y);
        const brightness = Math.min(70, 40 + speed * 10); // Faster = brighter
        const radius = Math.max(12, speed * 18 + 8); // Faster = larger
        
        // Create glow gradient
        const gradient = context.createRadialGradient(
            this.p.x, this.p.y, 0,
            this.p.x, this.p.y, radius * 3
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

// Main system that orchestrates the particle simulation
class HeroPhysicsBackground {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.noise = new SimplexNoise();
        this.animationId = null;
        this.frameCount = 0;
        this.lastInteractionTime = Date.now();
        this.isPaused = false;
        this.pauseTimeout = 60000; // Pause after 1 minute of inactivity
        this.pauseIndicator = null;
        this.isDestroyed = false;
        this.resizeTimeout = null;
        
        this.profile = DeviceDetector.getPerformanceProfile();
        this.bounds = new Vector3D();
        
        // Bind methods for proper context
        this.resize = this.resize.bind(this);
        this.handleUserActivity = this.handleUserActivity.bind(this);
        this.animate = this.animate.bind(this);
        
        // Initialize everything
        this.setupCanvas();
        this.createParticles();
        this.setupActivityListeners();
        this.createPauseIndicator();
        this.animate();
        
        window.addEventListener('resize', this.resize, { passive: true });
    }
    
    // Listen for user activity to manage pause state
    setupActivityListeners() {
        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event => {
            document.addEventListener(event, this.handleUserActivity, { passive: true });
        });
    }
    
    handleUserActivity() {
        if (this.isDestroyed) return;
        
        this.lastInteractionTime = Date.now();
        if (this.isPaused) {
            this.isPaused = false;
            this.hidePauseIndicator();
        }
    }
    
    // Auto-pause after inactivity to save resources
    checkForPause() {
        if (this.isDestroyed) return;
        
        const timeSinceLastActivity = Date.now() - this.lastInteractionTime;
        if (!this.isPaused && timeSinceLastActivity > this.pauseTimeout) {
            this.isPaused = true;
            this.showPauseIndicator();
        }
    }

    // Create pause notification UI
    createPauseIndicator() {
        try {
            this.pauseIndicator = document.createElement('div');
            const canvasRect = this.canvas.getBoundingClientRect();
            
            this.pauseIndicator.style.cssText = `
                position: fixed;
                top: ${canvasRect.top + 20}px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(45, 60, 85, 0.95);
                color: rgba(255, 255, 255, 0.95);
                padding: 10px 20px;
                border-radius: 6px;
                border: 2px solid rgba(100, 150, 255, 0.4);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 13px;
                text-align: center;
                backdrop-filter: blur(10px);
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5), 0 0 20px rgba(100, 150, 255, 0.2);
                z-index: 9999;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease, visibility 0.3s ease;
                pointer-events: none;
                min-width: 280px;
                white-space: nowrap;
            `;
            
            this.pauseIndicator.innerHTML = '⏸️ Simulation paused - interact to resume';
            document.body.appendChild(this.pauseIndicator);
        } catch (error) {
            console.warn('Failed to create pause indicator:', error);
        }
    }

    showPauseIndicator() {
        if (this.pauseIndicator) {
            try {
                const canvasRect = this.canvas.getBoundingClientRect();
                this.pauseIndicator.style.top = `${canvasRect.top + 20}px`;
                this.pauseIndicator.style.opacity = '1';
                this.pauseIndicator.style.visibility = 'visible';
            } catch (error) {
                console.warn('Failed to show pause indicator:', error);
            }
        }
    }
    
    hidePauseIndicator() {
        if (this.pauseIndicator) {
            try {
                this.pauseIndicator.style.opacity = '0';
                this.pauseIndicator.style.visibility = 'hidden';
            } catch (error) {
                console.warn('Failed to hide pause indicator:', error);
            }
        }
    }

    // Set up canvas for high-DPI rendering
    setupCanvas() {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const heroHeight = Math.max(viewportHeight * 0.6, 400);
        
        const dpr = Math.min(window.devicePixelRatio || 1, DeviceDetector.isMobile ? 1.5 : 2);
        
        this.canvas.width = viewportWidth * dpr;
        this.canvas.height = heroHeight * dpr;
        this.canvas.style.width = viewportWidth + 'px';
        this.canvas.style.height = heroHeight + 'px';
        
        this.ctx.scale(dpr, dpr);
        this.bounds.set(viewportWidth, heroHeight, 0);
        
        // Enhance text readability with shadows
        try {
            const heroTitle = document.querySelector('.hero h1, .hero .hero-title, .hero-section h1, .hero-section .hero-title');
            const heroTextElements = document.querySelectorAll('.hero h2, .hero h3, .hero p, .hero .hero-subtitle, .hero-section h2, .hero-section h3, .hero-section p, .hero-section .hero-subtitle');
            
            if (heroTitle) {
                heroTitle.style.filter = 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.8))';
                heroTitle.style.userSelect = 'none';
            }
            
            heroTextElements.forEach(element => {
                element.style.filter = 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.8))';
                element.style.userSelect = 'none';
            });
        } catch (error) {
            console.warn('Failed to apply text shadows:', error);
        }
    }
    
    createParticles() {
        const particleCount = this.profile.particleCount;
        this.particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(new SwarmParticle(this.bounds, this.noise, this.profile));
        }
    }
    
    // Handle window resize with intelligent particle scaling
    resize() {
        if (this.isDestroyed) return;
        
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        
        // Throttle resize events
        this.resizeTimeout = setTimeout(() => {
            if (this.isDestroyed) return;
            
            requestAnimationFrame(() => {
                const oldBounds = { x: this.bounds.x, y: this.bounds.y };
                
                this.profile = DeviceDetector.getPerformanceProfile();
                this.setupCanvas();
                
                // Scale existing particles proportionally
                if (this.particles.length > 0 && oldBounds.x > 0 && oldBounds.y > 0) {
                    const scaleX = this.bounds.x / oldBounds.x;
                    const scaleY = this.bounds.y / oldBounds.y;
                    
                    this.particles.forEach(particle => {
                        particle.p.x *= scaleX;
                        particle.p.y *= scaleY;
                        particle.bounds = this.bounds;
                        
                        if (particle.p.x < 0 || particle.p.x > this.bounds.x || 
                            particle.p.y < 0 || particle.p.y > this.bounds.y) {
                            particle.reset();
                        }
                    });
                    
                    // Adjust particle count for new viewport size
                    const newParticleCount = this.profile.particleCount;
                    const currentCount = this.particles.length;
                    
                    if (newParticleCount > currentCount) {
                        const particlesToAdd = newParticleCount - currentCount;
                        for (let i = 0; i < particlesToAdd; i++) {
                            const newParticle = new SwarmParticle(this.bounds, this.noise, this.profile);
                            newParticle.life = Math.random() * newParticle.maxLife;
                            this.particles.push(newParticle);
                        }
                    } else if (newParticleCount < currentCount) {
                        // Keep particles closest to center
                        const centerX = this.bounds.x * 0.5;
                        const centerY = this.bounds.y * 0.5;
                        
                        this.particles.sort((a, b) => {
                            const distA = (a.p.x - centerX) ** 2 + (a.p.y - centerY) ** 2;
                            const distB = (b.p.x - centerX) ** 2 + (b.p.y - centerY) ** 2;
                            return distA - distB;
                        });
                        
                        this.particles.length = newParticleCount;
                    }
                } else {
                    this.createParticles();
                }
            });
        }, 16);
    }
    
    // Main render loop with performance optimizations
    draw() {
        if (this.isDestroyed) return;
        
        const currentTime = Date.now();
        this.checkForPause();
        
        if (this.isPaused) return; // Skip rendering when paused
        
        // Clear with fade effect for trails
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.fillStyle = `rgba(26, 35, 50, ${this.profile.trailOpacity})`;
        this.ctx.fillRect(0, 0, this.bounds.x, this.bounds.y);
        
        // Additive blending for glow effects
        this.ctx.globalCompositeOperation = 'lighter';
        
        // Throttled updates based on device performance
        this.frameCount++;
        const shouldUpdate = this.frameCount % this.profile.updateFrequency === 0;
        
        this.ctx.save();
        
        for (const particle of this.particles) {
            if (shouldUpdate) {
                particle.step(currentTime);
            }
            particle.render(this.ctx);
        }
        
        this.ctx.restore();
        this.ctx.globalCompositeOperation = 'source-over';
    }
    
    animate() {
        if (this.isDestroyed) return;
        
        this.draw();
        this.animationId = requestAnimationFrame(this.animate);
    }
    
    // Clean up all resources
    destroy() {
        this.isDestroyed = true;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = null;
        }
        
        window.removeEventListener('resize', this.resize);
        
        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event => {
            document.removeEventListener(event, this.handleUserActivity);
        });
        
        if (this.pauseIndicator && this.pauseIndicator.parentNode) {
            this.pauseIndicator.parentNode.removeChild(this.pauseIndicator);
            this.pauseIndicator = null;
        }
        
        // Clear references for garbage collection
        this.particles = [];
        this.canvas = null;
        this.ctx = null;
        this.noise = null;
        this.bounds = null;
        this.profile = null;
    }
}

// Initialize the physics background system
function initHeroPhysics() {
    const canvas = document.getElementById('hero-physics');
    if (canvas) {
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
