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
document.addEventListener("DOMContentLoaded", () => {
    const socket = window.io("http://localhost:3000");
    const localVideo = document.getElementById("localVideo");
    const remoteVideo = document.getElementById("remoteVideo");
    const connectButton = document.getElementById("connectButton");
    let localStream;
    let peer;
    function getMedia() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                localStream = yield navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                localVideo.srcObject = localStream;
                socket.emit("join");
            }
            catch (error) {
                console.error("Error accessing media devices.", error);
            }
        });
    }
    function createPeer(isInitiator, remoteSocketId) {
        peer = new window.SimplePeer({
            initiator: isInitiator,
            stream: localStream,
            trickle: false,
        });
        peer.on("signal", (signal) => {
            socket.emit("signal", { to: remoteSocketId, signal });
        });
        peer.on("stream", (remoteStream) => {
            remoteVideo.srcObject = remoteStream;
        });
        peer.on("error", (err) => console.error("Peer connection error:", err));
    }
    connectButton.addEventListener("click", () => {
        socket.emit("join");
    });
    socket.on("new-peer", (remoteSocketId) => {
        console.log("New peer connected:", remoteSocketId);
        createPeer(true, remoteSocketId);
    });
    socket.on("signal", (data) => {
        console.log("Signal received from:", data.from);
        if (!peer) {
            createPeer(false, data.from);
        }
        peer.signal(data.signal);
    });
    getMedia();
});
