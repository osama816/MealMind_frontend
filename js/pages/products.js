import * as productService from "../services/product_services.js"


//Toggle filter items
document.querySelectorAll('.section-header').forEach(button => {
    button.addEventListener('click', function () {
        const sectionId = this.getAttribute('data-section');
        const content = document.getElementById(sectionId);

        // Toggle collapsed state
        this.classList.toggle('collapsed');
        content.classList.toggle('collapsed');
    });
});

/* =========> Get All Categories  <=========  */

var categories = await productService.getAllCategories();
const categoryContainer = document.getElementById("categories");
(function showCategories() {
    categories.forEach(c => {
        categoryContainer.innerHTML += ` 
                           <li class=" flex justify-between items-center p-3.5  cursor-pointer text-(--main-text) opacity-70 text-sm category hover:text-(--primary) transition"
                        data-value="${c.id}">
                        <span>${c.name}</span><span><i class="fa-solid fa-angle-right"></i></span>
                    </li>`
    })
})();

/* =========> Apply Filtration  <=========  */
//Default Values
let filters = {
    minPrice: 25,
    maxPrice: 200,
    categoryId: null,
    dressStyle: [],
    size: [],
    searchQuery: "" // Add search query
};

//1. ===== Price Slider Track [Determine price] =====

const minRange = document.getElementById("minRange");
const maxRange = document.getElementById("maxRange");
let minPrice = document.getElementById("minPrice");
let maxPrice = document.getElementById("maxPrice");
const sliderTrack = document.getElementById("sliderTrack");
const maxGap = 10;

function updateSlider() {
    let minVal = parseInt(minRange.value);
    let maxVal = parseInt(maxRange.value);
    const min = parseInt(minRange.min);
    const max = parseInt(minRange.max);

    //Validation Range Inputs
    if (maxVal - minVal < maxGap) {
        if (event?.target === minRange) {
            minRange.value = maxVal - maxGap;
        } else {
            maxRange.value = minVal + maxGap;
        }
        minVal = minRange.value;
        maxVal = maxRange.value;
    }

    //Pass the values
    minPrice.value = minVal;
    maxPrice.value = maxVal;


    //Fill sliderTrack
    const minPercent = ((minVal - min) / (max - min)) * 100;
    const maxPercent = ((maxVal - min) / (max - min)) * 100;

    sliderTrack.style.background = `
    linear-gradient(
      to right,
      #ddd ${minPercent}%,
      #000 ${minPercent}%,
      #000 ${maxPercent}%,
      #ddd ${maxPercent}%
    )
  `;

    minPrice.textContent = `${minVal}`;
    maxPrice.textContent = `${maxVal}`;
    filters.minPrice = minVal;
    filters.maxPrice = maxVal;
}

minRange.addEventListener("input", updateSlider);
maxRange.addEventListener("input", updateSlider);

// Reload products when user finishes sliding (change event)
minRange.addEventListener("change", () => {
    currentPage = 1;
    loadPage();
});
maxRange.addEventListener("change", () => {
    currentPage = 1;
    loadPage();
});

//in case the user does not change the price values
updateSlider();

// Get search query from URL if exists
function getSearchQueryFromUrl() {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    return urlParams.get('search') || "";
}

let searchQuery = getSearchQueryFromUrl();
if (searchQuery) {
    filters.searchQuery = searchQuery;
}

// Listen for hash changes to update search
window.addEventListener('hashchange', () => {
    const newQuery = getSearchQueryFromUrl();
    if (newQuery !== filters.searchQuery) {
        filters.searchQuery = newQuery;
        // Update input field if exists
        const productSearchInput = document.querySelector('input[placeholder="Search for food..."]');
        if (productSearchInput) {
            productSearchInput.value = newQuery;
        }
        currentPage = 1;
        loadPage();
    }
});
if (searchQuery) {
    filters.searchQuery = searchQuery;
    console.log('Search query:', searchQuery);
}

//2. ======= Determine the size ========
const sizeButtons = document.querySelectorAll(".size-item");


sizeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const value = btn.dataset.value;
        btn.classList.toggle("active");

        if (btn.classList.contains("active")) {
            if (!filters.size.includes(value)) {
                filters.size.push(value);
            }
        } else {
            filters.size = filters.size.filter(size => size !== value);
        }

        currentPage = 1;
        loadPage();
    });
});

//3. ======= Determine the dress style =======

const dressItems = document.querySelectorAll(".style-item");

dressItems.forEach(btn => {
    btn.addEventListener("click", () => {
        const value = btn.dataset.value;

        btn.classList.toggle("active");

        if (btn.classList.contains("active")) {
            if (!filters.dressStyle.includes(value)) {
                filters.dressStyle.push(value);
            }
        } else {
            filters.dressStyle = filters.dressStyle.filter(
                dress => dress !== value
            );
        }

        currentPage = 1;
        loadPage();
    });
});


//4. Filter by category
const allProducts = await productService.getAllProducts();
const selectedCategoryContainer = document.querySelectorAll(".selectedCategory");

