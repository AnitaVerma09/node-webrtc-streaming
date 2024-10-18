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
    if (!joinButton) {
        console.error("Join button not found. This might not be the viewer page.");
        return;
    }
    // Initialize socket
    yield initSocket();
    joinButton.addEventListener('click', () => {
        console.log("Join button clicked");
        socket.emit("join");
    });
    socket.on("new-peer", (remoteSocketId) => {
        console.log("New peer connected:", remoteSocketId);
        createPeer(false, remoteSocketId);
    });
}));
