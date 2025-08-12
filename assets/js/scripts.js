const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

/**
 * Hàm tải template
 *
 * Cách dùng:
 * <div id="parent"></div>
 * <script>
 *  load("#parent", "./path-to-template.html");
 * </script>
 */
function load(selector, path) {
    const cached = localStorage.getItem(path);
    if (cached) {
        $(selector).innerHTML = cached;
    }

    fetch(path)
        .then((res) => res.text())
        .then((html) => {
            if (html !== cached) {
                $(selector).innerHTML = html;
                localStorage.setItem(path, html);
            }
        })
        .finally(() => {
            window.dispatchEvent(new Event("template-loaded"));
        });
}

/**
 * Hàm kiểm tra một phần tử
 * có bị ẩn bởi display: none không
 */
function isHidden(element) {
    if (!element) return true;

    if (window.getComputedStyle(element).display === "none") {
        return true;
    }

    let parent = element.parentElement;
    while (parent) {
        if (window.getComputedStyle(parent).display === "none") {
            return true;
        }
        parent = parent.parentElement;
    }

    return false;
}

/**
 * Hàm buộc một hành động phải đợi
 * sau một khoảng thời gian mới được thực thi
 */
function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, timeout);
    };
}

/**
 * Hàm tính toán vị trí arrow cho dropdown
 *
 * Cách dùng:
 * 1. Thêm class "js-dropdown-list" vào thẻ ul cấp 1
 * 2. CSS "left" cho arrow qua biến "--arrow-left-pos"
 */
const calArrowPos = debounce(() => {
    if (isHidden($(".js-dropdown-list"))) return;

    const items = $$(".js-dropdown-list > li");

    items.forEach((item) => {
        const arrowPos = item.offsetLeft + item.offsetWidth / 2;
        item.style.setProperty("--arrow-left-pos", `${arrowPos}px`);
    });
});

// Tính toán lại vị trí arrow khi resize trình duyệt
window.addEventListener("resize", calArrowPos);

// Tính toán lại vị trí arrow sau khi tải template
window.addEventListener("template-loaded", calArrowPos);

/**
 * Giữ active menu khi hover
 *
 * Cách dùng:
 * 1. Thêm class "js-menu-list" vào thẻ ul menu chính
 * 2. Thêm class "js-dropdown" vào class "dropdown" hiện tại
 *  nếu muốn reset lại item active khi ẩn menu
 */
window.addEventListener("template-loaded", handleActiveMenu);

function handleActiveMenu() {
    const dropdowns = $$(".js-dropdown");
    const menus = $$(".js-menu-list");
    const activeClass = "menu-column__item--active";

    const removeActive = (menu) => {
        menu.querySelector(`.${activeClass}`)?.classList.remove(activeClass);
    };

    const init = () => {
        menus.forEach((menu) => {
            const items = menu.children;
            if (!items.length) return;

            removeActive(menu);
            if (window.innerWidth > 991) items[0].classList.add(activeClass);

            Array.from(items).forEach((item) => {
                item.onmouseenter = () => {
                    if (window.innerWidth <= 991) return;
                    removeActive(menu);
                    item.classList.add(activeClass);
                };
                item.onclick = () => {
                    if (window.innerWidth > 991) return;
                    removeActive(menu);
                    item.classList.add(activeClass);
                    item.scrollIntoView();
                };
            });
        });
    };

    init();

    dropdowns.forEach((dropdown) => {
        dropdown.onmouseleave = () => init();
    });
}

/**
 * JS toggle
 *
 * Cách dùng:
 * <button class="js-toggle" toggle-target="#box">Click</button>
 * <div id="box">Content show/hide</div>
 */
window.addEventListener("template-loaded", initJsToggle);

function initJsToggle() {
    $$(".js-toggle").forEach((button) => {
        const target = button.getAttribute("toggle-target");
        if (!target) {
            document.body.innerText = `Cần thêm toggle-target cho: ${button.outerHTML}`;
        }
        button.onclick = (e) => {
            e.preventDefault();
            if (!$(target)) {
                return (document.body.innerText = `Không tìm thấy phần tử "${target}"`);
            }
            const isHidden = $(target).classList.contains("hide");

            requestAnimationFrame(() => {
                $(target).classList.toggle("hide", !isHidden);
                $(target).classList.toggle("show", isHidden);
            });
        };
        document.onclick = function (e) {
            if (!e.target.closest(target)) {
                const isHidden = $(target).classList.contains("hide");
                if (!isHidden) {
                    button.click();
                }
            }
        };
    });
}

window.addEventListener("template-loaded", () => {
    const links = $$(".js-dropdown-list > li > a");

    links.forEach((link) => {
        link.onclick = () => {
            if (window.innerWidth > 991) return;
            const item = link.closest("li");
            item.classList.toggle("navbar__item--active");
        };
    });
});

window.addEventListener("template-loaded", () => {
    const tabsSelector = "prod-tab__item";
    const contentsSelector = "prod-tab__content";

    const tabActive = `${tabsSelector}--current`;
    const contentActive = `${contentsSelector}--current`;

    const tabContainers = $$(".js-tabs");
    tabContainers.forEach((tabContainer) => {
        const tabs = tabContainer.querySelectorAll(`.${tabsSelector}`);
        const contents = tabContainer.querySelectorAll(`.${contentsSelector}`);
        tabs.forEach((tab, index) => {
            tab.onclick = () => {
                tabContainer.querySelector(`.${tabActive}`)?.classList.remove(tabActive);
                tabContainer.querySelector(`.${contentActive}`)?.classList.remove(contentActive);
                tab.classList.add(tabActive);
                contents[index].classList.add(contentActive);
            };
        });
    });
});

