let cachedProducts = null;
let cachedCategories = null;

// get all products from json file [Used in main,home,products]
export async function getAllProducts() {
  if (cachedProducts) return cachedProducts;
  const response = await fetch(`./data/product.json`);
  cachedProducts = await response.json();
  return cachedProducts;
}

//get all categories from json [used in chatbot,products]
export async function getAllCategories() {
  if (cachedCategories) return cachedCategories;
  const response = await fetch("./data/categories.json");
  cachedCategories = await response.json();
  return cachedCategories;
}

// get product by id [Used in product details]
export async function getProductById(id) {
  const products = await getAllProducts();
  return products.find((product) => product.id == id);
}

// get products by categoryId [Used in chatbot,product details,product]
export async function getProductsByCategoryId(categoryId) {
  const products = await getAllProducts()
  const filteredProducts = products.filter(product => product.categoryId == categoryId)
  return filteredProducts;
}
//get category by name [Not used anywhere]
export async function getCategoryByName(categoryName) {
  const categories = await getAllCategories();
  return categories.find((category) => category.name == categoryName);
}

// get all reviews [Used in home]
export async function getAllReviews() {
  const products = await getAllProducts();
  let jsonReviews = [];
  products.forEach((product) => {
    if (product.reviews && Array.isArray(product.reviews)) {
      jsonReviews = jsonReviews.concat(product.reviews);
    }
  });

  const localReviews = JSON.parse(localStorage.getItem("reviews") || "[]");
  return [...jsonReviews, ...localReviews];
}

//get reviews (local storage & json file) for specific product  [Used in product details]
export async function getReviewsByProductId(productId) {
  const products = await getAllProducts();
  const product = products.find((p) => p.id == productId);
  const jsonReviews = product ? (product.reviews || []) : [];

  const localReviews = JSON.parse(localStorage.getItem("reviews") || "[]");
  const filteredLocalReviews = localReviews.filter((r) => r.productId == productId);

  return [...jsonReviews, ...filteredLocalReviews];
}

// get product by count [Not Used]
export async function getProductByCount(start, end) {
  const products = await getAllProducts();
  return products.slice(start, end);
}

//Used in product details
export async function countReviews(productId) {
  const reviews = await getReviewsByProductId(productId);
  return reviews.length;
}

// get discount [Not Used]
export async function getDiscount(productId) {
  const product = await getProductById(productId);
  return product ? product.discount : 0;
}
// Used in products
export async function getCategoryById(categoryId) {
  const categories = await getAllCategories();
  return categories.find((category) => category.id == categoryId);
}

// Calculate discounted price [Used in product details]
export function calculateDiscountedPrice(price, discountPercentage) {
  if (!discountPercentage) return price;
  return price - price * (discountPercentage / 100);
}
//get product id from url [Used in product details]
export function getProductId() {
  const hash = (location.hash || "").split("?")[1];
  if (!hash) return null;
  return new URLSearchParams(hash).get("id");
}

//add review [Used in product details]
export function addReview(review) {
  let reviews = JSON.parse(localStorage.getItem("reviews") || "[]");
  if (!Array.isArray(reviews)) {
    reviews = [];
  }
  reviews.push(review);
  localStorage.setItem("reviews", JSON.stringify(reviews));
}


// Centralized Product Card Template (Arch Style)
export function renderProductCard(product, categoryName, animationClass = "", delay = "0") {
  const discountedPrice = calculateDiscountedPrice(product.price, product.discountPercentage);

  // Fix image paths for SPA (relative to root index.html)
  const imagePath = product.mainImage.startsWith('../assets/') ? product.mainImage.substring(3) : product.mainImage;

  // Dynamic Stars
  const fullStars = Math.floor(product.rating);
  const hasHalfStar = product.rating % 1 >= 0.5;
  let starsHtml = '';
  for (let j = 1; j <= 5; j++) {
    if (j <= fullStars) {
      starsHtml += '<i class="fas fa-star"></i>';
    } else if (j === fullStars + 1 && hasHalfStar) {
      starsHtml += '<i class="fas fa-star-half-alt"></i>';
    } else {
      starsHtml += '<i class="fas fa-star text-gray-300"></i>';
    }
  }

  return `
    <div class="food-card-arch ${animationClass}" style="animation-delay: ${delay}s">
        <div class="arch-img-container">
            <img src="${imagePath}" alt="${product.name}">
        </div>
        <p class="text-(--primary) text-xs font-bold uppercase mb-1">${categoryName || 'Gourmet Selection'}</p>
        <h3 class="font-bold text-xl mb-1 truncate w-full text-center text-(--primary)">${product.name}</h3>
        <div class="flex justify-center items-center gap-1 mb-3 text-yellow-400 text-sm">
            ${starsHtml}
            <span class="text-(--sec-text) ml-1 text-xs">(${product.rating})</span>
        </div>
        
        <div class="flex items-center justify-between mt-auto w-full px-2">
            ${product.discountPercentage ? `
            <div class="flex flex-col items-start text-left">
                <span class="font-bold text-lg text-(--main-text)">$${parseInt(discountedPrice)}</span>
                <div class="flex gap-1 text-xs">
                    <span class="text-gray-400 line-through">$${parseInt(product.price)}</span>
                    <span class="text-red-500 font-bold">-${product.discountPercentage}%</span>
                </div>
            </div>` : `<div class="font-bold text-lg text-(--main-text)">$${parseInt(product.price)}</div>`}
            
            <a href="index.html#product?id=${product.id}"
                class="bg-(--primary) text-white font-bold py-2 px-4 rounded-full hover:bg-white hover:text-(--primary) transform hover:scale-105 transition shadow-lg text-center text-xs">
                Order Now
            </a>
        </div>
    </div>`;
}

// Global render function
export async function renderProducts(products, container) {
  if (!container) return;
  container.innerHTML = "";

  const cardsHtml = await Promise.all(products.map(async (product, index) => {
    const categoryName = product.categoryName || (await getCategoryById(product.categoryId))?.name;
    const animationClass = index % 2 === 0 ? "animate-side" : "animate-top";
    const delay = (index * 0.1).toFixed(1);
    return renderProductCard(product, categoryName, animationClass, delay);
  }));

  container.innerHTML = cardsHtml.join('');
}

// make product on click go to product details page

export function makeLink(arr) {
  arr.forEach((e) => {
    e.addEventListener("click", () => {
      window.location.href = `#product?id=${e.getAttribute("key")}`;
    });
  });
}
