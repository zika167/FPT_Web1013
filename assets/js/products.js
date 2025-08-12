// Products data and rendering functionality
const productsData = [
    {
        id: 1,
        name: "Coffee Beans - Espresso Arabica and Robusta Beans",
        brand: "Lavazza",
        price: 47.00,
        rating: 4.3,
        image: "./assets/img/product/item-1.png",
        isLiked: false
    },
    {
        id: 2,
        name: "Lavazza Coffee Blends - Try the Italian Espresso",
        brand: "Lavazza",
        price: 53.00,
        rating: 3.4,
        image: "./assets/img/product/item-2.png",
        isLiked: false
    },
    {
        id: 3,
        name: "Lavazza - Caffè Espresso Black Tin - Ground coffee",
        brand: "welikecoffee",
        price: 99.99,
        rating: 5.0,
        image: "./assets/img/product/item-3.png",
        isLiked: true
    },
    {
        id: 4,
        name: "Qualità Oro Mountain Grown - Espresso Coffee Beans",
        brand: "Lavazza",
        price: 38.65,
        rating: 4.4,
        image: "./assets/img/product/item-4.png",
        isLiked: false
    },
    {
        id: 5,
        name: "Coffee Beans - Espresso Arabica and Robusta Beans",
        brand: "Lavazza",
        price: 47.00,
        rating: 4.3,
        image: "./assets/img/product/item-5.png",
        isLiked: true
    },
    {
        id: 6,
        name: "Lavazza Coffee Blends - Try the Italian Espresso",
        brand: "Lavazza",
        price: 53.00,
        rating: 3.4,
        image: "./assets/img/product/item-6.png",
        isLiked: false
    },
    {
        id: 7,
        name: "Lavazza - Caffè Espresso Black Tin - Ground coffee",
        brand: "welikecoffee",
        price: 99.99,
        rating: 5.0,
        image: "./assets/img/product/item-7.png",
        isLiked: false
    },
    {
        id: 8,
        name: "Qualità Oro Mountain Grown - Espresso Coffee Beans",
        brand: "Lavazza",
        price: 38.65,
        rating: 4.4,
        image: "./assets/img/product/item-8.png",
        isLiked: false
    }
    ,
    // Additional items to show 16 cards on home/index-logined
    {
        id: 9,
        name: "Arabica Classic Roast - Whole Bean",
        brand: "Lavazza",
        price: 42.50,
        rating: 4.2,
        image: "./assets/img/product/item-1.png",
        isLiked: false
    },
    {
        id: 10,
        name: "Espresso Perfetto - Dark Roast",
        brand: "Lavazza",
        price: 55.00,
        rating: 3.9,
        image: "./assets/img/product/item-2.png",
        isLiked: false
    },
    {
        id: 11,
        name: "Caffè Crema - Ground Coffee",
        brand: "welikecoffee",
        price: 88.90,
        rating: 4.8,
        image: "./assets/img/product/item-3.png",
        isLiked: false
    },
    {
        id: 12,
        name: "Mountain Grown Gold - Beans",
        brand: "Lavazza",
        price: 36.20,
        rating: 4.1,
        image: "./assets/img/product/item-4.png",
        isLiked: false
    },
    {
        id: 13,
        name: "Arabica Robusta Blend - Beans",
        brand: "Lavazza",
        price: 47.00,
        rating: 4.5,
        image: "./assets/img/product/item-5.png",
        isLiked: false
    },
    {
        id: 14,
        name: "Italian Espresso Selection",
        brand: "Lavazza",
        price: 53.00,
        rating: 3.6,
        image: "./assets/img/product/item-6.png",
        isLiked: false
    },
    {
        id: 15,
        name: "Caffè Espresso Black Tin",
        brand: "welikecoffee",
        price: 95.99,
        rating: 4.9,
        image: "./assets/img/product/item-7.png",
        isLiked: false
    },
    {
        id: 16,
        name: "Oro Mountain Grown - Beans",
        brand: "Lavazza",
        price: 39.99,
        rating: 4.4,
        image: "./assets/img/product/item-8.png",
        isLiked: false
    }
];

class ProductRenderer {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.products = productsData;
        this.filteredProducts = [...this.products];
        
