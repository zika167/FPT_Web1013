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
document.addEventListener('DOMContentLoaded', function () {
  // Xử lý checkbox chọn tất cả
  document.querySelector('.cart-info__check-all input').addEventListener('change', function() {
      let checkboxes = document.querySelectorAll('.cart-info__checkbox-input');
      checkboxes.forEach(checkbox => {
          checkbox.checked = this.checked;
      });
  });

  // Mảng lưu trữ các sản phẩm đã bị xóa
  let deletedItems = [];

  // Xử lý xóa sản phẩm khi bấm Delete
  document.querySelectorAll('.cart-item .delete-btnn').forEach(button => {
      button.addEventListener('click', function() {
          let item = this.closest('.cart-item');
          if (item) {
              item.style.display = 'none';
              deletedItems.push(item);
          }
      });
  });

  // Xử lý hiển thị lại sản phẩm khi bấm nút "Thêm sản phẩm lại"
  document.getElementById('restore-btn').addEventListener('click', function() {
      deletedItems.forEach(item => {
          item.style.display = '';
      });
      deletedItems = [];
  });
});

// === PRODUCT IMAGE PASSING BETWEEN PAGES ===
if (window.location.pathname.endsWith('category.html')) {
  document.addEventListener('DOMContentLoaded', function () {
    // Xóa localStorage cũ khi vào trang category để đảm bảo sạch sẽ
    localStorage.removeItem('selectedProductImg');
    localStorage.removeItem('selectedProductImgSetTime');
    localStorage.removeItem('selectedProductTitle');
    localStorage.removeItem('selectedProductBrand');
    localStorage.removeItem('selectedProductPrice');
    localStorage.removeItem('selectedProductScore');
    console.log('Cleared localStorage when entering category page');
    
    document.querySelectorAll('.product-card__img-wrap a, .product-card__title a').forEach(function(link) {
      link.addEventListener('click', function(e) {
        // Xóa localStorage cũ trước khi lưu thông tin mới
        localStorage.removeItem('selectedProductImg');
        localStorage.removeItem('selectedProductImgSetTime');
        localStorage.removeItem('selectedProductTitle');
        localStorage.removeItem('selectedProductBrand');
        localStorage.removeItem('selectedProductPrice');
        localStorage.removeItem('selectedProductScore');
        
        // Lấy thông tin sản phẩm từ product-card
        var productCard = this.closest('.product-card');
        if (productCard) {
          var img = productCard.querySelector('.product-card__thumb');
          var title = productCard.querySelector('.product-card__title a');
          var brand = productCard.querySelector('.product-card__brand');
          var price = productCard.querySelector('.product-card__price');
          var score = productCard.querySelector('.product-card__score');
          
          if (img && title && brand && price && score) {
            var imgSrc = img.getAttribute('src');
            var titleText = title.textContent.trim();
            var brandText = brand.textContent.trim();
            var priceText = price.textContent.trim();
            var scoreText = score.textContent.trim();
            var currentTime = new Date().getTime();
            
            // Lưu tất cả thông tin sản phẩm vào localStorage
            localStorage.setItem('selectedProductImg', imgSrc);
            localStorage.setItem('selectedProductImgSetTime', currentTime);
            localStorage.setItem('selectedProductTitle', titleText);
            localStorage.setItem('selectedProductBrand', brandText);
            localStorage.setItem('selectedProductPrice', priceText);
            localStorage.setItem('selectedProductScore', scoreText);
            
            console.log('Selected product info:', {
              image: imgSrc,
              title: titleText,
              brand: brandText,
              price: priceText,
              score: scoreText
            });
            
            // Auto-clear localStorage sau 5 phút để tránh lưu trữ vĩnh viễn
            setTimeout(function() {
              localStorage.removeItem('selectedProductImg');
              localStorage.removeItem('selectedProductImgSetTime');
              localStorage.removeItem('selectedProductTitle');
              localStorage.removeItem('selectedProductBrand');
              localStorage.removeItem('selectedProductPrice');
              localStorage.removeItem('selectedProductScore');
              console.log('Auto-cleared selectedProduct info from localStorage');
            }, 5 * 60 * 1000); // 5 phút
          }
        }
      });
    });
  });
}

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