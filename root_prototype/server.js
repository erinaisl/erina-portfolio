// =============================================================
// SERVER SETUP - load tools, prepare room storage, and serve frontend files
// =============================================================

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


//store active game rooms on the server
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



// ===================================================================
// BROWSER CONNECTION - handles requests to create and join game rooms
// ===================================================================

io.on("connection", function (socket) {
    console.log("A browser connected:", socket.id);

    // Listen for this browser's request to create a game
    socket.on("createGame", function () {
        //Prevent this connection from creating another room
        if (socket.data.roomCode) {
            socket.emit("createError", "You are already in a room.");
            return;
        }
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

    //Recieve the room code from the browser that clicked "Join Game"
    socket.on("joinGame", function(roomCode) {
        // Prevent a connection that already has a room from joining again
        if (socket.data.roomCode) {
            socket.emit("joinError", "Your are already in a room.");
            return;
        }
        console.log("Join requested for room:", roomCode);
        // Reject codes that do no match an existing room
        if (!rooms.has(roomCode)) {
            socket.emit("joinError", "Invalid Code");
            return;
        }

        //Get the existing room's information
        const room = rooms.get(roomCode);

        //Reject the request if two player limit reached - SERVER FULL
        if (room.players.length >= 2) {
            socket.emit("joinError", "Room is full.");
            return;
        }

        // Record the joining browser as a player in this game
        room.players.push(socket.id);

        // Add that browser to the room's live messaging group
        socket.join(roomCode);

        //Remember which game this connection belongs to
        socket.data.roomCode = roomCode;
        
        // Tell both browsers in this room that two players have joined
        io.to(roomCode).emit("roomReady");
    });

    //Detect when a browser connection ends
    socket.on("disconnect", function () {
        console.log("A browser disconnected:", socket.id);
        const roomCode = socket.data.roomCode

        // A browser may disconnect without ever joining a room
        if (!roomCode) {
            return;

        }

        const room = rooms.get(roomCode);
        
        // Stop if that room has already been removed
        if (!room) {
            return;
        }

        //Keep only the connections that have not disconnected
        room.players = room.players.filter(function (playerId) {
            return playerId !== socket.id;
        });


        //Delete the room if nobody remains
        if (room.players.length === 0) {
            rooms.delete(roomCode);
        } else {
            //Notify the connection still in this room
            io.to(roomCode).emit("playerLeft", roomCode);
        }
    });
});

// ==========================================================
// START SERVER - listen for browser connections on port 3000
// ==========================================================

// starts listening for browser connections on port 3000
server.listen(3000, function () {
    console.log("ROOT is running at http://localhost:3000");
});