// Knowledge Base Search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('search-form');
    const searchQuery = document.getElementById('search-query');
    const searchResults = document.getElementById('search-results');
    
    searchForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const query = searchQuery.value.trim();
        
        if (!query) {
            alert('Please enter a search query.');
            return;
        }
        
        // Show searching message
        searchResults.innerHTML = '<p class="searching-message">Searching the archives...</p>';
        searchResults.style.display = 'block';
        
        // Disable form during search
        const submitButton = searchForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Searching...';
        
        try {
            // Make POST request to simulated endpoint
            const response = await fetch('/api/v1/search/knowledge-base', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: query
                })
            });
            
            // Simulate processing time with 1.5 second delay
            setTimeout(() => {
                // Show "No results found" message
                searchResults.innerHTML = `
                    <div class="search-result">
                        <p class="no-results">No results found for your query.</p>
                        <p class="search-suggestion">Try different keywords or browse our <a href="/products/">products</a> to learn more about chaos theory.</p>
                    </div>
                `;
                
                // Re-enable form
                submitButton.disabled = false;
                submitButton.textContent = 'Search';
            }, 1500);
            
        } catch (error) {
            console.error('Search error:', error);
            
            // Show error after delay to maintain simulation
            setTimeout(() => {
                searchResults.innerHTML = '<p class="error">Search service temporarily unavailable. Please try again later.</p>';
                
                // Re-enable form
                submitButton.disabled = false;
                submitButton.textContent = 'Search';
            }, 1500);
        }
    });
});
