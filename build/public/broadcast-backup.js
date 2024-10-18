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
    const response = yield fetch('/api/config');
    const config = yield response.json();
    const socket = window.io(config.PATH);
    const localVideo = document.getElementById("localVideo");
    const remoteVideo = document.getElementById("remoteVideo");
    let localStream;
    let peer;
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
    // Broadcast page specific code
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    if (startButton && stopButton) {
        const toggleButtons = () => {
            startButton.disabled = !startButton.disabled;
            stopButton.disabled = !stopButton.disabled;
        };
        const stopBroadcast = () => {
            if (localStream)
                localStream.getTracks().forEach(track => track.stop());
            localVideo.srcObject = null;
            if (peer)
                peer.destroy();
        };
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
    }
    // Viewer page specific code
    const joinButton = document.getElementById('joinButton');
    if (joinButton) {
        joinButton.addEventListener('click', () => {
            console.log("Join button clicked");
            socket.emit("join");
        });
        socket.on("new-peer", (remoteSocketId) => {
            console.log("New peer connected:", remoteSocketId);
            // createPeer(false, remoteSocketId);
            createPeer(true, remoteSocketId);
        });
    }
    socket.on("signal", (data) => {
        console.log("Signal received from:", data.from);
        if (!peer) {
            createPeer(false, data.from);
        }
        peer.signal(data.signal);
    });
}));
// document.addEventListener("DOMContentLoaded", async () => {
//     const response = await fetch('/api/config');
//     const config = await response.json();
//     // const socket = (window as any).io("http://localhost:3000");
//     const socket = (window as any).io(config.PATH);
//     const localVideo = document.getElementById("localVideo") as HTMLVideoElement;
//     const startButton = document.getElementById('startButton') as HTMLButtonElement;
//     const stopButton = document.getElementById('stopButton') as HTMLButtonElement;
//     const remoteVideo = document.getElementById("remoteVideo") as HTMLVideoElement;
//     const joinButton = document.getElementById('joinButton') as HTMLButtonElement;
//     // const connectButton = document.getElementById("connectButton") as HTMLButtonElement;
//     let localStream: MediaStream;
//     let peer: any;
//     const getMedia = async () => {
//         try {
//             localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//             localVideo.srcObject = localStream;
//         } catch (error) {
//             console.error("Error accessing media devices.", error);
//         }
//     }
//     const createPeer = async (isInitiator: boolean, remoteSocketId: string) => {
//         console.log("----createPeer----function----")
//         console.log("isInitiator---", isInitiator)
//         console.log("remoteSocketId----", remoteSocketId)
//         peer = new (window as any).SimplePeer({
//             initiator: isInitiator,
//             stream: localStream,
//             trickle: false,
//         });
//         peer.on("signal", (signal: any) => {
//             console.log("createPeer signal---", signal);
//             socket.emit("signal", { to: remoteSocketId, signal });
//         });
//         peer.on("stream", (remoteStream: MediaStream) => {
//             console.log("createPeer stream---", remoteStream);
//             remoteVideo.srcObject = remoteStream;
//         });
//         peer.on("error", (err: Error) => console.error("Peer connection error:", err));
//     }
//     const toggleButtons = () => {
//         startButton.disabled = !startButton.disabled;
//         stopButton.disabled = !stopButton.disabled;
//     }
//     const stopBroadcast = () => {
//         console.log("localStream---", localStream)
//         if (localStream) localStream.getTracks().forEach(track => track.stop());
//         localVideo.srcObject = null;  // Clear the video source to show a black screen
//         if (peer) peer.destroy();
//     }
//     startButton.addEventListener("click", async () => {
//         console.log("click button---")
//         await getMedia();
//         socket.emit("join");
//         toggleButtons();
//     });
//     stopButton.addEventListener('click', () => {
//         stopBroadcast();
//         toggleButtons(); // Switch button states
//     });
//     joinButton.addEventListener('click', () => {
//         socket.on("new-peer", (remoteSocketId: string) => {
//             console.log("New peer connected:", remoteSocketId);
//             createPeer(true, remoteSocketId);
//         });
//         socket.on("signal", (data: { from: string, signal: any }) => {
//             console.log("Signal received from:", data.from);
//             if (!peer) {
//                 createPeer(false, data.from);
//             }
//             peer.signal(data.signal);
//         });
//     })
//     socket.on('viewer', (signal: any) => {
//         peer.signal(signal);
//     });
//     // socket.on("new-peer", (remoteSocketId: string) => {
//     //     console.log("New peer connected:", remoteSocketId);
//     //     createPeer(true, remoteSocketId);
//     // });
//     // socket.on("signal", (data: { from: string, signal: any }) => {
//     //     console.log("Signal received from:", data.from);
//     //     if (!peer) {
//     //         createPeer(false, data.from);
//     //     }
//     //     peer.signal(data.signal);
//     // });
//     // getMedia();
// });