window.addEventListener("template-loaded", () => {
    const switchBtn = document.querySelector("#switch-theme-btn");
    if (switchBtn) {
        switchBtn.onclick = function () {
            const isDark = localStorage.dark === "true";
            document.querySelector("html").classList.toggle("dark", !isDark);
            localStorage.setItem("dark", !isDark);
            switchBtn.querySelector("span").textContent = isDark ? "Dark mode" : "Light mode";
        };
        const isDark = localStorage.dark === "true";
        switchBtn.querySelector("span").textContent = isDark ? "Light mode" : "Dark mode";
    }
});

const isDark = localStorage.dark === "true";
document.querySelector("html").classList.toggle("dark", isDark);

/**
 * Hàm ẩn hiện trái tim đỏ khi ấn vào phần sản phẩm
 * Chỉ áp dụng cho các nút like không có data-product-id (không phải sản phẩm được render bởi JavaScript)
 */
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".like-btn:not([data-product-id])").forEach((button) => {
        button.addEventListener("click", function () {
            this.classList.toggle("like-btn__liked");
        });
    });
});

// Hàm lựa chọn sản phẩm
function updatePrice(value) {
    document.getElementById("price-value").innerText = `$${value}.00`;
}

function toggleSelected1(button) {
    document.querySelectorAll(".form__tags button.btn1").forEach((btn) => btn.classList.remove("selected"));
    button.classList.add("selected");
}

function toggleSelected2(button) {
    document.querySelectorAll(".form__tags button.btn2").forEach((btn) => btn.classList.remove("selected"));
    button.classList.add("selected");
}

// Xử lý điều kiện trang favourite
// (Removed old favourite-page only handlers)

