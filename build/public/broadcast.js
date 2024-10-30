"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const preStream = document.getElementById('preStream');
const videoContainer = document.getElementById('videoContainer');
const broadcastId = document.getElementById('broadcastId');
// broadcaster.ts
document.addEventListener("DOMContentLoaded", () => __awaiter(void 0, void 0, void 0, function* () {
    // const webRTCService = createWebRTCService(localVideo, null); // Use the function instead of class
    try {
        console.log("Initializing WebRTCService...");
        yield initSocket();
    }
    catch (error) {
        console.error("Failed to initialize WebRTC:", error);
        return;
    }
    // const toggleButtons = () => {
    //     startButton.disabled = !startButton.disabled;
    //     stopButton.disabled = !stopButton.disabled;
    // }
    startButton.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log("Start button clicked");
            yield getMedia();
            // Hide pre-stream content and show video container
            preStream.classList.add('hidden');
            videoContainer.classList.add('active');
            broadcastId.classList.add('active');
            const roomId = yield createRoom();
            broadcastId.textContent = `Broadcast ID: ${roomId}`;
            // roomIdDisplay.textContent = `Broadcast ID: ${roomId}`;
            // console.log("roomIdDisplay--");
            // toggleButtons();
        }
        catch (error) {
            console.error("Error starting broadcast:", error);
            broadcastId.textContent = "Failed to start broadcast";
        }
    }));
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
    socket.on("viewer-joined", (data) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Viewer joined", data);
        yield handleNewViewer(data);
    }));
}));
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
