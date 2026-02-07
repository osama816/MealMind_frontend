import {
  getAllProducts,
  getAllReviews,
  renderProducts,
  makeLink
} from "../services/product_services.js";

// Fade In Fade Out Slider
let images = document.querySelectorAll(".slider img");
let currentIndex = 0;
function nextImage() {
  images[currentIndex].classList.replace("opacity-100", "opacity-0");
  currentIndex = (currentIndex + 1) % images.length;
  images[currentIndex].classList.replace("opacity-0", "opacity-100");
}
setInterval(nextImage, 1500);

const container = document.getElementById("newsTicker");
const wrapper = document.getElementById("tickerWrapper");

// 1. Prepare for infinite loop by cloning items
// We clone the entire set of items to ensure seamless transition
const originalItems = Array.from(wrapper.children);
originalItems.forEach((item) => {
  const clone = item.cloneNode(true);
  wrapper.appendChild(clone);
});

// 2. Animation Variables
let scrollPos = 0;
let isPaused = false;
const speed = 0.8;
/*
 * Main animation loop
 */
function step() {
  if (!isPaused) {
    scrollPos -= speed;

    // Reset when the first half (original set) has completely scrolled out
    const resetPoint = wrapper.scrollWidth / 2;

    if (Math.abs(scrollPos) >= resetPoint) {
      scrollPos = 0;
    }

    wrapper.style.transform = `translateX(${scrollPos}px)`;
  }
  requestAnimationFrame(step);
}

// 3. Interaction Listeners
// Pause on hover for better readability
container.addEventListener("mouseenter", () => (isPaused = true));
container.addEventListener("mouseleave", () => (isPaused = false));

// Mobile touch support
container.addEventListener("touchstart", () => (isPaused = true), {
  passive: true,
});
container.addEventListener("touchend", () => (isPaused = false), {
  passive: true,
});

// 4. Start Animation
requestAnimationFrame(step);

// New Arrival
let productsContainer = document.querySelector("#new-arrivals");
let allProducts = await getAllProducts();

let newArrival = allProducts.slice(-4);
renderProducts(newArrival, productsContainer);

// Top Selling
let topProductsContainer = document.querySelector("#top");

let topSelling = allProducts.slice(0, 4);

renderProducts(topSelling, topProductsContainer);

// Reviews
let revContainer = document.querySelector("#rev");
let reviews = await getAllReviews();

reviews.slice(0, 5).map((review) => {
  let p = `
  <div class="shrink-0 border border-(--border) rounded-3xl p-6 w-80 mb-5 bg-(--sec-bg)" key=${review.id || review.createdAt
    }>
    <div class="flex justify-between items-start mb-3">
        <div class="text-yellow-400 text-sm">${"★".repeat(
      review.rating
    )}${"☆".repeat(5 - review.rating)}</div>
    </div>
    <div class="flex items-center mb-2">
        <h4 class="font-bold text-base mr-2">${review.userName || review.name
    }</h4>
        <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
    </div>
    <p class="text-(--sec-text) opacity-70 text-sm leading-relaxed truncate-2-lines italic">"${review.comment
    }"</p>
  </div>`;
  revContainer.innerHTML += p;
});

makeLink(document.querySelectorAll(".product-link"));