// ===================== CART SERVICE (localStorage) =====================
(function initCartService() {
  const CART_STORAGE_KEY = 'cartItems';

  function readCartFromStorage() {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  }

  function writeCartToStorage(items) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }

  function getCartItems() {
    return readCartFromStorage();
  }

  function setCartItems(items) {
    writeCartToStorage(items);
    updateHeaderCartUI();
    updateHeaderCartDropdownUI();
  }

  function findItemIndex(items, productId) {
    return items.findIndex((it) => it.id === productId);
  }

  function addToCart(product) {
    const items = getCartItems();
    const index = findItemIndex(items, product.id);
    if (index >= 0) {
      items[index].quantity += 1;
    } else {
      items.push({ ...product, quantity: 1 });
    }
    setCartItems(items);
    showCartToast('Đã thêm vào giỏ hàng');
  }

  function updateQuantity(productId, delta) {
    const items = getCartItems();
    const index = findItemIndex(items, productId);
    if (index < 0) return;
    items[index].quantity += delta;
    if (items[index].quantity <= 0) {
      items.splice(index, 1);
    }
    setCartItems(items);
  }

  function removeItem(productId) {
    const items = getCartItems().filter((it) => it.id !== productId);
    setCartItems(items);
  }

  function getCartTotals() {
    const items = getCartItems();
    const itemCount = items.reduce((sum, it) => sum + it.quantity, 0);
    const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    return { itemCount, subtotal };
  }

  function formatCurrency(value) {
    return `$${value.toFixed(2)}`;
  }

  // ===================== UI HELPERS =====================
  function showCartToast(message) {
    let toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    // Place under header, top-right with 30px gaps
    const headerEl = document.querySelector('#header');
    const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 0;
    toast.style.right = '30px';
    toast.style.top = `${Math.max(0, headerHeight) + 30}px`;
    toast.style.padding = '10px 14px';
    toast.style.background = '#2a7d2e';
    toast.style.color = '#fff';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    toast.style.zIndex = '9999';
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'opacity .3s';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 1200);
  }

  function updateHeaderCartUI() {
    const { itemCount, subtotal } = getCartTotals();
    // Header badge count
    document.querySelectorAll('.nav-btn__qnt').forEach((el) => {
      el.textContent = String(itemCount);
    });
    // Update cart top-act (buy icon) title to show count
    const cartWrap = Array.from(document.querySelectorAll('.top-act__btn-wrap')).find((wrap) =>
      wrap.querySelector('img.top-act__icon[src*="buy"]')
    );
    if (cartWrap) {
      const countSpan = cartWrap.querySelector('.top-act__title');
      if (countSpan) countSpan.textContent = String(itemCount);
      const ddTitle = cartWrap.querySelector('.act-dropdown__title');
      if (ddTitle) ddTitle.textContent = `You have ${itemCount} item(s)`;
    }
  }

  function updateHeaderCartDropdownUI() {
    const { itemCount, subtotal } = getCartTotals();
    const shipping = itemCount > 0 ? 10 : 0;
    const estimated = subtotal + shipping;
    const cartWrap = Array.from(document.querySelectorAll('.top-act__btn-wrap')).find((wrap) =>
      wrap.querySelector('img.top-act__icon[src*="buy"]')
    );
    if (!cartWrap) return;
    const listEl = cartWrap.querySelector('.act-dropdown__list');
    if (listEl) {
      const items = getCartItems();
      listEl.innerHTML = '';
      items.slice(0, 3).forEach((it) => {
        const col = document.createElement('div');
        col.className = 'col';
        const lineTotal = it.price * it.quantity;
        col.innerHTML = `
          <article class="cart-preview-item">
            <div class="cart-preview-item__img-wrap">
              <img src="${it.image}" alt="" class="cart-preview-item__thumb" />
            </div>
            <h3 class="cart-preview-item__title">${it.name}</h3>
            <p class="cart-preview-item__price">${formatCurrency(lineTotal)}</p>
          </article>`;
        listEl.appendChild(col);
      });
    }
    // Update bottom numbers if present
    const ddBottom = cartWrap.querySelector('.act-dropdown__bottom');
    if (ddBottom) {
      const rows = ddBottom.querySelectorAll('.act-dropdown__row');
      rows.forEach((row) => {
        const label = row.querySelector('.act-dropdown__label')?.textContent?.trim();
        const valueEl = row.querySelector('.act-dropdown__value');
        if (!valueEl) return;
        if (label === 'Subtotal') valueEl.textContent = formatCurrency(subtotal);
        if (label === 'Shipping') valueEl.textContent = formatCurrency(shipping);
        if (label === 'Total Price') valueEl.textContent = formatCurrency(estimated);
      });
    }
  }

  // ===================== PRODUCT DETAIL: ADD TO CART =====================
  function getProductInfoFromDetail() {
    const imgEl = document.querySelector('.prod-preview__list .prod-preview__item:first-child img');
    const nameEl = document.querySelector('.prod-info__heading');
    const priceEl = document.querySelector('.prod-info__price');
    if (!imgEl || !nameEl || !priceEl) return null;
    const image = imgEl.getAttribute('src');
    const name = nameEl.textContent.trim();
    const priceText = priceEl.textContent.trim();
    const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
    // Use a stable id from image path + name
    const id = `${name}__${image}`;
    return { id, name, price, image };
  }

  function bindAddToCartOnDetail() {
    const btn = document.querySelector('.prod-info__add-to-cart');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const product = getProductInfoFromDetail();
      if (!product) return;
      addToCart(product);
    });
  }

  // ===================== CHECKOUT RENDERING =====================
  function renderCheckoutPage() {
    const listEl = document.querySelector('.checkout-page .cart-info__list');
    if (!listEl) return;

    const items = getCartItems();
    if (items.length === 0) {
      listEl.innerHTML = '<p>Giỏ hàng trống.</p>';
    } else {
      listEl.innerHTML = items
        .map((it) => {
          const lineTotal = it.price * it.quantity;
          return `
          <article class="cart-item" data-id="${it.id}" data-price="${it.price}">
            <a href="./product-detail.html">
              <img src="${it.image}" alt="" class="cart-item__thumb" />
            </a>
            <div class="cart-item__content">
              <div class="cart-item__content-left">
                <h3 class="cart-item__title">
                  <a href="./product-detail.html">${it.name}</a>
                </h3>
                <p class="cart-item__price-wrap">
                  ${formatCurrency(it.price)} |
                  <span class="cart-item__status">In Stock</span>
                </p>
                <div class="cart-item__ctrl cart-item__ctrl--md-block">
                  <div class="cart-item__input">LavAzza <img src="./assets/icon/arrow-down-2.svg" alt="" class="icon" /></div>
                  <div class="cart-item__input">
                    <button class="cart-item__input-btn js-cart-minus"><img src="./assets/icon/minus.svg" alt="" class="icon" /></button>
                    <span class="js-cart-qty">${it.quantity}</span>
                    <button class="cart-item__input-btn js-cart-plus"><img src="./assets/icon/plus.svg" alt="" class="icon" /></button>
                  </div>
                </div>
              </div>
              <div class="cart-item__content-right">
                <p class="cart-item__total-price js-line-total">${formatCurrency(lineTotal)}</p>
                <div class="cart-item__ctrl">
                  <button class="cart-item__ctrl-btn"><img src="./assets/icon/heart-2.svg" alt="" />Save</button>
                  <button class="cart-item__ctrl-btn js-cart-delete"><img src="./assets/icon/trash.svg" alt="" />Delete</button>
                </div>
              </div>
            </div>
          </article>`;
        })
        .join('');
    }

    bindCheckoutInteractions();
    updateCheckoutSummary();
  }

  function bindCheckoutInteractions() {
    document.querySelectorAll('.cart-item').forEach((itemEl) => {
      const id = itemEl.getAttribute('data-id');
      const qtyEl = itemEl.querySelector('.js-cart-qty');
      const lineTotalEl = itemEl.querySelector('.js-line-total');
      const unitPrice = parseFloat(itemEl.getAttribute('data-price')) || 0;

      const updateLine = () => {
        const items = getCartItems();
        const it = items.find((i) => i.id === id);
        const qty = it ? it.quantity : 0;
        if (qtyEl) qtyEl.textContent = String(qty);
        if (lineTotalEl) lineTotalEl.textContent = formatCurrency(unitPrice * qty);
      };

      itemEl.querySelector('.js-cart-minus')?.addEventListener('click', (e) => {
        e.preventDefault();
        updateQuantity(id, -1);
        if (!getCartItems().some((i) => i.id === id)) {
          // removed
          itemEl.remove();
        } else {
          updateLine();
        }
        updateCheckoutSummary();
      });

      itemEl.querySelector('.js-cart-plus')?.addEventListener('click', (e) => {
        e.preventDefault();
        updateQuantity(id, 1);
        updateLine();
        updateCheckoutSummary();
      });

      itemEl.querySelector('.js-cart-delete')?.addEventListener('click', (e) => {
        e.preventDefault();
        removeItem(id);
        itemEl.remove();
        updateCheckoutSummary();
      });
    });
  }

  function updateCheckoutSummary() {
    const { itemCount, subtotal } = getCartTotals();
    const shipping = itemCount > 0 ? 10 : 0;
    const estimatedTotal = subtotal + shipping;

    // Right sidebar
    const root = document.querySelector('.checkout-page');
    if (!root) return;

    const itemsLabel = root.querySelector('.cart-info__row .cart-info__sub-label');
    if (itemsLabel?.textContent.includes('(items)')) {
      const itemsCountValueEl = itemsLabel.closest('.cart-info__row')?.querySelector('span:last-child');
      if (itemsCountValueEl) itemsCountValueEl.textContent = String(itemCount);
    }

    const totalPriceValueEl = Array.from(root.querySelectorAll('.cart-info__row'))
      .find((row) => row.textContent.trim().startsWith('Price'))
      ?.querySelector('span:last-child');
    if (totalPriceValueEl) totalPriceValueEl.textContent = formatCurrency(subtotal);

    const shippingValueEl = Array.from(root.querySelectorAll('.cart-info__row'))
      .find((row) => row.textContent.trim().startsWith('Shipping'))
      ?.querySelector('span:last-child');
    if (shippingValueEl) shippingValueEl.textContent = formatCurrency(shipping);

    const estimatedTotalEl = Array.from(root.querySelectorAll('.cart-info__row'))
      .find((row) => row.textContent.trim().startsWith('Estimated Total'))
      ?.querySelector('span:last-child');
    if (estimatedTotalEl) estimatedTotalEl.textContent = formatCurrency(estimatedTotal);

    // New explicit summary targets (cart.html)
    const itemsCountEl2 = root.querySelector('.cart-summary__items-count');
    const priceEl2 = root.querySelector('.cart-summary__price');
    const shippingEl2 = root.querySelector('.cart-summary__shipping');
    const estimatedEl2 = root.querySelector('.cart-summary__estimated');
    if (itemsCountEl2) itemsCountEl2.textContent = String(itemCount);
    if (priceEl2) priceEl2.textContent = formatCurrency(subtotal);
    if (shippingEl2) shippingEl2.textContent = formatCurrency(shipping);
    if (estimatedEl2) estimatedEl2.textContent = formatCurrency(estimatedTotal);

    updateHeaderCartUI();
  }

  // ===================== INIT ON LOAD / TEMPLATE =====================
  document.addEventListener('DOMContentLoaded', () => {
    updateHeaderCartUI();
    updateHeaderCartDropdownUI();
    bindAddToCartOnDetail();
    if (window.location.pathname.endsWith('checkout.html') || window.location.pathname.endsWith('cart.html')) {
      renderCheckoutPage();
    }
    injectAddToCartToProductCards();
    // Initialize product renderer on product-detail similar section
    if (window.productRenderer && typeof window.productRenderer.renderProducts === 'function') {
      // already initialized elsewhere
    } else {
      const container = document.querySelector('.row.row-cols-6.row-cols-xl-4.row-cols-lg-3.row-cols-md-2.row-cols-sm-1.g-2');
      if (container && window.ProductRenderer) {
        // ProductRenderer is defined in products.js; initialize if available
        try {
          window.productRenderer = new window.ProductRenderer('.row.row-cols-6.row-cols-xl-4.row-cols-lg-3.row-cols-md-2.row-cols-sm-1.g-2');
        } catch (_) {}
      }
    }
  });

  window.addEventListener('template-loaded', () => {
    // Header elements are injected after template-loaded
    updateHeaderCartUI();
    updateHeaderCartDropdownUI();
    injectAddToCartToProductCards();
    ensureHomeLinksForLoggedIn();
  });

  // Expose a tiny API for debugging (optional)
  window.CartService = {
    getItems: getCartItems,
    add: addToCart,
    updateQuantity,
    remove: removeItem,
    totals: getCartTotals,
  };
})();

