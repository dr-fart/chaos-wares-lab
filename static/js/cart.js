// Cart display functionality
document.addEventListener('DOMContentLoaded', function() {
    displayCartItems();
});

function displayCartItems() {
    const cart = CartManager ? CartManager.getCart() : JSON.parse(localStorage.getItem('cart') || '[]');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    
    if (!cartItemsContainer || !cartTotalElement) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty. <a href="/products/">Continue shopping</a></p>';
        cartTotalElement.textContent = 'Total: $0.00';
        return;
    }
    
    let total = 0;
    cartItemsContainer.innerHTML = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>SKU: ${item.sku}</p>
                <p>Quantity: ${item.quantity}</p>
            </div>
            <div class="cart-item-actions">
                <div class="cart-item-price">$${itemTotal.toFixed(2)}</div>
                <button class="btn btn-secondary" onclick="removeFromCart('${item.sku}')">Remove</button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
    });
    
    cartTotalElement.textContent = `Total: $${total.toFixed(2)}`;
}
