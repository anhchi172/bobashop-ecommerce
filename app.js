"use strict";

const express = require("express");
const app = express();
const fsp = require("fs/promises");
const SERVER_ERR_CODE = 400;
const SERVER_ERROR = "Something went wrong on the server, please try again later.";

app.use(express.static("public"));

async function getData() {
    try {
        const menuData = await fsp.readFile("data/menu.json", "utf8");
        const customizationsData = await fsp.readFile("data/customizations.json", "utf8");
        const menuContents = JSON.parse(menuData);
        const customizationsContents = JSON.parse(customizationsData);

        getProductData(menuContents);
        getItemData(menuContents);
        getCustomizationsData(customizationsContents);
    } catch (err) {
        console.error(err);
    }
}
getData();

function getProductData(content) {
    app.get("/products", (req, res) => {
        res.json(content);
    });
}

function getItemData(content) {
    app.get("/products/:category", (req, res) => {
        let categoryDir = req.params.category.toLowerCase();
        res.type("text");
        if (content[categoryDir]) {
            res.send(content[categoryDir]);
        } else {
            res.status(SERVER_ERR_CODE).send(SERVER_ERROR);
        }
    });
}

function getCustomizationsData(content) {
    app.get("/customizations", (req, res) => {
        res.json(content);
    });
}

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log("Listening " + PORT + "...");
});
