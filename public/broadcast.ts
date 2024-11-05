
interface ViewerJoinedData {
    socketId: string;
    roomId: string;
}

const preStream = document.getElementById('preStream') as HTMLElement ;
const videoContainer = document.getElementById('videoContainer') as HTMLVideoElement;
const broadcastId = document.getElementById('broadcastId') as HTMLElement ;

document.addEventListener("DOMContentLoaded", async () => {

    try {
        console.log("Initializing WebRTCService...");
        await initSocket();
    } catch (error) {
        console.error("Failed to initialize WebRTC:", error);
        return;
    }

    startButton.addEventListener("click", async () => {
        try {
            console.log("Start button clicked");
            await getMedia();
            preStream.classList.add('hidden'); // Hide pre-stream content and show video container
            videoContainer.classList.add('active');
            broadcastId.classList.add('active');
            const roomId = await createRoom();
            broadcastId.textContent = `Broadcast ID: ${roomId}`;
        } catch (error) {
            console.error("Error starting broadcast:", error);
            broadcastId.textContent = "Failed to start broadcast";
        }
    });

    stopButton.addEventListener("click", () => {
        console.log("Stop button clicked");
        cleanup();
        preStream.classList.remove('hidden');
        videoContainer.classList.remove('active');
        broadcastId.classList.remove('active');
        broadcastId.textContent = 'Broadcast ID: Not started';
    });

    // Handle viewer connections
    socket.on("viewer-joined", async (data: ViewerJoinedData) => {
        console.log("Viewer joined", data);
        await handleNewViewer(data);
    });
});