// Slideshow functionality
class Slideshow {
    constructor(container) {
        this.container = container;
        this.slides = container.querySelectorAll(".slideshow__item");
        this.currentSlide = 0;
        this.totalSlides = this.slides.length;
        this.interval = null;
        this.autoPlayDelay = 5000; // 5 seconds

        this.init();
    }

    init() {
        if (this.totalSlides <= 1) return;

        // Set up slides with CSS classes
        this.slides.forEach((slide, index) => {
            if (index === 0) {
                slide.classList.add("active");
            } else {
                slide.classList.remove("active");
            }
        });

        // Start autoplay
        this.startAutoPlay();

        // Add navigation buttons if needed
        this.addNavigation();
    }

    nextSlide() {
        this.slides[this.currentSlide].classList.remove("active");
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.slides[this.currentSlide].classList.add("active");
        this.updatePageIndicator();
    }

    prevSlide() {
        this.slides[this.currentSlide].classList.remove("active");
        this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.slides[this.currentSlide].classList.add("active");
        this.updatePageIndicator();
    }

    goToSlide(index) {
        if (index >= 0 && index < this.totalSlides) {
            this.slides[this.currentSlide].classList.remove("active");
            this.currentSlide = index;
            this.slides[this.currentSlide].classList.add("active");
            this.updatePageIndicator();
        }
    }

    startAutoPlay() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.interval = setInterval(() => {
            this.nextSlide();
        }, this.autoPlayDelay);
    }

    stopAutoPlay() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    updatePageIndicator() {
        // Page indicator removed, no need to update
    }

    addNavigation() {
        // Add navigation buttons
        const navContainer = document.createElement("div");
        navContainer.className = "slideshow__nav";

        const prevBtn = document.createElement("button");
        prevBtn.innerHTML = "‹";

        const nextBtn = document.createElement("button");
        nextBtn.innerHTML = "›";

        prevBtn.onclick = () => {
            this.stopAutoPlay();
            this.prevSlide();
            this.startAutoPlay();
        };

        nextBtn.onclick = () => {
            this.stopAutoPlay();
            this.nextSlide();
            this.startAutoPlay();
        };

        navContainer.appendChild(prevBtn);
        navContainer.appendChild(nextBtn);

        // Add hover events to pause autoplay
        this.container.addEventListener("mouseenter", () => this.stopAutoPlay());
        this.container.addEventListener("mouseleave", () => this.startAutoPlay());

        this.container.appendChild(navContainer);
    }
}

// Initialize slideshow when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
    const slideshowContainer = document.querySelector(".slideshow");
    if (slideshowContainer) {
        console.log("Initializing slideshow...");
        new Slideshow(slideshowContainer);
    } else {
        console.log("Slideshow container not found");
    }
});

// Also initialize when templates are loaded
window.addEventListener("template-loaded", function () {
    const slideshowContainer = document.querySelector(".slideshow");
    if (slideshowContainer && !slideshowContainer.hasAttribute("data-initialized")) {
        console.log("Initializing slideshow after template load...");
        slideshowContainer.setAttribute("data-initialized", "true");
        new Slideshow(slideshowContainer);
    }
});
