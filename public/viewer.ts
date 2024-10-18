document.addEventListener("DOMContentLoaded", async () => {
    const joinButton = document.getElementById('joinButton') as HTMLButtonElement;

    if (!joinButton) {
        console.error("Join button not found. This might not be the viewer page.");
        return;
    }

    // Initialize socket
    await initSocket();

    joinButton.addEventListener('click', () => {
        console.log("Join button clicked");
        socket.emit("join");
    });

    socket.on("new-peer", (remoteSocketId: string) => {
        console.log("New peer connected:", remoteSocketId);
        createPeer(false, remoteSocketId);
    });
});