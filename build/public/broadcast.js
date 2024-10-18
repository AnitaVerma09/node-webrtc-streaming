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
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    if (!startButton || !stopButton) {
        console.error("Required buttons not found. This might not be the broadcast page.");
        return;
    }
    // Initialize socket
    yield initSocket();
    function toggleButtons() {
        startButton.disabled = !startButton.disabled;
        stopButton.disabled = !stopButton.disabled;
    }
    function stopBroadcast() {
        if (localStream)
            localStream.getTracks().forEach(track => track.stop());
        localVideo.srcObject = null;
        if (peer)
            peer.destroy();
    }
    startButton.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Start button clicked");
        yield getMedia();
        socket.emit("join");
        toggleButtons();
    }));
    stopButton.addEventListener('click', () => {
        stopBroadcast();
        toggleButtons();
    });
    socket.on("new-peer", (remoteSocketId) => {
        console.log("New peer connected:", remoteSocketId);
        createPeer(true, remoteSocketId);
    });
}));
