import { io, Socket } from "socket.io-client"; // Import socket.io-client
import SimplePeer from "simple-peer";

// Initialize the socket connection
const socket: Socket = io("http://localhost:3000"); // Update if the server is hosted elsewhere

const localVideo = document.getElementById("localVideo") as HTMLVideoElement;
console.log("localVideo---", localVideo)
const remoteVideo = document.getElementById("remoteVideo") as HTMLVideoElement;
console.log("remoteVideo---", remoteVideo)
let localStream: MediaStream;
let peer: SimplePeer.Instance;

// Get media stream from the user's camera and microphone
async function getMedia() {
    try {
        console.log("get media console--------")
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;

        // Notify server that a new user has joined
        socket.emit("join");
    } catch (error) {
        console.error("Error accessing media devices.", error);
    }
}

// Create and initialize a new peer connection
function createPeer(isInitiator: boolean, remoteSocketId: string) {
    peer = new SimplePeer({
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
socket.on("new-peer", (remoteSocketId: string) => {
    console.log("New peer connected:", remoteSocketId);
    createPeer(true, remoteSocketId);
});

// When receiving a signal from another peer, respond accordingly
socket.on("signal", (data: { from: string; signal: SimplePeer.SignalData }) => {
    console.log("Signal received from:", data.from);

    if (!peer) {
        createPeer(false, data.from); // Create a peer if it doesn't exist
    }
    peer.signal(data.signal); // Pass the received signal to the peer
});

// Start the media stream when the page loads
getMedia();