        this.init();
    }
    
    init() {
        if (!this.container) return;
        
        this.renderProducts();
        this.initLikeButtons();
    }
    
    renderProducts(products = this.filteredProducts) {
        if (!this.container) return;
        
        this.container.innerHTML = products.map(product => this.createProductHTML(product)).join('');
        this.initLikeButtons();
    }
    
    createProductHTML(product) {
        const likeClass = product.isLiked ? 'like-btn__liked' : '';
        return `
            <div class="col">
                <article class="product-card">
                    <div class="product-card__img-wrap">
                        <a href="./product-detail.html">
                            <img src="${product.image}" alt="${product.name}" class="product-card__thumb" />
                        </a>
                        <button class="like-btn product-card__like-btn ${likeClass}" data-product-id="${product.id}">
                            <img src="./assets/icon/heart.svg" alt="" class="like-btn__icon icon" />
                            <img src="./assets/icon/heart-red.svg" alt="" class="like-btn__icon--liked" />
                        </button>
                    </div>
                    <h3 class="product-card__title">
                        <a href="./product-detail.html">${product.name}</a>
                    </h3>
                    <p class="product-card__brand">${product.brand}</p>
                    <div class="product-card__row">
                        <span class="product-card__price">$${product.price.toFixed(2)}</span>
                        <img src="./assets/icon/star.svg" alt="" class="product-card__star" />
                        <span class="product-card__score">${product.rating}</span>
                    </div>
                    <div class="product-card__row">
                        <button class="btn btn--primary js-add-to-cart"
                                data-id="${product.id}"
                                data-name="${product.name}"
                                data-price="${product.price}"
                                data-image="${product.image}">
                            Add to cart
                        </button>
                    </div>
                </article>
            </div>
        `;
    }
    
    initLikeButtons() {
        const likeButtons = this.container.querySelectorAll('.like-btn');
        likeButtons.forEach(button => {
            button.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                // Toggle class reliably regardless of viewport
                button.classList.toggle('like-btn__liked');
            };
        });
    }
    
    // Deprecated per viewport bug; logic handled inline above
    handleLikeClick() {
        // no-op
    }
    
    filterProducts(filters = {}) {
        this.filteredProducts = this.products.filter(product => {
            // Price filter
            if (filters.minPrice !== undefined && product.price < filters.minPrice) return false;
            if (filters.maxPrice !== undefined && product.price > filters.maxPrice) return false;
            
            // Brand filter
            if (filters.brand && filters.brand !== 'all' && product.brand.toLowerCase() !== filters.brand.toLowerCase()) return false;
            
            return true;
        });
        
        this.renderProducts();
        this.updateProductCount();
    }
    
    updateProductCount() {
        const countElement = document.querySelector('.home__heading');
        if (countElement) {
            const totalCount = this.filteredProducts.length;
            countElement.textContent = `Total LavAzza ${totalCount}`;
        }
    }
    
    searchProducts(query) {
        if (!query.trim()) {
            this.filteredProducts = [...this.products];
        } else {
            this.filteredProducts = this.products.filter(product => 
                product.name.toLowerCase().includes(query.toLowerCase()) ||
                product.brand.toLowerCase().includes(query.toLowerCase())
            );
        }
        
        this.renderProducts();
        this.updateProductCount();
    }
}

// Initialize product renderer when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const productContainer = document.querySelector('.row.row-cols-4.row-cols-lg-2.row-cols-sm-1.g-3');
    if (productContainer) {
        window.productRenderer = new ProductRenderer('.row.row-cols-4.row-cols-lg-2.row-cols-sm-1.g-3');
    }
    // Bind add-to-cart buttons for static category page as well
    bindAddToCartButtons();
});

// Also initialize when templates are loaded
window.addEventListener('template-loaded', function() {
    const productContainer = document.querySelector('.row.row-cols-4.row-cols-lg-2.row-cols-sm-1.g-3');
    if (productContainer && !window.productRenderer) {
        window.productRenderer = new ProductRenderer('.row.row-cols-4.row-cols-lg-2.row-cols-sm-1.g-3');
    }
    bindAddToCartButtons();
});

// Filter functionality
function applyFilters() {
    const minPrice = parseFloat(document.getElementById('min-price')?.value) || 0;
    const maxPrice = parseFloat(document.getElementById('max-price')?.value) || 200;
    const brandSelect = document.querySelector('.weight-size');
    const selectedBrand = brandSelect ? brandSelect.value : 'all';
    
    if (window.productRenderer) {
        window.productRenderer.filterProducts({
            minPrice: minPrice,
            maxPrice: maxPrice,
            brand: selectedBrand
        });
    }
}

// Search functionality
function searchProducts() {
    const searchInput = document.querySelector('.filter__form-input');
    if (searchInput && window.productRenderer) {
        window.productRenderer.searchProducts(searchInput.value);
    }
}

// ===== Add-to-cart for product cards =====
function bindAddToCartButtons() {
    document.querySelectorAll('.js-add-to-cart').forEach((btn) => {
        btn.onclick = function(e) {
            e.preventDefault();
            const id = `list_${this.dataset.id}`;
            const name = this.dataset.name;
            const price = parseFloat(this.dataset.price) || 0;
            const image = this.dataset.image;
            if (window.CartService && typeof window.CartService.add === 'function') {
                window.CartService.add({ id, name, price, image });
            }
        };
    });
}