// Enhance static product cards (where products are not rendered by products.js)
function injectAddToCartToProductCards() {
  const cards = document.querySelectorAll('.product-card');
  cards.forEach((card) => {
    if (card.querySelector('.js-add-to-cart')) return;
    const name = card.querySelector('.product-card__title a')?.textContent?.trim();
    const priceText = card.querySelector('.product-card__price')?.textContent?.trim();
    const image = card.querySelector('.product-card__thumb')?.getAttribute('src');
    if (!name || !priceText || !image) return;
    const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
    const id = `card_${name}__${image}`;

    const row = document.createElement('div');
    row.className = 'product-card__row';
    const btn = document.createElement('button');
    btn.className = 'btn btn--primary js-add-to-cart';
    btn.textContent = 'Add to cart';
    btn.dataset.id = id;
    btn.dataset.name = name;
    btn.dataset.price = String(price);
    btn.dataset.image = image;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      if (window.CartService && typeof window.CartService.add === 'function') {
        window.CartService.add({ id, name, price, image });
      }
    });
    row.appendChild(btn);
    card.appendChild(row);
  });
}

// ===================== INDEX-LOGIN HOME LINKS =====================
function ensureHomeLinksForLoggedIn() {
  // Nếu đang dùng header-logined, các link về home sẽ trỏ index-logined.html
  const header = document.querySelector('#header');
  if (!header) return;
  const isLoginedHeader = header.innerHTML.includes('user-menu__link') || header.innerHTML.includes('Logout');
  if (!isLoginedHeader) return;

  // Chỉnh logo về index-logined.html
  const logo = document.querySelector('.logo');
  if (logo) logo.setAttribute('href', './index-logined.html');

  // Breadcrumbs Home
  document.querySelectorAll('a.breadcrumbs__link').forEach((a) => {
    if (a.textContent.trim() === 'Home') a.setAttribute('href', './index-logined.html');
  });

  // Continue Shopping buttons/links
  document.querySelectorAll('.cart-info__continue-link').forEach((a) => {
    a.setAttribute('href', './index-logined.html');
  });
}

