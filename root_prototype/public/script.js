//Connect this browser to ROOT's server
const socket = io();

const createGameButton = document.getElementById("createGameButton");

createGameButton.addEventListener("click", function () {
    alert("You clicked Create Game")
});

const joinGameButton = document.getElementById("joinGameButton");
const roomCodeInput = document.getElementById("roomCodeInput");
const landingMessage = document.getElementById("landingMessage");

joinGameButton.addEventListener("click", function() {
    const roomCode = roomCodeInput.value.trim();
    
    if (roomCode === "") {
        landingMessage.textContent = "Please enter a room code.";
    } 
        else if  (roomCode !== "ABCD") {
            landingMessage.textContent = "Invalid Code";
        }
        else {
        landingMessage.textContent = "Room code entered: " + roomCode;

        setTimeout(function () {
            landingMessage.textContent = "Joining...";
        }, 1100)
    }
});