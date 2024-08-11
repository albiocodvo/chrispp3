// Function to reload the page and reset state
function reloadPage() {
    searchTitle = ''; // Clear the search title
    currentPage = 1; // Reset to the first page
    document.getElementById('gameTitle').value = ''; // Clear the search input
    window.location.reload(); // Reloads the current page
}

const apiKey = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
let currentPage = 1;
let searchTitle = ''; // Track the current search title
const resultsPerPage = 21;

// Function to fetch game data
async function fetchGame(title, page = 1) {
    const url = `https://api.rawg.io/api/games?key=${apiKey}&search=${title}&page=${page}&page_size=${resultsPerPage}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        // Filter results to only show exact matches and sort alphabetically
        const filteredResults = data.results
            .filter(game => game.name.toLowerCase().includes(title.toLowerCase()))
            .sort((a, b) => a.name.localeCompare(b.name));

        return { results: filteredResults, totalPages: data.total_pages };
    } catch (error) {
        console.error("Error Fetching Data:", error);
        return { results: [], totalPages: 0 };
    }
}

// Function to display games
function displayResults(data) {
    const resultsRow = document.getElementById('resultsRow');
    
    // Clear existing results if this is the first page
    if (currentPage === 1) {
        resultsRow.innerHTML = '';
    }

    // Display game results
    if (data.results && data.results.length > 0) {
        data.results.forEach(game => {
            const gameCard = document.createElement('div');
            gameCard.className = 'col-md-4 mb-4';

            gameCard.innerHTML = `
            <div class="card">
                <img src="${game.background_image || 'https://via.placeholder.com/300x200'}" class="card-img-top" alt="${game.name}">
                <div class="card-body">
                    <h5 class="card-title">${game.name}</h5>
                    <p class="card-text">Released: ${game.released}</p>
                    <p class="card-text">Platforms: ${game.platforms.map(platform => platform.platform.name).join(', ')}</p>
                    <button class="btn btn-dark" onclick="showGameDetails('${game.id}')">More Details</button>
                </div>
            </div>
            `;
            resultsRow.appendChild(gameCard);
        });
    } else {
        resultsRow.innerHTML = '<p class="col-12">No games found.</p>';
    }

    // Handle "See More" button visibility
    const seeMoreButton = document.getElementById('seeMoreButton');
    if (currentPage >= data.totalPages) {
        seeMoreButton.style.display = 'none'; // Hide button if no more pages
    } else {
        seeMoreButton.style.display = 'block'; // Show button if there are more pages
    }
}

// Function to fetch and show game details
async function showGameDetails(gameId) {
    const url = `https://api.rawg.io/api/games/${gameId}?key=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        // Populate modal with game details
        document.getElementById('modalGameName').textContent = data.name;
        document.getElementById('modalReleased').textContent = `Released: ${data.released}`;
        document.getElementById('modalPlatforms').textContent = `Platforms: ${data.platforms.map(platform => platform.platform.name).join(', ')}`;
        document.getElementById('modalRating').textContent = `Rating: ${data.rating}`;
        document.getElementById('modalRatingTop').textContent = `Top Rating: ${data.rating_top}`;

        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('gameDetailsModal'));
        modal.show();
    } catch (error) {
        console.error("Error Fetching Game Details:", error);
    }
}

// Function to handle game search
async function getGameList() {
    searchTitle = document.getElementById('gameTitle').value;
    currentPage = 1; // Reset to first page
    const data = await fetchGame(searchTitle, currentPage);
    displayResults(data);
}

// Function to load more games
async function loadMoreGames() {
    currentPage++;
    const data = await fetchGame(searchTitle, currentPage);
    displayResults(data);
}

// Add event listener to "See More" button
document.getElementById('seeMoreButton').addEventListener('click', loadMoreGames);

// Add an event listener to the search input to listen for the "Enter" key
document.getElementById('gameTitle').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent form submission
        getGameList(); // Call the function to fetch and display games
    }
});

// Load initial games on page load
window.onload = async function() {
    searchTitle = document.getElementById('gameTitle').value || ''; // Set the search title
    const data = await fetchGame(searchTitle, currentPage); // Fetch initial games
    displayResults(data);
};