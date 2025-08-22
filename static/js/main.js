// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

// Update cart count in header
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.textContent = totalQuantity;
    }
}

// Add item to cart
function addToCart(sku, name, price) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.sku === sku);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ sku, name, price: parseFloat(price), quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert(`${name} added to cart!`);
}

// Remove item from cart
function removeFromCart(sku) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart = cart.filter(item => item.sku !== sku);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // If we're on the cart page, refresh the display
    if (typeof displayCartItems === 'function') {
        displayCartItems();
    }
}

// Format price consistently
function formatPrice(price) {
    return parseFloat(price).toFixed(2);
}

// Clear entire cart
function clearCart() {
    localStorage.removeItem('cart');
    updateCartCount();
    
    // If we're on the cart page, refresh the display
    if (typeof displayCartItems === 'function') {
        displayCartItems();
    }
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
    updateCartCount();
    
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
        // Physics gallery will auto-initialize when physics-gallery.js loads
        console.log('Physics showcase detected - physics gallery will initialize');
    }
});
