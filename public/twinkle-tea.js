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
        const menuView = document.querySelector("#menu-view");
        const start = currentPage * itemsPerPage;
        const end = start + itemsPerPage;
        const itemsToRender = Object.values(menu).flat().slice(start, end);

        itemsToRender.forEach(item => {
            const itemDiv = document.createElement("div");
            itemDiv.classList.add("menu-item");

            const itemContentDiv = document.createElement("div");
            itemContentDiv.classList.add("menu-item-content");

            const itemInfoDiv = document.createElement("div");
            itemInfoDiv.classList.add("menu-item-info");

            const itemName = document.createElement("h3");
            itemName.textContent = item.name;

            const itemPrice = document.createElement("p");
            itemPrice.textContent = `$${item.price.toFixed(2)}`;

            itemInfoDiv.appendChild(itemName);
            itemInfoDiv.appendChild(itemPrice);

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

            itemContentDiv.appendChild(itemInfoDiv);
            itemContentDiv.appendChild(itemImage);
            itemDiv.appendChild(itemContentDiv);
            itemDiv.appendChild(addButton);
            menuView.appendChild(itemDiv);
        });

        currentPage++;
    }

    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
            renderMenuPage();
        }
    });

    function showModal() {
        const customizationSection = document.querySelector("#customization-modal");
        customizationSection.classList.remove("hidden");

        // Fetch customization options from the server
        fetchCustomizationOptions();
    }

    async function fetchCustomizationOptions() {
        try {
            const response = await fetch(`${apiBaseUrl}/customizations`);
            if (!response.ok) {
                throw new Error(`Failed to fetch customizations: ${response.status}`);
            }
            const customizations = await response.json();
            populateCustomizationForm(customizations);
        } catch (error) {
            console.error("Failed to fetch customizations:", error);
            // Handle error fetching customizations here
        }
    }

    function populateCustomizationForm(customizations) {
        const sizeSelect = document.querySelector("#size");
        const sugarSelect = document.querySelector("#sugar");
        const iceSelect = document.querySelector("#ice");
        const toppingsContainer = document.querySelector("#toppings");

        // Populate size options (assuming sizes are fixed in the frontend)
        // You can customize this part based on your menu or backend data
        sizeSelect.innerHTML = `
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
        `;

        // Populate sugar level options
        sugarSelect.innerHTML = customizations.sugarLevels.map(level => {
            return `<option value="${level}">${level}</option>`;
        }).join('');

        // Populate ice level options
        iceSelect.innerHTML = customizations.iceLevels.map(level => {
            return `<option value="${level}">${level}</option>`;
        }).join('');

        // Populate toppings checkboxes
        toppingsContainer.innerHTML = customizations.toppings.map(topping => {
            return `
                <label>
                    <input type="checkbox" name="topping" value="${topping.name}" data-price="${topping.price}">
                    ${topping.name} (+$${topping.price.toFixed(2)})
                </label>
            `;
        }).join('');
    }

    function hideModal() {
        const customizationSection = document.querySelector("#customization-modal");
        customizationSection.classList.add("hidden");
    }

    function attachEventListeners() {
        const customizationForm = document.querySelector("#customization-form");
        customizationForm.addEventListener("submit", handleCustomizationFormSubmit);

        const closeModalButton = document.querySelector(".close-button");
        closeModalButton.addEventListener("click", () => {
            hideModal();
        });
    }

    function handleCustomizationFormSubmit(event) {
        event.preventDefault();
        if (!currentItem) {
            console.error("No item selected for customization.");
            return;
        }

        const sizeSelect = document.querySelector("#size");
        const sugarSelect = document.querySelector("#sugar");
        const iceSelect = document.querySelector("#ice");
        const toppingsContainer = document.querySelectorAll("#toppings input[type=checkbox]:checked");

        const size = sizeSelect.value;
        const sugarLevel = sugarSelect.value;
        const iceLevel = iceSelect.value;
        const toppings = Array.from(toppingsContainer).map(topping => ({
            name: topping.value,
            price: parseFloat(topping.dataset.price)
        }));

        const customizedItem = {
            ...currentItem,
            size,
            customization: {
                sugarLevel,
                iceLevel,
                toppings
            }
        };

        cart.push(customizedItem);
        updateCartCount();
        renderCartItems();
        hideModal();
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
        const cartItems = document.querySelector("#cart-view");
        cartItems.innerHTML = "";
        cart.forEach((item, index) => {
            const itemDiv = document.createElement("div");
            itemDiv.classList.add("cart-item");

            const itemName = document.createElement("p");
            itemName.textContent = `${item.name} - $${item.price.toFixed(2)} (${item.customization.size}, Sugar: ${item.customization.sugarLevel}, Ice: ${item.customization.iceLevel})`;

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

    init();
});