let selectedCategory = null;

const category = document.querySelectorAll(".category");
category.forEach(btn => {
    btn.addEventListener("click", async () => {
        category.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        selectedCategory = Number(btn.dataset.value);
        filters.categoryId = selectedCategory;
        const categoryName = await productService.getCategoryById(selectedCategory);

        selectedCategoryContainer.forEach(i => i.innerHTML = categoryName.name)
        loadPage();
    })
});

async function renderProducts(allProducts) {
    const productsContainer = document.querySelector(".product-items");
    if (!productsContainer) return;

    productsContainer.innerHTML = "";

    if (allProducts.length > 0) {
        // Collect all HTML as strings first to prevent race conditions and flickering
        const productsHtmlPromises = allProducts.map(async (item, index) => {
            const categoryName = await productService.getCategoryById(item.categoryId);
            const animationClass = index % 2 === 0 ? "animate-side" : "animate-top";
            const delay = (index * 0.1).toFixed(1);
            const discountedPrice = parseInt(item.price - item.price * item.discountPercentage / 100);

            return `
            <div class="food-card-arch ${animationClass}" style="animation-delay: ${delay}s">
                <div class="arch-img-container">
                    <img src="${item.mainImage}" alt="${item.name}">
                </div>
                <p class="text-(--primary) text-xs font-bold uppercase mb-1">${categoryName.name}</p>
                <h3 class="font-bold text-xl mb-1 truncate w-full text-center text-(--primary)">${item.name}</h3>
                 <div class="flex justify-center items-center gap-1 mb-3 text-yellow-400 text-sm">
                        <i class="fas fa-star"></i><span class="ml-1 text-xs text-(--sec-text)">(${item.rating})</span>
                   </div>
                   
                <div class="flex items-center justify-between mt-auto w-full px-2">
                     ${item.discountPercentage ? `
                     <div class="flex flex-col items-start">
                        <span class="font-bold text-lg text-(--main-text)">$${discountedPrice}</span>
                        <div class="flex gap-1 text-xs">
                            <span class="text-gray-400 line-through">$${parseInt(item.price)}</span>
                            <span class="text-red-500 font-bold">-${item.discountPercentage}%</span>
                        </div>
                     </div>` : `<div class="font-bold text-lg text-(--main-text)">$${parseInt(item.price)}</div>`}
                    
                    <a href="index.html#product?id=${item.id}"
                        class="bg-(--primary) text-white font-bold py-2 px-4 rounded-full hover:bg-white hover:text-(--primary) transform hover:scale-105 transition shadow-lg text-center text-xs">
                        Order
                    </a>
                </div>
            </div>
            `;
        });

        const htmlResults = await Promise.all(productsHtmlPromises);
        productsContainer.innerHTML = htmlResults.join('');
    } else {
        toggleEmptyState(false);
    }
}
// render pagination buttons
let selectedSort = "default";
let currentPage = 1;
const pageSize = 6;
function renderPagination(meta) {
    var pageIndexContainer = document.querySelector(".page-index");
    pageIndexContainer.innerHTML = ""
    for (let i = 1; i <= meta.totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;

        let btnStyles = ["text-(--main-text)", "py-3", "px-3", "cursor-pointer", "rounded-xl", "bg-(--sec-bg)", "border", "border-(--border)", "hover:bg-(--primary)", "hover:text-white", "transition"]
        btn.classList.add(...btnStyles);

        if (i === meta.page) {
            btn.disabled = true;
            btn.classList.remove("text-(--main-text)", "bg-(--sec-bg)")
            btn.classList.add("bg-(--primary)", "text-white", "border-none")
        }

        btn.onclick = () => {
            currentPage = i;
            loadPage();
        };

        pageIndexContainer.append(btn)
    }
    document.getElementById("prevBtn").disabled = !meta.hasPreviousPage;
    document.getElementById("nextBtn").disabled = !meta.hasNextPage;
}
function paginate(items, page = 1, pageSize = 6) {

    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const data = items.slice(startIndex, endIndex);

    return {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        data
    };
}
function getFinalPrice(product) {
    if (product.discountPercentage) {
        return product.price - (product.price * product.discountPercentage / 100);
    }
    return product.price;
}

function sortProducts(products, sortType) {
    const sorted = [...products];

    switch (sortType) {
        case "price-low": // Changed from price-asc
            return sorted.sort(
                (a, b) => getFinalPrice(a) - getFinalPrice(b)
            );
        case "price-high": // Changed from price-desc
            return sorted.sort(
                (a, b) => getFinalPrice(b) - getFinalPrice(a)
            );
        case "rating":
            return sorted.sort((a, b) => b.rating - a.rating);
        case "name": // Changed from name-asc/desc splitting
            return sorted.sort((a, b) =>
                a.name.localeCompare(b.name)
            );
        default:
            return sorted;
    }
}

