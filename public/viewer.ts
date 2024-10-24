document.addEventListener("DOMContentLoaded", async () => {
    const joinButton = document.getElementById('joinButton') as HTMLButtonElement;
    const cancelButton = document.getElementById('cancelButton') as HTMLButtonElement;

    if (!joinButton) {
        console.error("Join button not found. This might not be the viewer page.");
        return;
    }

    // Initialize socket
    await initSocket();

    function toggleButtons() {
        joinButton.disabled = !joinButton.disabled;
        cancelButton.disabled = !cancelButton.disabled;
    }

    joinButton.addEventListener('click', () => {
        console.log("Join button clicked");
        socket.emit("join");
        toggleButtons();
    });

    cancelButton.addEventListener('click', () => {
        console.log("Cancel button clicked");
        cancelBroadcast();
        toggleButtons();
    });

    socket.on("new-peer", (remoteSocketId: string) => {
        console.log("New peer connected:", remoteSocketId);
        createPeer(false, remoteSocketId);
    });

    function cancelBroadcast() {
        // Clean up local peer if it exists
        if (peer) {
            peer.destroy(); // Destroy only the viewer's peer connection
            peer = null;    // Reset peer variable
        }
        // Clear the remote video stream for this viewer
        remoteVideo.srcObject = null;
    }

});