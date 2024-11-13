const welcomeScreen = document.getElementById('welcomeScreen') as HTMLElement;
const streamInterface = document.getElementById('streamInterface') as HTMLElement;

document.addEventListener("DOMContentLoaded", async () => {
    
    try {
        console.log("Viewer initializing socket...");
        await initSocket();
    } catch (error) {
        console.error("Failed to initialize WebRTC:", error);
        showError("Failed to initialize connection");
        return;
    }

    const toggleButtons = () => {
        joinButton.disabled = !joinButton.disabled;
        leaveButton.disabled = !leaveButton.disabled;
    }

   
    joinButton.addEventListener("click", async () => {
        console.log("Join button clicked");
        const roomId = roomIdInput.value.trim();
        console.log("Room ID:", roomId);
        if (!roomId) {
            showError("Please enter a broadcast ID");
            return;
        }
        try {
            await joinRoom(roomId);
        } catch (error) {
            showError("Failed to join broadcast");
            console.error("Error joining broadcast:", error);
        }
    });


    leaveButton.addEventListener("click", () => {
        console.log("Leave button clicked");
        cleanup();
        welcomeScreen.style.display = 'block';
        streamInterface.style.display = 'none';
        toggleButtons();
        roomIdInput.disabled = false;
        roomIdInput.value = "";
    });

    socket.on("room-found", () => {
        welcomeScreen.style.display = 'none';
        streamInterface.style.display = 'block';
        toggleButtons();
        roomIdInput.disabled = true;
    });

    socket.on("room-not-found", () => {
        welcomeScreen.style.display = 'block';
        streamInterface.style.display = 'none';
        console.log("Room not found");
    showError("Broadcast not found. Please check the ID.");
        // toggleButtons();
        // roomIdInput.disabled = false;
    });

    socket.on("broadcaster-left", () => {
        console.log("Broadcaster left");
        cleanup();
        showError("Broadcast ended.");
        toggleButtons();
        roomIdInput.disabled = false;
    });
});

