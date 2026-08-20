/**
 * Terms Catalog Translator (ES <-> EN)
 * Client-side script providing fuzzy search capabilities across a dual-language catalog.
 */

/** @type {Object} Configuration options for Fuse.js fuzzy matching */
const fuseOptions = {
    keys: ['es', 'en'],
    threshold: 0.3,
    ignoreLocation: true,
    includeScore: true,
    minMatchCharLength: 2
};

/** @type {Fuse} Global Fuse.js instance initialized after data fetching */
let fuse;

const searchInput = document.getElementById('searchInput');
const resultsBody = document.getElementById('resultsBody');

/**
 * Loads the terms catalog JSON file.
 * @async
 * @returns {Promise<Array<{es: string, en: string}>>} Array of translation pairs, or an empty array on error.
 */
async function loadTerms() {
    try {
        const response = await fetch('./terms.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error loading terms catalog:", error);
        return [];
    }
}

/**
 * Handles real-time search input changes and queries Fuse.js.
 * @param {InputEvent} event - The DOM input event from search input element.
 */
function handleSearch(event) {
    const query = event.target.value.trim();

    if (query === '') {
        renderResults([]);
        return;
    }

    const results = fuse.search(query);
    renderResults(results);
}

/**
 * Renders the search results table rows dynamically.
 * @param {Array<{item: {es: string, en: string}}>} results - Array of Fuse.js match objects.
 */
function renderResults(results) {
    resultsBody.innerHTML = '';

    if (results.length === 0) {
        resultsBody.innerHTML = `
      <tr>
        <td colspan="2" class="no-results">No matches were found.</td>
      </tr>
    `;
        return;
    }

    const fragment = document.createDocumentFragment();

    results.forEach(({ item }) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td>${escapeHTML(item.es)}</td>
      <td>${escapeHTML(item.en)}</td>
    `;
        fragment.appendChild(tr);
    });

    resultsBody.appendChild(fragment);
}

/**
 * Escapes potentially hazardous characters to prevent XSS attacks when rendering HTML.
 * @param {string} str - Raw input string.
 * @returns {string} Sanitized string safe for HTML injection.
 */
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g,
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

/**
 * Boots the application by fetching terms, instantiating Fuse, and setting up listeners.
 * @async
 */
async function init() {
    const terms = await loadTerms();
    fuse = new Fuse(terms, fuseOptions);

    renderResults([]);

    searchInput.addEventListener('input', handleSearch);
}

document.addEventListener('DOMContentLoaded', init);