// ===================== FAVORITES SERVICE (localStorage) =====================
(function initFavoriteService() {
  const FAV_STORAGE_KEY = 'favoriteItems';

  function readFavs() {
    try {
      const raw = localStorage.getItem(FAV_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  }
  function writeFavs(items) {
    localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(items));
  }
  function getFavorites() {
    return readFavs();
  }
  function setFavorites(items) {
    writeFavs(items);
    updateHeaderFavoritesUI();
    window.dispatchEvent(new Event('favorites-updated'));
  }
  function isFavorited(id) {
    return getFavorites().some((it) => it.id === id);
  }
  function addFavorite(product) {
    const items = getFavorites();
    if (!items.some((it) => it.id === product.id)) {
      items.unshift(product);
      setFavorites(items);
    }
  }
  function removeFavorite(id) {
    setFavorites(getFavorites().filter((it) => it.id !== id));
  }
  function toggleFavorite(product, liked) {
    if (liked) addFavorite(product);
    else removeFavorite(product.id);
  }

  function formatCurrency(value) {
    return `$${value.toFixed(2)}`;
  }

  function extractProductFromCard(likeButtonEl) {
    const card = likeButtonEl.closest('.product-card');
    if (!card) return null;
    const name = card.querySelector('.product-card__title a')?.textContent?.trim();
    const priceText = card.querySelector('.product-card__price')?.textContent?.trim();
    const image = card.querySelector('.product-card__thumb')?.getAttribute('src');
    if (!name || !image) return null;
    const price = priceText ? parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0 : 0;
    const id = `fav_${name}__${image}`;
    return { id, name, price, image };
  }

  function updateHeaderFavoritesUI() {
    const favs = getFavorites();
    // Find heart group
    const favWrap = Array.from(document.querySelectorAll('.top-act__btn-wrap')).find((wrap) =>
      wrap.querySelector('img.top-act__icon[src*="heart"]')
    );
    if (!favWrap) return;
    const countEl = favWrap.querySelector('.top-act__title');
    if (countEl) countEl.textContent = String(favs.length);

    const dropdown = favWrap.querySelector('.act-dropdown');
    const titleEl = dropdown?.querySelector('.act-dropdown__title');
    if (titleEl) titleEl.textContent = `You have ${favs.length} item(s)`;
    const listEl = dropdown?.querySelector('.act-dropdown__list');
    if (!listEl) return;
    listEl.innerHTML = '';

    const toRender = favs.slice(0, 3);
    toRender.forEach((it) => {
      const col = document.createElement('div');
      col.className = 'col';
      col.innerHTML = `
        <article class="cart-preview-item">
          <div class="cart-preview-item__img-wrap">
            <img src="${it.image}" alt="" class="cart-preview-item__thumb" />
          </div>
          <h3 class="cart-preview-item__title">${it.name}</h3>
          <p class="cart-preview-item__price">${formatCurrency(it.price)}</p>
        </article>
      `;
      listEl.appendChild(col);
    });
  }

  // Document-level handler to sync likes → favorites + header dropdown
  document.addEventListener(
    'click',
    function (e) {
      const btn = e.target.closest('.product-card .like-btn');
      if (!btn) return;
      // Wait for UI toggle to settle (other handlers)
      setTimeout(() => {
        const product = extractProductFromCard(btn);
        if (!product) return;
        const liked = btn.classList.contains('like-btn__liked');
        toggleFavorite(product, liked);
      }, 0);
    },
    true
  );

  function syncLikeButtonsWithFavorites() {
    const favs = getFavorites();
    document.querySelectorAll('.product-card .like-btn').forEach((btn) => {
      const product = extractProductFromCard(btn);
      if (!product) return;
      const liked = favs.some((it) => it.id === product.id);
      btn.classList.toggle('like-btn__liked', liked);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    updateHeaderFavoritesUI();
    // Defer to let product lists render
    setTimeout(syncLikeButtonsWithFavorites, 0);
  });
  window.addEventListener('template-loaded', () => {
    updateHeaderFavoritesUI();
    setTimeout(syncLikeButtonsWithFavorites, 0);
  });

  // Expose for debugging
  window.FavoriteService = {
    get: getFavorites,
    add: addFavorite,
    remove: removeFavorite,
    toggle: toggleFavorite,
    isFavorited,
    refreshHeader: updateHeaderFavoritesUI,
    syncLikes: syncLikeButtonsWithFavorites,
  };
})();

// ===================== FAVOURITE PAGE RENDERING =====================
function renderFavouritePage() {
  if (!window.FavoriteService) return;
  const listEl = document.querySelector('.checkout-page .cart-info__list');
  if (!listEl) return;
  const favourites = window.FavoriteService.get();
  if (favourites.length === 0) {
    listEl.innerHTML = '<p>Chưa có sản phẩm yêu thích.</p>';
    return;
  }
  listEl.innerHTML = favourites
    .map((it) => {
      return `
      <article class="cart-item" data-id="${it.id}" data-price="${it.price}">
        <a href="./product-detail.html">
          <img src="${it.image}" alt="" class="cart-item__thumb" />
        </a>
        <div class="cart-item__content">
          <div class="cart-item__content-left">
            <h3 class="cart-item__title">
              <a href="./product-detail.html">${it.name}</a>
            </h3>
            <p class="cart-item__price-wrap">
              ${`$${Number(it.price).toFixed(2)}`} |
              <span class="cart-item__status">In Stock</span>
            </p>
          </div>
          <div class="cart-item__content-right">
            <div style="display:flex; gap:10px; justify-content:flex-end;">
              <button class="btn btn--primary btn--rounded js-fav-add-to-cart">Add to cart</button>
              <button class="btn btn--danger btn--rounded js-fav-remove">Unlike</button>
            </div>
          </div>
        </div>
      </article>`;
    })
    .join('');

  // Bind add-to-cart
  document.querySelectorAll('.js-fav-add-to-cart').forEach((btn) => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const article = this.closest('.cart-item');
      if (!article || !window.CartService) return;
      const id = article.getAttribute('data-id');
      const price = parseFloat(article.getAttribute('data-price')) || 0;
      const image = article.querySelector('.cart-item__thumb')?.getAttribute('src');
      const name = article.querySelector('.cart-item__title a')?.textContent?.trim();
      window.CartService.add({ id, name, price, image });
    });
  });
  // Bind unlike/remove
  document.querySelectorAll('.js-fav-remove').forEach((btn) => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const article = this.closest('.cart-item');
      if (!article || !window.FavoriteService) return;
      const id = article.getAttribute('data-id');
      window.FavoriteService.remove(id);
      window.FavoriteService.refreshHeader();
      window.FavoriteService.syncLikes();
      renderFavouritePage();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.endsWith('favourite.html')) {
    renderFavouritePage();
  }
  // Handle pending action after login success (on index-logined)
  if (window.location.pathname.endsWith('index-logined.html')) {
    try {
      const raw = localStorage.getItem('pendingAction');
      if (raw) {
        const { type, product } = JSON.parse(raw);
        if (type === 'fav' && window.FavoriteService) {
          window.FavoriteService.add(product);
          window.FavoriteService.refreshHeader();
        }
        if (type === 'cart' && window.CartService) {
          window.CartService.add(product);
        }
        localStorage.removeItem('pendingAction');
      }
    } catch (_) {}
  }
});
window.addEventListener('favorites-updated', () => {
  if (window.location.pathname.endsWith('favourite.html')) {
    renderFavouritePage();
  }
  // Also sync like buttons across the site
  if (window.FavoriteService) {
    window.FavoriteService.refreshHeader();
    window.FavoriteService.syncLikes();
  }
});

