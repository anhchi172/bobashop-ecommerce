const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const SERVER_ERR_CODE = 500;
const SERVER_ERROR = "Something went wrong on the server, please try again later.";

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Returns a JSON collection of all categories and items served at the boba shop
app.get("/menu", async (req, res) => {
    try {
        const result = await getMenuData();
        res.json(result);
    } catch (err) {
        res.status(SERVER_ERR_CODE).send(SERVER_ERROR);
    }
});

// Returns a JSON array of items for the given category name
app.get("/menu/:category", async (req, res) => {
    let categoryDir = req.params.category.toLowerCase();
    try {
        const result = await getItemData(categoryDir);
        if (result.length > 0) {
            res.json(result);
        } else {
            res.status(400).send(`Category "${req.params.category}" not found.`);
        }
    } catch (err) {
        console.error("Error fetching item data:", err);
        res.status(SERVER_ERR_CODE).send(SERVER_ERROR);
    }
});

// Returns customizations data
app.get("/customizations", async (req, res) => {
    try {
        const customizationsData = await fs.readFile('data/customizations.json', 'utf8');
        res.json(JSON.parse(customizationsData));
    } catch (err) {
        console.error("Error reading customizations data:", err);
        res.status(SERVER_ERR_CODE).send(SERVER_ERROR);
    }
});

async function getMenuData() {
    try {
        const menuData = await fs.readFile('data/menu.json', 'utf8');
        return JSON.parse(menuData);
    } catch (err) {
        console.error("Error reading menu data:", err);
        return {};
    }
}

async function getItemData(category) {
    try {
        const menuData = await fs.readFile('data/menu.json', 'utf8');
        const menu = JSON.parse(menuData);
        return menu.hasOwnProperty(category) ? menu[category] : [];
    } catch (err) {
        console.error("Error reading menu data:", err);
        return [];
    }
}

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
