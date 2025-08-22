// Cart Manager - Centralized cart operations
const CartManager = {
    // Cache cart data to reduce localStorage parsing
    _cart: null,
    
    // Get cart with caching
    getCart() {
        if (this._cart === null) {
            this._cart = JSON.parse(localStorage.getItem('cart') || '[]');
        }
        return this._cart;
    },
    
    // Save cart and update cache
    saveCart(cart) {
        this._cart = cart;
        localStorage.setItem('cart', JSON.stringify(cart));
        this.updateCartCount();
    },
    
    // Update cart count in header
    updateCartCount() {
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            const totalQuantity = this.getCart().reduce((total, item) => total + item.quantity, 0);
            cartCountElement.textContent = totalQuantity;
        }
    },
    
    // Add item to cart
    addItem(sku, name, price) {
        const cart = this.getCart();
        const existingItem = cart.find(item => item.sku === sku);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ sku, name, price: parseFloat(price), quantity: 1 });
        }
        
        this.saveCart(cart);
        alert(`${name} added to cart!`);
    },
    
    // Remove item from cart
    removeItem(sku) {
        const cart = this.getCart().filter(item => item.sku !== sku);
        this.saveCart(cart);
        
        // Refresh cart display if function exists
        if (typeof displayCartItems === 'function') {
            displayCartItems();
        }
    },
    
    // Clear entire cart
    clear() {
        this._cart = [];
        localStorage.removeItem('cart');
        this.updateCartCount();
        
        // Refresh cart display if function exists
        if (typeof displayCartItems === 'function') {
            displayCartItems();
        }
    }
};

// Legacy function wrappers for backward compatibility
function updateCartCount() {
    CartManager.updateCartCount();
}

function addToCart(sku, name, price) {
    CartManager.addItem(sku, name, price);
}

function removeFromCart(sku) {
    CartManager.removeItem(sku);
}

function clearCart() {
    CartManager.clear();
}

// Format price consistently
function formatPrice(price) {
    return parseFloat(price).toFixed(2);
}

// Mobile menu toggle
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const hamburger = document.querySelector('.hamburger');
    
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    CartManager.updateCartCount();
    
    // Add mobile menu event listener
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Initialize physics gallery if on homepage
    if (document.querySelector('.physics-showcase')) {
        console.log('Physics showcase detected - physics gallery will initialize');
    }
});
