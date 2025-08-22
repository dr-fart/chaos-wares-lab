// Knowledge Base Search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('search-form');
    const searchQuery = document.getElementById('search-query');
    const searchResults = document.getElementById('search-results');
    
    if (!searchForm || !searchQuery || !searchResults) return;
    
    searchForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const query = searchQuery.value.trim();
        
        if (!query) {
            alert('Please enter a search query.');
            return;
        }
        
        // Show searching message and disable form
        searchResults.innerHTML = '<p class="searching-message">Searching the archives...</p>';
        searchResults.style.display = 'block';
        
        const submitButton = searchForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
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
            
            // Show "No results found" message
            searchResults.innerHTML = `
                <div class="search-result">
                    <p class="no-results">No results found for your query.</p>
                    <p class="search-suggestion">Try different keywords or browse our <a href="/products/">products</a> to learn more about chaos theory.</p>
                </div>
            `;
            
            // Re-enable form
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        } catch (error) {
            console.error('Search error:', error);
            searchResults.innerHTML = '<p class="error">Search service temporarily unavailable. Please try again later.</p>';
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
});
