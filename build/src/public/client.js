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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client"); // Import socket.io-client
const simple_peer_1 = __importDefault(require("simple-peer"));
// Initialize the socket connection
const socket = (0, socket_io_client_1.io)("http://localhost:3000"); // Update if the server is hosted elsewhere
const localVideo = document.getElementById("localVideo");
console.log("localVideo---", localVideo);
const remoteVideo = document.getElementById("remoteVideo");
console.log("remoteVideo---", remoteVideo);
let localStream;
let peer;
// Get media stream from the user's camera and microphone
function getMedia() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("get media console--------");
            localStream = yield navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localVideo.srcObject = localStream;
            // Notify server that a new user has joined
            socket.emit("join");
        }
        catch (error) {
            console.error("Error accessing media devices.", error);
        }
    });
}
// Create and initialize a new peer connection
function createPeer(isInitiator, remoteSocketId) {
    peer = new simple_peer_1.default({
        initiator: isInitiator,
        stream: localStream,
        trickle: false, // Disable trickle ICE for simplicity
    });
    // Send the signal to the server to forward it to the other peer
    peer.on("signal", (signal) => {
        socket.emit("signal", { to: remoteSocketId, signal });
    });
    // Display the remote stream once it's received
    peer.on("stream", (remoteStream) => {
        remoteVideo.srcObject = remoteStream;
    });
    // Handle peer connection errors
    peer.on("error", (err) => console.error("Peer connection error:", err));
}
// When a new peer joins, create an initiator peer connection
socket.on("new-peer", (remoteSocketId) => {
    console.log("New peer connected:", remoteSocketId);
    createPeer(true, remoteSocketId);
});
// When receiving a signal from another peer, respond accordingly
socket.on("signal", (data) => {
    console.log("Signal received from:", data.from);
    if (!peer) {
        createPeer(false, data.from); // Create a peer if it doesn't exist
    }
    peer.signal(data.signal); // Pass the received signal to the peer
});
// Start the media stream when the page loads
getMedia();
