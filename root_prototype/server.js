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

//Store active game rooms on the server
const rooms = new Map();

// Generate a six-letter room code
function generateRoomCode() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // this is called alphanumeric
    let code = "";

    for (let i=0; i < 6; i++) {
        const index = Math.floor(Math.random() * characters.length);
        code = code + characters[index];
    }

    return code;
}

// Serve frontend files from the public folder
// __dirname (two underscores) locates this files folder; path.join adds "public".
// Keeping this limited to public avoids sharing the whole project.
app.use(express.static(path.join(__dirname, "public")));

//Notice when a browser connects through Socket.IO
io.on("connection", function (socket) {
    console.log("A browser connected:", socket.id);

    // Listen for this browser's request to create a game
    socket.on("createGame", function () {
        console.log("Create Game requested by:", socket.id);

        //Generate a code and retry if an active room already uses it
        let roomCode = generateRoomCode();

        while (rooms.has(roomCode)) {
            roomCode = generateRoomCode();
        }

        //Store the new room and its first player
        rooms.set(roomCode, {
            players: [socket.id]
        });

        // Add player connection to game's messaging room
        socket.join(roomCode)

        //Remember which game this connection belongs to
        socket.data.roomCode = roomCode;

        // Send the new room code to the player who created it
        socket.emit("roomCreated", roomCode);
    

        console.log("Available room code:", roomCode);
    });
});

// starts listening for browser connections on port 3000
server.listen(3000, function () {
    console.log("ROOT is running at http://localhost:3000");
});