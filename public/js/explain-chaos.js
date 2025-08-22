// Explain the Chaos functionality
document.addEventListener('DOMContentLoaded', function() {
    const explainButton = document.getElementById('explain-button');
    const productSelect = document.getElementById('product-select');
    const explanationArea = document.getElementById('explanation-area');
    
    explainButton.addEventListener('click', async function() {
        const selectedProduct = productSelect.value;
        
        if (!selectedProduct) {
            alert('Please select a product first.');
            return;
        }
        
        // Show loading state
        explanationArea.innerHTML = '<p>Dr. Reed is analyzing the physics... Please wait.</p>';
        explainButton.disabled = true;
        explainButton.textContent = 'Explaining...';
        
        try {
            const response = await fetch('/api/v1/explain-chaos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productName: selectedProduct
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                explanationArea.innerHTML = `
                    <div class="explanation-content">
                        <h3>Dr. Reed's Explanation:</h3>
                        <p>${data.explanation || data.text || 'No explanation provided.'}</p>
                    </div>
                `;
            } else {
                explanationArea.innerHTML = '<p class="error">Failed to get explanation. Please try again.</p>';
            }
        } catch (error) {
            console.error('Explain chaos error:', error);
            explanationArea.innerHTML = '<p class="error">Request failed. Please check your connection and try again.</p>';
        } finally {
            explainButton.disabled = false;
            explainButton.textContent = 'Explain Chaos';
        }
    });
});
