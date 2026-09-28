//Load the tools our backend needs
const express = require("express");
const app = express(); // Create ROOT's Express application

// Load Node's tool for building file and folder paths
const path = require("node:path");

// Load tools for the shared server and live communication
const http = require("node:http");
const { Server } = require("socket.io");

//Attach Express and Socket.IO to the same HTTP server
const server = http.createServer(app);
const io = new Server(server);


// Serve frontend files from the public folder
// __dirname (two underscores) locates this files folder; path.join adds "public".
// Keeping this limited to public avoids sharing the whole project.
app.use(express.static(path.join(__dirname, "public")));

//Notice when a browser connects through Socket.IO
io.on("connection", function (socket) {
    console.log("A browser connected:", socket.id);
});

// starts listening for b rowser connections on port 3000
server.listen(3000, function () {
    console.log("ROOT is running at http://localhost:3000");
});