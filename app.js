// Fuse.js configuration for fuzzy search
const fuseOptions = {
    keys: ['es', 'en'],
    threshold: 0.4,
    includeScore: true,
    minMatchCharLength: 2
};

let fuse;

const searchInput = document.getElementById('searchInput');
const resultsBody = document.getElementById('resultsBody');

async function init() {
    const terms = await loadTerms();
    fuse = new Fuse(terms, fuseOptions);

    renderResults([]);

    searchInput.addEventListener('input', handleSearch);
}

function handleSearch(event) {
    const query = event.target.value.trim();

    if (query === '') {
        renderResults([]);
        return;
    }

    const results = fuse.search(query);
    renderResults(results);
}

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

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g,
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

async function loadTerms() {
    try {
        const response = await fetch('./terms.json');
        return await response.json();
    } catch (error) {
        console.error("Error loading terms catalog:", error);
    }
}

document.addEventListener('DOMContentLoaded', init);