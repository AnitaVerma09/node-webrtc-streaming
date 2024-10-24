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
document.addEventListener("DOMContentLoaded", () => __awaiter(void 0, void 0, void 0, function* () {
    const joinButton = document.getElementById('joinButton');
    const cancelButton = document.getElementById('cancelButton');
    if (!joinButton) {
        console.error("Join button not found. This might not be the viewer page.");
        return;
    }
    // Initialize socket
    yield initSocket();
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
    socket.on("new-peer", (remoteSocketId) => {
        console.log("New peer connected:", remoteSocketId);
        createPeer(false, remoteSocketId);
    });
    function cancelBroadcast() {
        // Clean up local peer if it exists
        if (peer) {
            peer.destroy(); // Destroy only the viewer's peer connection
            peer = null; // Reset peer variable
        }
        // Clear the remote video stream for this viewer
        remoteVideo.srcObject = null;
    }
}));
