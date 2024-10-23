document.addEventListener("DOMContentLoaded", async () => {
    const startButton = document.getElementById('startButton') as HTMLButtonElement;
    const stopButton = document.getElementById('stopButton') as HTMLButtonElement;

    if (!startButton || !stopButton) {
        console.error("Required buttons not found. This might not be the broadcast page.");
        return;
        
    }

    // Initialize socket
    await initSocket();

    function toggleButtons() {
        startButton.disabled = !startButton.disabled;
        stopButton.disabled = !stopButton.disabled;
    }

    function stopBroadcast() {
        if (localStream) localStream.getTracks().forEach(track => track.stop());
        localVideo.srcObject = null;
        if (peer) peer.destroy();
    }

    startButton.addEventListener("click", async () => {
        console.log("Start button clicked");
        await getMedia();
        socket.emit("join");
        toggleButtons();
    });

    stopButton.addEventListener('click', () => {
        stopBroadcast();
        toggleButtons();
    });

    socket.on("new-peer", (remoteSocketId: string) => {
        console.log("New peer connected:", remoteSocketId);
        createPeer(true, remoteSocketId);
    });
});