async function loadPage() {
    let baseProducts = allProducts;

    if (filters.categoryId !== null) {
        baseProducts = await productService.getProductsByCategoryId(filters.categoryId);
    }
    let filteredProducts = filterProducts(baseProducts, filters);
    filteredProducts = sortProducts(filteredProducts, selectedSort);

    toggleEmptyState(filteredProducts.length > 0);

    const result = paginate(filteredProducts, currentPage, pageSize);

    renderProducts(result.data);
    renderPagination(result);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}
function changeSorting(sortType) {
    selectedSort = sortType;
    currentPage = 1;
    loadPage();
}
const sort = document.getElementById("sort");
sort.addEventListener("change", function () {
    changeSorting(this.value)
})
document.getElementById("prevBtn").onclick = () => {
    if (currentPage > 1) {
        currentPage--;
        loadPage();
    }
};
document.getElementById("nextBtn").onclick = () => {
    const totalPages = Math.ceil(allProducts.length / pageSize);
    if (currentPage < totalPages) {
        currentPage++;
        loadPage();
    }
};
loadPage();


document.getElementById("btnFilter")?.addEventListener("click", function () {
    currentPage = 1;
    loadPage();
    overlay.classList.remove("overlay");
    filterSideBar.classList.remove("show-filter")
})


function filterProducts(products, filters) {
    return products.filter(product => {

        // Search Query - filter by name or description
        if (filters.searchQuery && filters.searchQuery.trim() !== '') {
            const query = filters.searchQuery.toLowerCase();
            const matchName = product.name.toLowerCase().includes(query);
            const matchDesc = product.description.toLowerCase().includes(query);
            if (!matchName && !matchDesc) {
                return false;
            }
        }

        // Category
        if (filters.categoryId !== null &&
            product.categoryId !== filters.categoryId) {
            return false;
        }

        // Size (portion sizes for food)
        if (filters.size && filters.size.length > 0) {
            const hasSize = product.sizes.some(size =>
                filters.size.includes(size)
            );
            if (!hasSize) return false;
        }

        // Style
        if (filters.dressStyle.length > 0) {
            const productStyle = product.style.toLowerCase();
            const selectedStyles = filters.dressStyle.map(s => s.toLowerCase());

            if (!selectedStyles.includes(productStyle)) {
                return false;
            }
        }

        // Price
        const finalPrice = getFinalPrice(product);
        if ((filters.minPrice !== null && finalPrice < filters.minPrice) ||
            (filters.maxPrice !== null && finalPrice > filters.maxPrice)) {
            return false;
        }
        return true;
    });
}
function toggleEmptyState(hasProducts) {
    const emptyState = document.getElementById("empty-state");
    const productsGrid = document.querySelector(".product-items");
    // Pagination container is the parent of #prevBtn
    const pagination = document.getElementById("prevBtn")?.parentElement;

    if (hasProducts) {
        if (emptyState) emptyState.classList.add("hidden");
        if (productsGrid) productsGrid.classList.remove("hidden");
        if (pagination) pagination.classList.remove("hidden");
    } else {
        if (emptyState) emptyState.classList.remove("hidden");
        if (emptyState) emptyState.style.display = "flex"; // Ensure flex display for centering
        if (productsGrid) productsGrid.classList.add("hidden");
        if (pagination) pagination.classList.add("hidden");
    }
}
document.getElementById("clearFiltersBtn").addEventListener("click", () => {
    // 1. Reset filters object
    filters = {
        minPrice: 25,
        maxPrice: 200,
        categoryId: null,
        dressStyle: [],
        size: [],
        searchQuery: ""
    };

    // 2. Clear UI active states
    document.querySelectorAll(".category, .size-item, .style-item").forEach(el => el.classList.remove("active"));

    // 3. Reset Slider UI
    minRange.value = 25;
    maxRange.value = 200;
    updateSlider();

    // 4. Reset Labels & Headers
    selectedCategoryContainer.forEach(i => i.innerHTML = "All Products");
    if (productSearchInput) productSearchInput.value = "";

    // 5. Clear URL Hash Parameters if any
    const baseUrl = window.location.hash.split('?')[0];
    if (window.location.hash.includes('?')) {
        window.location.hash = baseUrl;
    }

    // 6. Refresh List
    currentPage = 1;
    loadPage();
});


var showFilter = document.getElementById("settings");
var filterSideBar = document.querySelector(".filters");
var overlay = document.getElementById("overlay");

showFilter.addEventListener("click", function () {
    overlay.classList.add("overlay");
    filterSideBar.classList.toggle("show-filter");
});
var closeBtn = document.getElementById("closeBtn");
closeBtn.addEventListener("click", function () {
    filterSideBar.classList.remove("show-filter")

})

// In-page search functionality
const productSearchInput = document.querySelector('input[placeholder="Search for food..."]');
if (productSearchInput) {
    productSearchInput.addEventListener('input', (e) => {
        filters.searchQuery = e.target.value.trim();
        currentPage = 1;
        loadPage();
    });

    // Set initial value if coming from header search
    if (filters.searchQuery) {
        productSearchInput.value = filters.searchQuery;
    }
}