// === PRODUCT IMAGE PASSING BETWEEN PAGES (Generic for all listing pages) ===
(function initSelectedProductPassing() {
  if (window.location.pathname.endsWith('product-detail.html')) return;
  document.addEventListener('DOMContentLoaded', function () {
    // Clear stale selection on each listing-like page load
    ['selectedProductImg','selectedProductImgSetTime','selectedProductTitle','selectedProductBrand','selectedProductPrice','selectedProductScore']
      .forEach((k) => localStorage.removeItem(k));
  });

  // Event delegation: capture clicks on any product-card link
  document.addEventListener('click', function (e) {
    // Gate guest actions: like/add-to-cart redirect to sign-in
    if (window.location.pathname.endsWith('index.html')) {
      const likeBtn = e.target.closest('.product-card .like-btn');
      const addBtn = e.target.closest('.product-card .js-add-to-cart');
      if (likeBtn || addBtn) {
        // store pending action
        const card = (likeBtn || addBtn)?.closest('.product-card');
        const name = card?.querySelector('.product-card__title a')?.textContent?.trim();
        const priceText = card?.querySelector('.product-card__price')?.textContent?.trim();
        const image = card?.querySelector('.product-card__thumb')?.getAttribute('src');
        const price = priceText ? parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0 : 0;
        const id = `guest_${name}__${image}`;
        const pending = likeBtn
          ? { type: 'fav', product: { id, name, price, image } }
          : { type: 'cart', product: { id, name, price, image } };
        localStorage.setItem('pendingAction', JSON.stringify(pending));
        // Prevent any UI side-effects (toast, toggle) on guest
        e.preventDefault();
        if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
        else e.stopPropagation();
        window.location.href = './sign-in.html';
        return;
      }
    }

    const link = e.target.closest('.product-card__img-wrap a, .product-card__title a');
    if (!link) return;
    const productCard = link.closest('.product-card');
    if (!productCard) return;
    const img = productCard.querySelector('.product-card__thumb');
    const title = productCard.querySelector('.product-card__title a');
    const brand = productCard.querySelector('.product-card__brand');
    const price = productCard.querySelector('.product-card__price');
    const score = productCard.querySelector('.product-card__score');
    if (!img || !title || !brand || !price || !score) return;
    const imgSrc = img.getAttribute('src');
    const titleText = title.textContent.trim();
    const brandText = brand.textContent.trim();
    const priceText = price.textContent.trim();
    const scoreText = score.textContent.trim();
    const currentTime = Date.now();
    ['selectedProductImg','selectedProductImgSetTime','selectedProductTitle','selectedProductBrand','selectedProductPrice','selectedProductScore']
      .forEach((k) => localStorage.removeItem(k));
    localStorage.setItem('selectedProductImg', imgSrc);
    localStorage.setItem('selectedProductImgSetTime', String(currentTime));
    localStorage.setItem('selectedProductTitle', titleText);
    localStorage.setItem('selectedProductBrand', brandText);
    localStorage.setItem('selectedProductPrice', priceText);
    localStorage.setItem('selectedProductScore', scoreText);
  }, true);
})();

