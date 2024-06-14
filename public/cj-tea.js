document.addEventListener("DOMContentLoaded", () => {
    init();
});

let cart = [];
let menu = [];
let currentPage = 0;
const itemsPerPage = 6;
const apiBaseUrl = "http://localhost:3000";

async function init() {
    try {
        await loadMenu();
        loadCartFromLocalStorage();
        attachEventListeners();
        renderMenuPage();
    } catch (error) {
        console.error("Initialization failed:", error);
    }
}

async function loadMenu() {
    try {
        const response = await fetch(`${apiBaseUrl}/menu`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        menu = await response.json();
    } catch (error) {
        console.error("Failed to load menu:", error);
    }
}

function renderMenuPage() {
    const menuItemsDiv = document.querySelector("#menu-items");
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    const itemsToRender = Object.values(menu).flat().slice(start, end);

    itemsToRender.forEach(item => {
        const itemArticle = document.createElement("article");
        itemArticle.classList.add("menu-item");

        const itemName = document.createElement("h3");
        itemName.textContent = item.name;

        const itemPrice = document.createElement("p");
        itemPrice.textContent = `$${item.price.toFixed(2)}`;

        const itemImage = document.createElement("img");
        itemImage.src = item.image;
        itemImage.alt = item.name;
        itemImage.classList.add("drink-img");

        const addButton = document.createElement("button");
        addButton.classList.add("add-button");
        addButton.textContent = "Add";
        addButton.style.cursor = "pointer";

        addButton.addEventListener("click", () => {
            addItemToCart(item);
        });

        itemArticle.appendChild(itemName);
        itemArticle.appendChild(itemPrice);
        itemArticle.appendChild(itemImage);
        itemArticle.appendChild(addButton);
        menuItemsDiv.appendChild(itemArticle);
    });

    currentPage++;
}

window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        renderMenuPage();
    }
});

function addItemToCart(item) {
    cart.push(item);
    saveCartToLocalStorage();
    updateCartView();
}

function saveCartToLocalStorage() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function loadCartFromLocalStorage() {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
        cart = JSON.parse(storedCart);
        updateCartView();
    }
}

function updateCartView() {
    const cartItemsDiv = document.querySelector("#cart-items");
    cartItemsDiv.innerHTML = '';

    cart.forEach((item, index) => {
        const itemDiv = document.createElement("div");
        itemDiv.classList.add("cart-item");

        const itemName = document.createElement("span");
        itemName.textContent = item.name || ""; // Only display item name

        const itemPrice = document.createElement("span");
        itemPrice.textContent = `$${item.price.toFixed(2)}`;

        const trashIcon = document.createElement("i");
        trashIcon.classList.add("fas", "fa-trash-alt", "remove-button");
        trashIcon.addEventListener("click", () => {
            removeItemFromCart(index);
        });

        itemDiv.appendChild(itemName);
        itemDiv.appendChild(itemPrice);
        itemDiv.appendChild(trashIcon);
        cartItemsDiv.appendChild(itemDiv);
    });
}


function removeItemFromCart(index) {
    cart.splice(index, 1);
    saveCartToLocalStorage();
    updateCartView();
}
function attachEventListeners() {
    const sections = document.querySelectorAll("main > section");
    const navLinks = document.querySelectorAll(".navbar a");

    // Event listener for navigation links
    navLinks.forEach(link => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            const targetId = link.getAttribute("href").substring(1);
            showSection(targetId);
        });
    });

    // Event listener for close buttons
    const closeButtons = document.querySelectorAll(".close-button");
    closeButtons.forEach(button => {
        button.addEventListener("click", () => {
            showSection("");
        });
    });

    const cartSubmitButton = document.querySelector("#cart-submit-button");
    const emptyCartMessage = document.querySelector("#empty-cart-message");
    
    cartSubmitButton.addEventListener("click", async () => {
        if (cart.length === 0) {
            emptyCartMessage.classList.remove("hidden");
            return;
        }
        emptyCartMessage.classList.add("hidden");
        const submitResult = await submitOrder(cart);
    });
    
    // Attach event handlers for the review form
    attachReviewFormHandlers();
}

function attachReviewFormHandlers() {
    const reviewForm = document.querySelector("#review-form");

    if (reviewForm) {
        reviewForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const formData = new FormData(reviewForm);
            const name = formData.get("name");
            const rating = formData.get("rating");
            const message = formData.get("message");

            const review = { name, rating, message };

            try {
                await postReview(review);
                reviewForm.reset();
            } catch (error) {
                console.error("Failed to post review:", error);
            }
        });
    }
}


function showSection(targetId) {
    const sections = document.querySelectorAll("main > section");
    sections.forEach(section => {
        if (section.id === targetId) {
            section.classList.remove("hidden");
        } else {
            section.classList.add("hidden");
        }
    });
}

async function postReview(review) {
    try {
        const response = await fetch(`${apiBaseUrl}/reviews`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(review)
        });

        if (!response.ok) {
            throw new Error(`Failed to post review: ${response.statusText}`);
        }

        // Show success message
        const successMessageDiv = document.getElementById("review-success-message");
        successMessageDiv.classList.remove("hidden");

        // Hide the success message after a few seconds
        setTimeout(() => {
            successMessageDiv.classList.add("hidden");
        }, 3000);

    } catch (error) {
        console.error("Failed to post review:", error);
    }
}

async function submitOrder(cartData) {
    try {
        const response = await fetch(`${apiBaseUrl}/cart`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(cartData)
        });

        if (!response.ok) {
            throw new Error(`Failed to submit order: ${response.statusText}`);
        }

        // Clear the cart after successful submission
        cart = [];
        saveCartToLocalStorage();
        updateCartView();

        return "Order submitted successfully";
    } catch (error) {
        console.error("Failed to submit order:", error);
        return "Failed to submit order";
    }
}

init();
