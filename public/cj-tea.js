document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    let cart = [];
    let currentItem = null;
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
        const menuSection = document.querySelector("#menu");
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
                currentItem = item;
                showModal();
            });

            itemArticle.appendChild(itemName);
            itemArticle.appendChild(itemPrice);
            itemArticle.appendChild(itemImage);
            itemArticle.appendChild(addButton);
            menuSection.appendChild(itemArticle);
        });

        currentPage++;
    }

    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
            renderMenuPage();
        }
    });

    function showModal() {
        const customizationSection = document.querySelector("#customization");
        customizationSection.classList.remove("hidden");

        // Fetch customization options from the server
        fetchCustomizationOptions();
    }

    async function fetchCustomizationOptions() {
        try {
            const response = await fetch(`${apiBaseUrl}/customizations`);
            if (!response.ok) {
                throw new Error(`Failed to fetch customizations: ${response.statusText}`);
            }
            const customizations = await response.json();
            renderCustomizationOptions(customizations);
        } catch (error) {
            console.error("Failed to fetch customizations:", error);
        }
    }

    function renderCustomizationOptions(customizations) {
        const toppingsSelect = document.querySelector("#toppings");
        toppingsSelect.innerHTML = '';

        customizations.toppings.forEach(topping => {
            const option = document.createElement("option");
            option.value = topping.id;
            option.textContent = `${topping.name} (+$${topping.price.toFixed(2)})`;
            toppingsSelect.appendChild(option);
        });
    }

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
            itemName.textContent = `${item.name} (${item.size})`;

            const itemPrice = document.createElement("span");
            itemPrice.textContent = `$${item.price.toFixed(2)}`;

            const removeButton = document.createElement("button");
            removeButton.classList.add("remove-button");
            removeButton.textContent = "Remove";

            removeButton.addEventListener("click", () => {
                removeItemFromCart(index);
            });

            itemDiv.appendChild(itemName);
            itemDiv.appendChild(itemPrice);
            itemDiv.appendChild(removeButton);
            cartItemsDiv.appendChild(itemDiv);
        });
    }

    function removeItemFromCart(index) {
        cart.splice(index, 1);
        saveCartToLocalStorage();
        updateCartView();
    }

    function attachEventListeners() {
        const customizationModal = document.querySelector("#customization");
        const customizationForm = document.querySelector("#customization-form");

        customizationForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const formData = new FormData(customizationForm);
            const size = formData.get("size");
            const sugar = formData.get("sugar");
            const ice = formData.get("ice");
            const toppings = formData.getAll("toppings");

            const newItem = {
                ...currentItem,
                size,
                sugar,
                ice,
                toppings,
                price: calculateItemPrice(currentItem.price, toppings)
            };

            addItemToCart(newItem);
            customizationModal.classList.add("hidden");
        });

        customizationModal.querySelector(".close-button").addEventListener("click", () => {
            customizationModal.classList.add("hidden");
        });

        const cartModal = document.querySelector("#cart");
        const cartLink = document.querySelector("#cart-link");

        cartLink.addEventListener("click", (event) => {
            event.preventDefault();
            cartModal.classList.remove("hidden");
        });

        cartModal.querySelector(".close").addEventListener("click", () => {
            cartModal.classList.add("hidden");
        });

        const reviewForm = document.querySelector("#review-form");

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
        } catch (error) {
            console.error("Failed to post review:", error);
        }
    }

    function calculateItemPrice(basePrice, toppings) {
        let totalPrice = basePrice;
        toppings.forEach(toppingId => {
            const topping = getToppingById(toppingId);
            if (topping) {
                totalPrice += topping.price;
            }
        });
        return totalPrice;
    }

    function getToppingById(toppingId) {
        return customizations.toppings.find(topping => topping.id === toppingId);
    }

    init();
});