if (window.location.pathname.endsWith('product-detail.html')) {
  document.addEventListener('DOMContentLoaded', function () {
    var selectedImg = localStorage.getItem('selectedProductImg');
    var selectedTitle = localStorage.getItem('selectedProductTitle');
    var selectedBrand = localStorage.getItem('selectedProductBrand');
    var selectedPrice = localStorage.getItem('selectedProductPrice');
    var selectedScore = localStorage.getItem('selectedProductScore');
    
    // Nếu không có thông tin được chọn, sử dụng thông tin mặc định
    if (!selectedImg) {
      selectedImg = './assets/img/product/item-1.png';
      console.log('No selected image, using default:', selectedImg);
    } else {
      console.log('Using selected image:', selectedImg);
    }
    
    if (!selectedTitle) {
      selectedTitle = 'Coffee Beans - Espresso Arabica and Robusta Beans';
      console.log('No selected title, using default:', selectedTitle);
    } else {
      console.log('Using selected title:', selectedTitle);
    }
    
    if (!selectedBrand) {
      selectedBrand = 'Lavazza';
      console.log('No selected brand, using default:', selectedBrand);
    } else {
      console.log('Using selected brand:', selectedBrand);
    }
    
    if (!selectedPrice) {
      selectedPrice = '$500.00';
      console.log('No selected price, using default:', selectedPrice);
    } else {
      console.log('Using selected price:', selectedPrice);
    }
    
    if (!selectedScore) {
      selectedScore = '4.3';
      console.log('No selected score, using default:', selectedScore);
    } else {
      console.log('Using selected score:', selectedScore);
    }
    
    // Xóa localStorage ngay sau khi sử dụng để tránh ảnh hưởng đến sản phẩm tiếp theo
    localStorage.removeItem('selectedProductImg');
    localStorage.removeItem('selectedProductImgSetTime');
    localStorage.removeItem('selectedProductTitle');
    localStorage.removeItem('selectedProductBrand');
    localStorage.removeItem('selectedProductPrice');
    localStorage.removeItem('selectedProductScore');
    console.log('Cleared localStorage after using selected product info');
    
    var mainImgs = document.querySelectorAll('.prod-preview__img');
    var thumbImgs = document.querySelectorAll('.prod-preview__thumb-img');
    
    if (mainImgs.length > 0 && thumbImgs.length > 0) {
      // Danh sách tất cả hình ảnh sản phẩm có sẵn
      var productImages = [
        './assets/img/product/item-1.png',
        './assets/img/product/item-2.png',
        './assets/img/product/item-3.png',
        './assets/img/product/item-4.png',
        './assets/img/product/item-5.png',
        './assets/img/product/item-6.png',
        './assets/img/product/item-7.png',
        './assets/img/product/item-8.png'
      ];
      
      // Hình đầu tiên là hình được chọn
      mainImgs[0].setAttribute('src', selectedImg);
      thumbImgs[0].setAttribute('src', selectedImg);
      thumbImgs[0].classList.add('prod-preview__thumb-img--current');
      console.log('Set first image to selected image:', selectedImg);
      
      // Cập nhật thông tin sản phẩm từ localStorage
      var prodTitle = document.querySelector('.prod-info__heading');
      var prodBrand = document.querySelector('.prod-info__brand');
      var prodPrice = document.querySelector('.prod-info__price');
      var prodScore = document.querySelector('.prod-prop__title');
      
      if (prodTitle) {
        prodTitle.textContent = selectedTitle;
        console.log('Updated product title:', selectedTitle);
      }
      
      if (prodBrand) {
        prodBrand.textContent = selectedBrand;
        console.log('Updated product brand:', selectedBrand);
      }
      
      if (prodPrice) {
        prodPrice.textContent = selectedPrice;
        console.log('Updated product price:', selectedPrice);
      }
      
      if (prodScore) {
        // Cập nhật điểm đánh giá trong format "(score) X reviews"
        var currentReviews = prodScore.textContent.match(/\([^)]+\)\s*(.+)/);
        if (currentReviews) {
          prodScore.textContent = `(${selectedScore}) ${currentReviews[1]}`;
        } else {
          prodScore.textContent = `(${selectedScore}) 1100 reviews`;
        }
        console.log('Updated product score:', selectedScore);
      }
      
      // Các hình còn lại được chọn random từ danh sách (loại bỏ hình đã chọn)
      var availableImages = productImages.filter(img => img !== selectedImg);
      console.log('Available images for random selection:', availableImages);
      
      // Random 3 hình còn lại
      for (var i = 1; i < 4; i++) {
        if (i < mainImgs.length && i < thumbImgs.length && availableImages.length > 0) {
          var randomIndex = Math.floor(Math.random() * availableImages.length);
          var randomImg = availableImages[randomIndex];
          
          mainImgs[i].setAttribute('src', randomImg);
          thumbImgs[i].setAttribute('src', randomImg);
          thumbImgs[i].classList.remove('prod-preview__thumb-img--current');
          
          console.log(`Set image ${i+1} to random image:`, randomImg);
          
          // Loại bỏ hình đã dùng để tránh trùng lặp
          availableImages.splice(randomIndex, 1);
        }
      }
      
      // Xử lý tương tác giữa các thumbnail
      var mainPreviewImg = document.querySelector('.prod-preview__list .prod-preview__item:first-child img');
      var thumbnails = document.querySelectorAll('.prod-preview__thumbs .prod-preview__thumb-img');
      
      if (mainPreviewImg && thumbnails.length > 0) {
        thumbnails.forEach(function(thumb, index) {
          thumb.addEventListener('click', function() {
            console.log('Thumbnail clicked:', this.getAttribute('src'));
            
            // Cập nhật hình chính
            mainPreviewImg.setAttribute('src', this.getAttribute('src'));
            
            // Cập nhật trạng thái current
            thumbnails.forEach(t => t.classList.remove('prod-preview__thumb-img--current'));
            this.classList.add('prod-preview__thumb-img--current');
            
            console.log('Updated main preview image and thumbnail states');
          });
        });
      }
    }
    
    // Xóa localStorage khi rời khỏi trang để đảm bảo sản phẩm tiếp theo không bị ảnh hưởng
    window.addEventListener('beforeunload', function() {
      localStorage.removeItem('selectedProductImg');
      localStorage.removeItem('selectedProductImgSetTime');
      localStorage.removeItem('selectedProductTitle');
      localStorage.removeItem('selectedProductBrand');
      localStorage.removeItem('selectedProductPrice');
      localStorage.removeItem('selectedProductScore');
      console.log('Cleared localStorage before leaving product-detail page');
    });
  });
}

