import { getAllProducts } from "../services/product_services.js";

// Desktop Search Elements
const desktopSearchInput = document.getElementById("search-input");
const desktopResultsContainer = document.getElementById("search-results");

// Mobile Search Elements
const mobileSearchInput = document.getElementById("mobile-search-input");
const mobileResultsContainer = document.getElementById("mobile-search-results");

// Mobile Menu Elements
const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const closeMenuBtn = document.getElementById("close-menu");
const mobileMenu = document.getElementById("mobile-menu");
const mobileLinks = document.querySelectorAll(".mobile-link");

let allProducts = [];

// Fetch products once
try {
    allProducts = await getAllProducts();
} catch (error) {
    console.error("Failed to fetch products:", error);
}

// Function for search handling
function handleSearch(inputElement, resultsContainer) {
    if (!inputElement || !resultsContainer) return;

    const query = inputElement.value.toLowerCase().trim();
    resultsContainer.innerHTML = "";

    if (!query) {
        resultsContainer.classList.add("hidden");
        return;
    }

    const limit = 5;
    const filteredProducts = allProducts.filter(product =>
        product.name.toLowerCase().includes(query)
    ).slice(0, limit);

    if (filteredProducts.length === 0) {
        const noResults = document.createElement("div");
        noResults.textContent = "No products found";
        noResults.classList.add("p-3", "text-gray-500", "text-center");
        resultsContainer.appendChild(noResults);
    } else {
        filteredProducts.forEach(product => {
            const div = document.createElement("div");
            div.textContent = product.name;
            div.classList.add("p-3", "cursor-pointer", "hover:bg-(--main-bg)", "border-b", "border-(--border)", "last:border-b-0", "transition-colors");

            div.addEventListener("click", () => {
                window.location.hash = `#product?id=${product.id}`;
                resultsContainer.innerHTML = '';
                inputElement.value = "";
                resultsContainer.classList.add("hidden");
                // Close mobile menu if open
                if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
                    toggleMobileMenu();
                }
            });
            resultsContainer.appendChild(div);
        });
    }

    resultsContainer.classList.remove("hidden");
}

// Event Listeners for Search
if (desktopSearchInput) {
    desktopSearchInput.addEventListener("input", () => handleSearch(desktopSearchInput, desktopResultsContainer));
}

if (mobileSearchInput) {
    mobileSearchInput.addEventListener("input", () => handleSearch(mobileSearchInput, mobileResultsContainer));
}

// Hide results when clicking outside
document.addEventListener("click", (e) => {
    if (desktopSearchInput && !desktopSearchInput.contains(e.target) && desktopResultsContainer && !desktopResultsContainer.contains(e.target)) {
        desktopResultsContainer.classList.add("hidden");
    }
    if (mobileSearchInput && !mobileSearchInput.contains(e.target) && mobileResultsContainer && !mobileResultsContainer.contains(e.target)) {
        mobileResultsContainer.classList.add("hidden");
    }
});

// Mobile Menu Toggle Logic
function toggleMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.toggle("hidden");
}

// Function to update active link styling based on URL hash
function updateActiveLink() {
    const currentHash = window.location.hash || "#home";
    // Select all nav links (desktop and mobile)
    const allNavLinks = document.querySelectorAll('nav ul li a, #mobile-menu ul li a');

    allNavLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (href === currentHash) {
            link.classList.add("text-(--primary)", "font-bold");
            // If it's a desktop link, ensure parent opacity is high (optional but good)
            if (link.closest('ul')) {
                link.closest('ul').classList.remove('opacity-80');
            }
        } else {
            link.classList.remove("text-(--primary)", "font-bold");
        }
    });
}

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", toggleMobileMenu);
}

if (closeMenuBtn) {
    closeMenuBtn.addEventListener("click", toggleMobileMenu);
}

// Close menu when clicking on a link or overlay
if (mobileMenu) {
    mobileMenu.addEventListener("click", (e) => {
        if (e.target === mobileMenu) toggleMobileMenu();
    });
}

mobileLinks.forEach(link => {
    link.addEventListener("click", toggleMobileMenu);
});

// Initialize active link and listen for hash changes
updateActiveLink();
window.addEventListener("hashchange", updateActiveLink);




