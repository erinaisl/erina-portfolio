//Connect this browser to ROOT's server
const socket = io();

const createGameButton = document.getElementById("createGameButton");

//Ask the server to create a game when the button is clicked
createGameButton.addEventListener("click", function () {
    socket.emit("createGame")
});

const joinGameButton = document.getElementById("joinGameButton");
const roomCodeInput = document.getElementById("roomCodeInput");
const landingMessage = document.getElementById("landingMessage");

//Remember the repeating timer so we can stop it later
let joiningInterval = null;

//Animate dots after any loading message
    function startLoadingMessage(message) {
        clearInterval(joiningInterval);

        let dotCount = 0;
        landingMessage.textContent = message;

        joiningInterval = setInterval(function () {
            dotCount = dotCount + 1;

            if (dotCount > 3) {
                dotCount = 0;
            }

            landingMessage.textContent = message + ".".repeat(dotCount);
        }, 400)
    }

// Send the entered room code to the server
joinGameButton.addEventListener("click", function () {
    const roomCode = roomCodeInput.value.trim().toUpperCase();

    if (roomCode == "") {
        landingMessage.textContent = "Please enter a room code.";
        return;
    }

    //Briefly confirm the entry before sending the join request
    landingMessage.textContent = "Room code entered: " + roomCode;
    joinGameButton.disabled = true;

    setTimeout(function () {
        startLoadingMessage("Joining");

        socket.emit("joinGame", roomCode);
    }, 1100);
});

//Display the room code when the server confirms creation
socket.on("roomCreated", function (roomCode) {
    startLoadingMessage(
        "Room code: " + roomCode + " - Waiting for another player"
    );
});

//Display a rejected join request and allow another attempt
socket.on("joinError", function (message) {
    clearInterval(joiningInterval);
    joiningInterval = null;
    landingMessage.textContent = message;
    joinGameButton.disabled = false;
});

//Update the landing screen when both players have joined
socket.on("roomReady", function () {
    clearInterval(joiningInterval);
    joiningInterval = null;

    landingMessage.textContent = "Both players have joined."; // displays message
    joinGameButton.disabled = true; //disables joinGame button
    createGameButton.disabled = true; //disables createGame button

    //Wait 1.1 seconds, then start the animated loading message
    setTimeout(function () {
        startLoadingMessage("Joining game");
    }, 1100)
});