// Xử lý cho test page
if (window.location.pathname.endsWith('test-product-image.html')) {
  document.addEventListener('DOMContentLoaded', function () {
    var selectedImg = localStorage.getItem('selectedProductImg');
    var selectedTitle = localStorage.getItem('selectedProductTitle');
    var selectedBrand = localStorage.getItem('selectedProductBrand');
    var selectedPrice = localStorage.getItem('selectedProductPrice');
    var selectedScore = localStorage.getItem('selectedProductScore');
    
    // Luôn cập nhật hiển thị, dù có thông tin được chọn hay không
    var mainImgs = document.querySelectorAll('.prod-preview__img');
    var thumbImgs = document.querySelectorAll('.prod-preview__thumb-img');
    
    if (mainImgs.length > 0 && thumbImgs.length > 0) {
      // Danh sách tất cả hình ảnh sản phẩm có sẵn
      var productImages = [
        './assets/img/product/item-1.png',
        './assets/img/product/item-2.png',
        './assets/img/product/item-3.png',
        './assets/img/product/item-4.png',
        './assets/img/product/item-5.png',
        './assets/img/product/item-6.png',
        './assets/img/product/item-7.png',
        './assets/img/product/item-8.png'
      ];
      
      // Nếu không có thông tin được chọn, sử dụng thông tin mặc định
      if (!selectedImg) {
        selectedImg = './assets/img/product/item-1.png';
        console.log('Test page: No selected image, using default:', selectedImg);
      } else {
        console.log('Test page: Using selected image:', selectedImg);
      }
      
      if (!selectedTitle) {
        selectedTitle = 'Coffee Beans - Espresso Arabica and Robusta Beans';
        console.log('Test page: No selected title, using default:', selectedTitle);
      } else {
        console.log('Test page: Using selected title:', selectedTitle);
      }
      
      if (!selectedBrand) {
        selectedBrand = 'Lavazza';
        console.log('Test page: No selected brand, using default:', selectedBrand);
      } else {
        console.log('Test page: Using selected brand:', selectedBrand);
      }
      
      if (!selectedPrice) {
        selectedPrice = '$500.00';
        console.log('Test page: No selected price, using default:', selectedPrice);
      } else {
        console.log('Test page: Using selected price:', selectedPrice);
      }
      
      if (!selectedScore) {
        selectedScore = '4.3';
        console.log('Test page: No selected score, using default:', selectedScore);
      } else {
        console.log('Test page: Using selected score:', selectedScore);
      }
      
      // Xóa localStorage ngay sau khi sử dụng để tránh ảnh hưởng đến sản phẩm tiếp theo
      localStorage.removeItem('selectedProductImg');
      localStorage.removeItem('selectedProductImgSetTime');
      localStorage.removeItem('selectedProductTitle');
      localStorage.removeItem('selectedProductBrand');
      localStorage.removeItem('selectedProductPrice');
      localStorage.removeItem('selectedProductScore');
      console.log('Test page: Cleared localStorage after using selected product info');
      
      // Hình đầu tiên là hình được chọn
      mainImgs[0].setAttribute('src', selectedImg);
      thumbImgs[0].setAttribute('src', selectedImg);
      thumbImgs[0].classList.add('prod-preview__thumb-img--current');
      
      // Các hình còn lại được chọn random từ danh sách (loại bỏ hình đã chọn)
      var availableImages = productImages.filter(img => img !== selectedImg);
      
      // Random 3 hình còn lại
      for (var i = 1; i < 4; i++) {
        if (i < mainImgs.length && i < thumbImgs.length && availableImages.length > 0) {
          var randomIndex = Math.floor(Math.random() * availableImages.length);
          var randomImg = availableImages[randomIndex];
          
          mainImgs[i].setAttribute('src', randomImg);
          thumbImgs[i].setAttribute('src', randomImg);
          thumbImgs[i].classList.remove('prod-preview__thumb-img--current');
          
          // Loại bỏ hình đã dùng để tránh trùng lặp
          availableImages.splice(randomIndex, 1);
        }
      }
      
      // Xử lý tương tác giữa các thumbnail
      var mainPreviewImg = document.querySelector('.prod-preview__list .prod-preview__item:first-child img');
      var thumbnails = document.querySelectorAll('.prod-preview__thumbs .prod-preview__thumb-img');
      
      if (mainPreviewImg && thumbnails.length > 0) {
        thumbnails.forEach(function(thumb, index) {
          thumb.addEventListener('click', function() {
            // Cập nhật hình chính
            mainPreviewImg.setAttribute('src', this.getAttribute('src'));
            
            // Cập nhật trạng thái current
            thumbnails.forEach(t => t.classList.remove('prod-preview__thumb-img--current'));
            this.classList.add('prod-preview__thumb-img--current');
          });
        });
      }
    }
    
    // Auto-clear localStorage sau 10 phút để tránh lưu trữ vĩnh viễn
    setTimeout(function() {
      localStorage.removeItem('selectedProductImg');
      localStorage.removeItem('selectedProductImgSetTime');
      localStorage.removeItem('selectedProductTitle');
      localStorage.removeItem('selectedProductBrand');
      localStorage.removeItem('selectedProductPrice');
      localStorage.removeItem('selectedProductScore');
      console.log('Test page: Auto-cleared selectedProduct info from localStorage');
      // Cập nhật hiển thị sau khi clear
      if (typeof refreshDisplay === 'function') {
        refreshDisplay();
      }
      if (typeof checkLocalStorageStatus === 'function') {
        checkLocalStorageStatus();
      }
    }, 10 * 60 * 1000); // 10 phút
  });
}