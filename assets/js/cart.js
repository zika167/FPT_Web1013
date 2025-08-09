// Cart management system
class Cart {
    constructor() {
        this.items = this.loadFromStorage();
        this.init();
    }

    init() {
        this.renderCart();
        this.updateCartCount();
        this.bindEvents();
        
        // Update cart count when header is loaded
        this.waitForHeader();
    }

    // Wait for header to be loaded before updating cart count
    waitForHeader() {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max
        
        const checkHeader = () => {
            const cartCountElements = document.querySelectorAll('.nav-btn__qnt');
            if (cartCountElements.length > 0) {
                this.updateCartCount();
            } else if (attempts < maxAttempts) {
                attempts++;
                setTimeout(checkHeader, 100);
            }
        };
        checkHeader();
    }

    // Load cart from localStorage
    loadFromStorage() {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    }

    // Save cart to localStorage
    saveToStorage() {
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateCartCount();
    }

    // Add item to cart
    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        
        this.saveToStorage();
        this.renderCart();
        this.showToast('Đã thêm sản phẩm vào giỏ hàng!');
    }

    // Remove item from cart
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveToStorage();
        this.renderCart();
        this.showToast('Đã xóa sản phẩm khỏi giỏ hàng!');
    }

    // Update item quantity
    updateQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeItem(productId);
            return;
        }

        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            this.saveToStorage();
            this.renderCart();
        }
    }

    // Calculate subtotal
    calculateSubtotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Calculate shipping (free for orders over $50)
    calculateShipping() {
        const subtotal = this.calculateSubtotal();
        return subtotal >= 50 ? 0 : 5.99;
    }

    // Calculate total
    calculateTotal() {
        return this.calculateSubtotal() + this.calculateShipping();
    }

    // Update cart count in header
    updateCartCount() {
        const cartCount = this.items.reduce((total, item) => total + item.quantity, 0);
        
        // Update cart count in header
        const cartCountElements = document.querySelectorAll('.nav-btn__qnt');
        cartCountElements.forEach(element => {
            element.textContent = cartCount;
        });
        
        // Also update cart count in any other places that might show it
        const cartCountDisplayElements = document.querySelectorAll('[data-cart-count]');
        cartCountDisplayElements.forEach(element => {
            element.textContent = cartCount;
        });
        
        // Update cart count in any other elements with specific classes
        const cartCountClassElements = document.querySelectorAll('.cart-count, .cart-quantity');
        cartCountClassElements.forEach(element => {
            element.textContent = cartCount;
        });
        
        // Update cart count in any other elements with specific IDs
        const cartCountIdElements = document.querySelectorAll('#cart-count, #cart-quantity');
        cartCountIdElements.forEach(element => {
            element.textContent = cartCount;
        });
    }

    // Render cart items
    renderCart() {
        const cartContainer = document.getElementById('cart-items');
        const emptyCart = document.getElementById('empty-cart');
        
        if (this.items.length === 0) {
            cartContainer.style.display = 'none';
            emptyCart.style.display = 'block';
            this.updateSummary();
            return;
        }

        cartContainer.style.display = 'block';
        emptyCart.style.display = 'none';

        cartContainer.innerHTML = this.items.map(item => `
            <article class="cart-item" data-id="${item.id}">
                <a href="./product-detail.html">
                    <img
                        src="${item.image}"
                        alt="${item.name}"
                        class="cart-item__thumb"
                    />
                </a>
                
                <div class="cart-item__content">
                    <div class="cart-item__content-left">
                        <h3 class="cart-item__title">
                            <a href="./product-detail.html">${item.name}</a>
                        </h3>
                        
                        <p class="cart-item__price-wrap">
                            <span class="cart-item__price">$${item.price.toFixed(2)}</span>
                            <span class="cart-item__status">Còn hàng</span>
                        </p>
                        
                        <div class="cart-item__ctrl cart-item__ctrl--md-block">
                            <div class="cart-item__input">
                                <button class="cart-item__input-btn js-decrease-quantity" data-id="${item.id}">
                                    <img
                                        src="./assets/icon/minus.svg"
                                        alt=""
                                        class="icon"
                                    />
                                </button>
                                <input
                                    type="number"
                                    value="${item.quantity}"
                                    class="cart-item__input-number js-quantity-input"
                                    data-id="${item.id}"
                                    min="1"
                                />
                                <button class="cart-item__input-btn js-increase-quantity" data-id="${item.id}">
                                    <img
                                        src="./assets/icon/plus.svg"
                                        alt=""
                                        class="icon"
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="cart-item__content-right">
                        <p class="cart-item__total-price">$${(item.price * item.quantity).toFixed(2)}</p>
                        <div class="cart-item__ctrl">
                            <button class="cart-item__ctrl-btn js-remove-item" data-id="${item.id}">
                                <img
                                    src="./assets/icon/trash.svg"
                                    alt=""
                                    class="icon"
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </article>
        `).join('');

        this.updateSummary();
    }

    // Update cart summary
    updateSummary() {
        const subtotal = this.calculateSubtotal();
        const shipping = this.calculateShipping();
        const total = this.calculateTotal();
        
        document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('shipping').textContent = shipping === 0 ? 'Miễn phí' : `$${shipping.toFixed(2)}`;
        document.getElementById('total').textContent = `$${total.toFixed(2)}`;
        
        // Enable/disable checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        checkoutBtn.disabled = this.items.length === 0;
    }

    // Show toast notification
    showToast(message) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');
        
        if (toast && toastMessage) {
            toastMessage.textContent = message;
            toast.style.display = 'block';
            
            // Auto hide after 3 seconds
            setTimeout(() => {
                toast.style.display = 'none';
            }, 3000);
        } else {
            // Fallback: create temporary toast
            this.createTemporaryToast(message);
        }
    }

    // Create temporary toast if the main toast doesn't exist
    createTemporaryToast(message) {
        const tempToast = document.createElement('div');
        tempToast.className = 'toast';
        tempToast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #fff;
            border: 1px solid #e8e8e8;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        tempToast.innerHTML = `
            <div class="toast__content">
                <img src="./assets/icon/checkbox-checked.svg" alt="" class="toast__icon" />
                <span class="toast__message">${message}</span>
            </div>
        `;
        
        document.body.appendChild(tempToast);
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            tempToast.remove();
        }, 3000);
    }

    // Bind event listeners
    bindEvents() {
        // Delegate events to cart container
        document.addEventListener('click', (e) => {
            if (e.target.closest('.js-decrease-quantity')) {
                const button = e.target.closest('.js-decrease-quantity');
                const productId = button.dataset.id;
                const item = this.items.find(item => item.id === productId);
                if (item) {
                    this.updateQuantity(productId, item.quantity - 1);
                }
            }
            
            if (e.target.closest('.js-increase-quantity')) {
                const button = e.target.closest('.js-increase-quantity');
                const productId = button.dataset.id;
                const item = this.items.find(item => item.id === productId);
                if (item) {
                    this.updateQuantity(productId, item.quantity + 1);
                }
            }
            
            if (e.target.closest('.js-remove-item')) {
                const button = e.target.closest('.js-remove-item');
                const productId = button.dataset.id;
                this.removeItem(productId);
            }
        });

        // Handle quantity input changes
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('js-quantity-input')) {
                const input = e.target;
                const productId = input.dataset.id;
                const newQuantity = parseInt(input.value) || 1;
                
                // Update quantity after a short delay to avoid too many updates
                clearTimeout(input.timeout);
                input.timeout = setTimeout(() => {
                    this.updateQuantity(productId, newQuantity);
                }, 500);
            }
        });

        // Handle checkout button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'checkout-btn') {
                if (this.items.length > 0) {
                    window.location.href = './checkout.html';
                }
            }
        });
    }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for templates to load
    setTimeout(() => {
        if (!window.cart) {
            window.cart = new Cart();
        }
    }, 200);
});

// Also initialize when templates are loaded
window.addEventListener('template-loaded', () => {
    if (!window.cart) {
        window.cart = new Cart();
    }
});

// Fallback initialization
setTimeout(() => {
    if (!window.cart) {
        window.cart = new Cart();
    }
}, 1000);

// Global function to add item to cart (called from product pages)
function addToCart(product) {
    if (window.cart) {
        window.cart.addItem(product);
    } else {
        // If cart is not initialized yet, store in localStorage temporarily
        const tempCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = tempCart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            tempCart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(tempCart));
        
        // Show toast
        showToastNotification('Đã thêm sản phẩm vào giỏ hàng!');
    }
}

// Function to show toast notification (for use outside cart page)
function showToastNotification(message) {
    // Create temporary toast if none exists
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        toast.innerHTML = `
            <div class="toast__content">
                <img src="./assets/icon/checkbox-checked.svg" alt="" class="toast__icon" />
                <span class="toast__message">${message}</span>
            </div>
        `;
        document.body.appendChild(toast);
    } else {
        const toastMessage = toast.querySelector('.toast__message');
        if (toastMessage) {
            toastMessage.textContent = message;
        }
    }
    
    toast.style.display = 'block';
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}
