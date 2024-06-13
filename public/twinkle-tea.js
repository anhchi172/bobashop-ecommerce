document.addEventListener("DOMContentLoaded", () => {
    "use strict";
    let cart = [];
    let currentItem = null;
    let menu = [];
    let currentPage = 0;
    const itemsPerPage = 6;

    async function init() {
        await loadConfig();
        await loadMenu();
        loadCustomizations();
        attachCustomizationFormListener();
        attachCartModalListener();
        window.addEventListener('scroll', handleScroll);
        renderMenuPage();
    }

    async function loadConfig() {
        try {
            const response = await fetch("config.json");
            const config = await response.json();
            apiBaseUrl = config.apiBaseUrl;
        } catch (error) {
            console.error("Failed to load config:", error);
        }
    }

    async function loadMenu() {
        try {
            const response = await fetch(`${apiBaseUrl}/products`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            menu = await response.json();
        } catch (error) {
            console.error("Failed to load menu:", error);
        }
    }

    function renderMenuPage() {
        const menuView = document.querySelector(".menu-view");
        const start = currentPage * itemsPerPage;
        const end = start + itemsPerPage;
        const itemsToRender = menu.slice(start, end);

        itemsToRender.forEach(item => {
            const itemLink = document.createElement("a");
            itemLink.href = "#";
            itemLink.classList.add("menu-item-link");

            const itemDiv = document.createElement("div");
            itemDiv.classList.add("menu-item");

            const itemName = document.createElement("h3");
            itemName.textContent = item.name;

            const itemPrice = document.createElement("p");
            itemPrice.textContent = `$${item.price.toFixed(2)}`;

            const addButton = document.createElement("img");
            addButton.classList.add("add-to-cart");
            addButton.src = "imgs/plus.png";
            addButton.alt = "Customize and Add to Cart";
            addButton.style.cursor = "pointer";

            addButton.addEventListener("click", () => {
                currentItem = item;
                showModal();
            });

            itemDiv.appendChild(itemName);
            itemDiv.appendChild(itemPrice);
            itemDiv.appendChild(addButton);
            itemLink.appendChild(itemDiv);
            menuView.appendChild(itemLink);
        });

        currentPage++;
    }

    function handleScroll() {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
            renderMenuPage();
        }
    }

    async function loadCustomizations() {
        try {
            const response = await fetch(`${apiBaseUrl}/customizations`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setUpCustomization(data);
        } catch (error) {
            console.error("Failed to load customizations:", error);
        }
    }

    function showModal() {
        const customizationSection = document.querySelector("#customization");
        customizationSection.classList.remove("hidden");
    }

    function hideModal() {
        const customizationSection = document.querySelector("#customization");
        customizationSection.classList.add("hidden");
    }

    function attachCustomizationFormListener() {
        const customizationForm = document.querySelector("#customization-form");
        customizationForm.addEventListener("submit", handleCustomizationFormSubmit);
    }

    function attachCartModalListener() {
        const closeModalButtons = document.querySelectorAll("#cart-modal .close, #checkout-btn");
        closeModalButtons.forEach(button => {
            button.addEventListener("click", () => {
                hideModal();
            });
        });
    }

    function handleCustomizationFormSubmit(event) {
        event.preventDefault();
        if (!currentItem) {
            console.error("No item selected for customization.");
            return;
        }

        const iceLevelSelect = document.querySelector("#ice-level");
        const sugarLevelSelect = document.querySelector("#sugar-level");
        const toppingsContainer = document.querySelector("#toppings");

        const iceLevel = iceLevelSelect.value;
        const sugarLevel = sugarLevelSelect.value;
        const toppings = [];
        let toppingPrice = 0;

        toppingsContainer.querySelectorAll("input[type=checkbox]:checked").forEach(checkbox => {
            toppings.push(checkbox.value);
            toppingPrice += parseFloat(checkbox.dataset.price);
        });

        const customizedItem = {
            ...currentItem,
            price: currentItem.price + toppingPrice,
            customization: {
                iceLevel,
                sugarLevel,
                toppings
            }
        };

        cart.push(customizedItem);
        updateCartCount();
        renderCartItems();
        hideModal(); // Hide modal after adding item to cart
    }

    function updateCartCount() {
        const cartCountElement = document.querySelector("#cartCount");
        if (cartCountElement) {
            cartCountElement.textContent = cart.length;
        } else {
            console.error("Cart count element not found.");
        }
    }

    function renderCartItems() {
        const cartItems = document.querySelector(".cart-items");
        cartItems.innerHTML = "";
        cart.forEach((item, index) => {
            const itemDiv = document.createElement("div");
            itemDiv.classList.add("cart-item");

            const itemName = document.createElement("p");
            itemName.textContent = `${item.name} - $${item.price.toFixed(2)} (Ice: ${item.customization.iceLevel}, Sugar: ${item.customization.sugarLevel})`;

            const removeButton = document.createElement("button");
            removeButton.textContent = "Remove";
            removeButton.addEventListener("click", () => {
                cart.splice(index, 1);
                updateCartCount();
                renderCartItems();
            });

            itemDiv.appendChild(itemName);
            itemDiv.appendChild(removeButton);
            cartItems.appendChild(itemDiv);
        });
    }

    function setUpCustomization(data) {
        const iceLevelSelect = document.querySelector("#ice-level");
        const sugarLevelSelect = document.querySelector("#sugar-level");
        const toppingsContainer = document.querySelector("#toppings");

        data.iceLevels.forEach(level => {
            const option = document.createElement("option");
            option.value = level;
            option.textContent = level;
            iceLevelSelect.appendChild(option);
        });

        data.sugarLevels.forEach(level => {
            const option = document.createElement("option");
            option.value = level;
            option.textContent = level;
            sugarLevelSelect.appendChild(option);
        });

        data.toppings.forEach((topping, index) => {
            const label = document.createElement("label");
            const checkboxId = `topping-${index}`;
            const checkboxName = `topping-${index}`;

            label.textContent = `${topping.name} (+$${topping.price.toFixed(2)})`;
            label.setAttribute("for", checkboxId);

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = topping.name;
            checkbox.dataset.price = topping.price;
            checkbox.id = checkboxId;
            checkbox.name = checkboxName;

            label.appendChild(checkbox);
            toppingsContainer.appendChild(label);
        });
    }

    init();
});
