
interface ViewerJoinedData {
    socketId: string;
    roomId: string;
}

const preStream = document.getElementById('preStream') as HTMLElement ;
const videoContainer = document.getElementById('videoContainer') as HTMLVideoElement;
const broadcastId = document.getElementById('broadcastId') as HTMLElement ;


// broadcaster.ts
document.addEventListener("DOMContentLoaded", async () => {

    // const webRTCService = createWebRTCService(localVideo, null); // Use the function instead of class

    try {
        console.log("Initializing WebRTCService...");
        await initSocket();
    } catch (error) {
        console.error("Failed to initialize WebRTC:", error);
        return;
    }

    // const toggleButtons = () => {
    //     startButton.disabled = !startButton.disabled;
    //     stopButton.disabled = !stopButton.disabled;
    // }

    startButton.addEventListener("click", async () => {
        try {
            console.log("Start button clicked");
            await getMedia();

            // Hide pre-stream content and show video container
            preStream.classList.add('hidden');
            videoContainer.classList.add('active');
            broadcastId.classList.add('active');
            
            const roomId = await createRoom();
            broadcastId.textContent = `Broadcast ID: ${roomId}`;
            // roomIdDisplay.textContent = `Broadcast ID: ${roomId}`;
            // console.log("roomIdDisplay--");
            // toggleButtons();
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
        // preStream.style.display = 'flex';
        // videoContainer.classList.remove('active');
        // broadcastId.classList.remove('active');
        // broadcastId.textContent = "";
        // toggleButtons();
    });

    // Handle viewer connections
    socket.on("viewer-joined", async (data: ViewerJoinedData) => {
        console.log("Viewer joined", data);
        await handleNewViewer(data);
    });
});




// import { WebRTCService } from "./common.js";
// interface ViewerJoinedData {
//     socketId: string;
//     roomId: string;
// }

// // broadcaster.ts
// document.addEventListener("DOMContentLoaded", async () => {
//     const startButton = document.getElementById('startButton') as HTMLButtonElement;
//     const stopButton = document.getElementById('stopButton') as HTMLButtonElement;
//     const roomIdDisplay = document.getElementById('roomIdDisplay') as HTMLElement;
//     const localVideo = document.getElementById('localVideo') as HTMLVideoElement;

//     const webRTCService = new WebRTCService(localVideo, null);
//     try {
//         console.log("webRTCService-------")
//         await webRTCService.initSocket();
//     } catch (error) {
//         console.error("Failed to initialize WebRTC:", error);
//         return;
//     }

//     startButton.addEventListener("click", async () => {
//         try {
//             console.log("startbutton hitt")
//             await webRTCService.getMedia();
//             const roomId = await webRTCService.createRoom();
//             roomIdDisplay.textContent = `Broadcast ID: ${roomId}`;
//             startButton.disabled = true;
//             stopButton.disabled = false;
//         } catch (error) {
//             console.error("Error starting broadcast:", error);
//             roomIdDisplay.textContent = "Failed to start broadcast";
//         }
//     });

//     stopButton.addEventListener("click", () => {
//         console.log("stop button hit")
//         webRTCService.cleanup();
//         roomIdDisplay.textContent = "";
//         startButton.disabled = false;
//         stopButton.disabled = true;
//     });

//     // Handle viewer connections
//     (window as any).socket.on("viewer-joined", async (data: ViewerJoinedData) => {
//         console.log("handle viewer connections----")
//         await webRTCService.handleNewViewer(data);
//     });
// });