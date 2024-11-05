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
    try {
        console.log("Viewer initializing socket...");
        yield initSocket();
    }
    catch (error) {
        console.error("Failed to initialize WebRTC:", error);
        showError("Failed to initialize connection");
        return;
    }
    const toggleButtons = () => {
        joinButton.disabled = !joinButton.disabled;
        leaveButton.disabled = !leaveButton.disabled;
    };
    joinButton.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Join button clicked");
        const roomId = roomIdInput.value.trim();
        console.log("Room ID:", roomId);
        if (!roomId) {
            showError("Please enter a broadcast ID");
            return;
        }
        try {
            yield joinRoom(roomId);
            toggleButtons();
            roomIdInput.disabled = true;
        }
        catch (error) {
            showError("Failed to join broadcast");
            console.error("Error joining broadcast:", error);
        }
    }));
    leaveButton.addEventListener("click", () => {
        console.log("Leave button clicked");
        cleanup();
        toggleButtons();
        roomIdInput.disabled = false;
        roomIdInput.value = "";
    });
    socket.on("room-not-found", () => {
        console.log("Room not found");
        showError("Broadcast not found. Please check the ID.");
        toggleButtons();
        roomIdInput.disabled = false;
    });
    socket.on("broadcaster-left", () => {
        console.log("Broadcaster left");
        cleanup();
        showError("Broadcast ended.");
        toggleButtons();
        roomIdInput.disabled = false;
    });
}));
