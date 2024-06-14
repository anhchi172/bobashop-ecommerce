/*
    Name: Chi Hoang
    CS 132 Spring 2024
    Date: June 7, 2024
    This is server.js that implements the backend API for the final project.
*/

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const SERVER_ERR_CODE = 500;
const SERVER_ERROR = "Something went wrong on the server, please try again later.";

// Middleware to handle CORS
app.use(cors());

// Middleware to parse JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Custom error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack trace

    // Check for specific error types and send appropriate responses
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        // Handle JSON parsing error
        return res.status(400).send('Bad JSON syntax');
    } else if (err.code === 'ENOENT') {
        // Handle file not found error
        return res.status(404).send('File not found');
    }

    // Default error response
    res.status(500).send('Internal Server Error');
});

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
app.get("/menu/:category", validateParams, async (req, res) => {
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

// Handles posting reviews
app.post("/reviews", async (req, res) => {
    try {
        const reviewData = await fs.readFile('data/reviews.json', 'utf8');
        const reviews = JSON.parse(reviewData);

        const newReview = req.body;
        reviews.push(newReview);

        await fs.writeFile('data/reviews.json', JSON.stringify(reviews, null, 2));
        res.status(201).send("Review added successfully");
    } catch (err) {
        console.error("Error saving review data:", err);
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

// Middleware function to validate request parameters
function validateParams(req, res, next) {
    const { category } = req.params;
    
    // Check if required parameter 'category' is present
    if (!category) {
        return res.status(400).send('Category parameter is required');
    }

    // If validation passes, move to the next middleware
    next();
}

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
