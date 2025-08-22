// Checkout functionality
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckout);
    }
});

// Load and display cart items for checkout
function loadCart() {
    const cart = CartManager ? CartManager.getCart() : JSON.parse(localStorage.getItem('cart') || '[]');
    const cartItemsContainer = document.getElementById('checkout-cart-items');
    const cartTotalElement = document.getElementById('checkout-cart-total');
    
    if (!cartItemsContainer || !cartTotalElement) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
        cartTotalElement.textContent = 'Total: $0.00';
        return;
    }
    
    let total = 0;
    cartItemsContainer.innerHTML = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>SKU: ${item.sku}</p>
                <p>Quantity: ${item.quantity}</p>
            </div>
            <div class="cart-item-price">$${itemTotal.toFixed(2)}</div>
        `;
        cartItemsContainer.appendChild(cartItem);
        total += itemTotal;
    });
    
    cartTotalElement.textContent = `Total: $${total.toFixed(2)}`;
}

// Handle checkout form submission
async function handleCheckout(e) {
    e.preventDefault();
    
    const cart = CartManager ? CartManager.getCart() : JSON.parse(localStorage.getItem('cart') || '[]');
    
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Processing...';
    
    // Simulate checkout process
    setTimeout(() => {
        alert('Order placed successfully!');
        
        // Clear cart using CartManager if available
        if (CartManager) {
            CartManager.clear();
        } else {
            localStorage.removeItem('cart');
            if (typeof updateCartCount === 'function') {
                updateCartCount();
            }
        }
        
        window.location.href = '/';
    }, 2000);
}
