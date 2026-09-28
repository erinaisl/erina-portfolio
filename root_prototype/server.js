//Load the tools our backend needs
const express = require("express");
const app = express(); // Create ROOT's Express application

// Load Node's tool for building file and folder paths
const path = require("node:path");

// Serve frontend files from the public folder
// __dirname (two underscores) locates this files folder; path.join adds "public".
// Keeping this limited to public avoids sharing the whole project.
app.use(express.static(path.join(__dirname, "public")));

// starts listening for b rowser connections on port 3000
app.listen(3000, function () {
    console.log("ROOT is running at http://localhost:3000");
});