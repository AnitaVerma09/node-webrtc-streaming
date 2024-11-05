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
document.addEventListener("DOMContentLoaded", () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Initializing WebRTCService...");
        yield initSocket();
    }
    catch (error) {
        console.error("Failed to initialize WebRTC:", error);
        return;
    }
    startButton.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log("Start button clicked");
            yield getMedia();
            preStream.classList.add('hidden'); // Hide pre-stream content and show video container
            videoContainer.classList.add('active');
            broadcastId.classList.add('active');
            const roomId = yield createRoom();
            broadcastId.textContent = `Broadcast ID: ${roomId}`;
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
    });
    // Handle viewer connections
    socket.on("viewer-joined", (data) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Viewer joined", data);
        yield handleNewViewer(data);
    }));
}));
