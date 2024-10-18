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
let socket;
let localStream;
let peer;
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const initSocket = () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield fetch('/api/config');
    const config = yield response.json();
    socket = window.io(config.PATH);
    socket.on("signal", (data) => {
        console.log("Signal received from:", data.from);
        if (!peer) {
            createPeer(false, data.from);
        }
        peer.signal(data.signal);
    });
    return socket;
});
const getMedia = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        localStream = yield navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;
    }
    catch (error) {
        console.error("Error accessing media devices.", error);
    }
});
const createPeer = (isInitiator, remoteSocketId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("createPeer function", isInitiator, remoteSocketId);
    peer = new window.SimplePeer({
        initiator: isInitiator,
        stream: localStream,
        trickle: false,
    });
    peer.on("signal", (signal) => {
        console.log("createPeer signal", signal);
        socket.emit("signal", { to: remoteSocketId, signal });
    });
    peer.on("stream", (remoteStream) => {
        console.log("createPeer stream", remoteStream);
        remoteVideo.srcObject = remoteStream;
    });
    peer.on("error", (err) => console.error("Peer connection error:", err));
});