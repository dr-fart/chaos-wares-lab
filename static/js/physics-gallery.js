// Physics Gallery - Dedicated file for homepage physics simulations
// Only loaded on pages that need these visualizations

// Lightweight Double Pendulum
class DoublePendulum {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Set canvas dimensions properly
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        this.width = 200;
        this.height = 200;
        
        // Set actual canvas size in memory (scaled for high-DPI)
        canvas.width = this.width * dpr;
        canvas.height = this.height * dpr;
        
        // Scale canvas back down using CSS
        canvas.style.width = this.width + 'px';
        canvas.style.height = this.height + 'px';
        
        // Scale the drawing context
        this.ctx.scale(dpr, dpr);
        
        // Pendulum parameters
        this.m1 = 10;
        this.m2 = 10;
        this.l1 = 60;
        this.l2 = 60;
        this.a1 = Math.PI / 2 + 0.1;
        this.a2 = Math.PI / 2;
        this.a1_v = 0;
        this.a2_v = 0;
        this.g = 5;
        this.trail = [];
        this.maxTrailLength = 60;
        
        this.centerX = this.width / 2;
        this.centerY = this.height / 3;
    }
    
    update() {
        // Physics calculations
        const num1 = -this.m2 * this.l1 * this.a1_v * this.a1_v * Math.sin(this.a1 - this.a2) * Math.cos(this.a1 - this.a2);
        const num2 = -this.m2 * this.g * Math.sin(this.a2) * Math.cos(this.a1 - this.a2);
        const num3 = -this.m2 * this.l2 * this.a2_v * this.a2_v * Math.sin(this.a1 - this.a2);
        const num4 = -(this.m1 + this.m2) * this.g * Math.sin(this.a1);
        const den = this.l1 * (this.m1 + this.m2 - this.m2 * Math.cos(this.a1 - this.a2) * Math.cos(this.a1 - this.a2));
        
        const a1_a = (num1 + num2 + num3 + num4) / den;
        
        const num5 = -this.m2 * this.l2 * this.a2_v * this.a2_v * Math.sin(this.a1 - this.a2) * Math.cos(this.a1 - this.a2);
        const num6 = (this.m1 + this.m2) * this.g * Math.sin(this.a1) * Math.cos(this.a1 - this.a2);
        const num7 = (this.m1 + this.m2) * this.l1 * this.a1_v * this.a1_v * Math.sin(this.a1 - this.a2);
        const num8 = -(this.m1 + this.m2) * this.g * Math.sin(this.a2);
        const den2 = this.l2 * (this.m1 + this.m2 - this.m2 * Math.cos(this.a1 - this.a2) * Math.cos(this.a1 - this.a2));
        
        const a2_a = (num5 + num6 + num7 + num8) / den2;
        
        this.a1_v += a1_a * 0.08;
        this.a2_v += a2_a * 0.08;
        this.a1 += this.a1_v * 0.08;
        this.a2 += this.a2_v * 0.08;
        
        const x1 = this.centerX + this.l1 * Math.sin(this.a1);
        const y1 = this.centerY + this.l1 * Math.cos(this.a1);
        const x2 = x1 + this.l2 * Math.sin(this.a2);
        const y2 = y1 + this.l2 * Math.cos(this.a2);
        
        this.trail.push({x: x2, y: y2});
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
        
        return {x1, y1, x2, y2};
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        const positions = this.update();
        
        // Draw trail
        this.trail.forEach((point, index) => {
            const alpha = (index / this.trail.length) * 0.6;
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = '#00F5D4';
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 1.5, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw pendulum arms
        this.ctx.globalAlpha = 0.8;
        this.ctx.strokeStyle = '#FF7B00';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.centerX, this.centerY);
        this.ctx.lineTo(positions.x1, positions.y1);
        this.ctx.lineTo(positions.x2, positions.y2);
        this.ctx.stroke();
        
        // Draw masses
        this.ctx.fillStyle = '#FF7B00';
        this.ctx.beginPath();
        this.ctx.arc(positions.x1, positions.y1, 4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(positions.x2, positions.y2, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.globalAlpha = 1;
    }
}

// Wave Interference
class WaveInterference {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Set canvas dimensions properly
        const dpr = window.devicePixelRatio || 1;
        
        this.width = 200;
        this.height = 200;
        
        // Set actual canvas size in memory (scaled for high-DPI)
        canvas.width = this.width * dpr;
        canvas.height = this.height * dpr;
        
        // Scale canvas back down using CSS
        canvas.style.width = this.width + 'px';
        canvas.style.height = this.height + 'px';
        
        // Scale the drawing context
        this.ctx.scale(dpr, dpr);
        
        this.time = 0;
        this.sources = [
            {x: this.width * 0.3, y: this.height * 0.4, frequency: 0.08, amplitude: 30},
            {x: this.width * 0.7, y: this.height * 0.6, frequency: 0.1, amplitude: 25}
        ];
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.time += 0.15;
        
        // Move sources slightly for dynamic effect
        this.sources[0].x = this.width * 0.3 + Math.sin(this.time * 0.3) * 20;
        this.sources[0].y = this.height * 0.4 + Math.cos(this.time * 0.2) * 15;
        this.sources[1].x = this.width * 0.7 + Math.sin(this.time * 0.25) * 18;
        this.sources[1].y = this.height * 0.6 + Math.cos(this.time * 0.35) * 12;
        
        const gridSize = 6;
        for (let x = 0; x < this.width; x += gridSize) {
            for (let y = 0; y < this.height; y += gridSize) {
                let amplitude = 0;
                
                this.sources.forEach(source => {
                    const distance = Math.sqrt((x - source.x) ** 2 + (y - source.y) ** 2);
                    amplitude += source.amplitude * Math.sin(distance * source.frequency - this.time) / (distance * 0.03 + 1);
                });
                
                const intensity = Math.abs(amplitude) / 40;
                const alpha = Math.min(intensity * 0.6, 0.6);
                
                if (alpha > 0.08) {
                    this.ctx.globalAlpha = alpha;
                    this.ctx.fillStyle = amplitude > 0 ? '#00F5D4' : '#FF7B00';
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, Math.max(1, intensity * 3), 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        }
        
        this.ctx.globalAlpha = 1;
    }
}

// Lissajous Curves
class LissajousCurves {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Set canvas dimensions properly
        const dpr = window.devicePixelRatio || 1;
        
        this.width = 200;
        this.height = 200;
        
        // Set actual canvas size in memory (scaled for high-DPI)
        canvas.width = this.width * dpr;
        canvas.height = this.height * dpr;
        
        // Scale canvas back down using CSS
        canvas.style.width = this.width + 'px';
        canvas.style.height = this.height + 'px';
        
        // Scale the drawing context
        this.ctx.scale(dpr, dpr);
        
        this.time = 0;
        this.trail = [];
        this.maxTrailLength = 500;
        this.a = 3;
        this.b = 2;
        this.phase = Math.PI / 4;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.scale = 80;
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.time += 0.025;
        
        // Calculate current position
        const x = this.centerX + this.scale * Math.sin(this.a * this.time);
        const y = this.centerY + this.scale * Math.sin(this.b * this.time + this.phase);
        
        this.trail.push({x, y});
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
        
        // Draw trail with gradient effect
        this.trail.forEach((point, index) => {
            const alpha = (index / this.trail.length) * 0.8;
            this.ctx.globalAlpha = alpha;
            
            // Color gradient from cyan to orange based on position in trail
            const colorMix = index / this.trail.length;
            if (colorMix < 0.5) {
                this.ctx.fillStyle = '#00F5D4';
            } else {
                this.ctx.fillStyle = '#FF7B00';
            }
            
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 1.2, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw current point
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = '#FF7B00';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 3, 0, Math.PI * 2);
        this.ctx.fill();
    }
}

// Physics Gallery Manager
class PhysicsGallery {
    constructor() {
        this.simulations = [];
        this.animationId = null;
        this.init();
    }
    
    init() {
        console.log('Initializing physics gallery...');
        
        // Initialize canvases
        const pendulumCanvas = document.getElementById('pendulum-canvas');
        const ripplesCanvas = document.getElementById('ripples-canvas');
        const lissajousCanvas = document.getElementById('lissajous-canvas');
        
        console.log('Canvas elements found:', {
            pendulum: !!pendulumCanvas,
            ripples: !!ripplesCanvas,
            lissajous: !!lissajousCanvas
        });
        
        if (pendulumCanvas && ripplesCanvas && lissajousCanvas) {
            try {
                this.simulations = [
                    new DoublePendulum(pendulumCanvas),
                    new WaveInterference(ripplesCanvas),
                    new LissajousCurves(lissajousCanvas)
                ];
                
                this.animate();
                console.log('Physics gallery initialized with 3 simulations');
            } catch (error) {
                console.error('Error initializing physics simulations:', error);
            }
        } else {
            console.error('Could not find all canvas elements');
            console.log('Missing elements:', {
                pendulum: !pendulumCanvas,
                ripples: !ripplesCanvas,
                lissajous: !lissajousCanvas
            });
        }
    }
    
    animate() {
        try {
            this.simulations.forEach((sim, index) => {
                try {
                    sim.draw();
                } catch (error) {
                    console.error(`Error drawing simulation ${index}:`, error);
                }
            });
            this.animationId = requestAnimationFrame(() => this.animate());
        } catch (error) {
            console.error('Error in animation loop:', error);
        }
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// Initialize physics gallery
function initPhysicsGallery() {
    console.log('initPhysicsGallery called, document ready state:', document.readyState);
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM loaded, creating physics gallery');
            new PhysicsGallery();
        });
    } else {
        console.log('DOM already loaded, creating physics gallery immediately');
        new PhysicsGallery();
    }
}

// Auto-initialize if this script is loaded
if (typeof window !== 'undefined') {
    initPhysicsGallery();
}
