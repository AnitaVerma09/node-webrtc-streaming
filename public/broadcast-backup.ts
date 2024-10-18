document.addEventListener("DOMContentLoaded", async () => {
    const response = await fetch('/api/config');
    const config = await response.json();
    const socket = (window as any).io(config.PATH);
    const localVideo = document.getElementById("localVideo") as HTMLVideoElement;
    const remoteVideo = document.getElementById("remoteVideo") as HTMLVideoElement;
    let localStream: MediaStream;
    let peer: any;

    const getMedia = async () => {
        try {
            localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localVideo.srcObject = localStream;
        } catch (error) {
            console.error("Error accessing media devices.", error);
        }
    }

    const createPeer = async (isInitiator: boolean, remoteSocketId: string) => {
        console.log("createPeer function", isInitiator, remoteSocketId);
        peer = new (window as any).SimplePeer({
            initiator: isInitiator,
            stream: localStream,
            trickle: false,
        });

        peer.on("signal", (signal: any) => {
            console.log("createPeer signal", signal);
            socket.emit("signal", { to: remoteSocketId, signal });
        });

        peer.on("stream", (remoteStream: MediaStream) => {
            console.log("createPeer stream", remoteStream);
            remoteVideo.srcObject = remoteStream;
        });

        peer.on("error", (err: Error) => console.error("Peer connection error:", err));
    }

    // Broadcast page specific code
    const startButton = document.getElementById('startButton') as HTMLButtonElement;
    const stopButton = document.getElementById('stopButton') as HTMLButtonElement;

    if (startButton && stopButton) {
        const toggleButtons = () => {
            startButton.disabled = !startButton.disabled;
            stopButton.disabled = !stopButton.disabled;
        }

        const stopBroadcast = () => {
            if (localStream) localStream.getTracks().forEach(track => track.stop());
            localVideo.srcObject = null;
            if (peer) peer.destroy();
        }

        startButton.addEventListener("click", async () => {
            console.log("Start button clicked");
            await getMedia();
            socket.emit("join");
            toggleButtons();
        });

        stopButton.addEventListener('click', () => {
            stopBroadcast();
            toggleButtons();
        });

        socket.on("new-peer", (remoteSocketId: string) => {
            console.log("New peer connected:", remoteSocketId);
            createPeer(true, remoteSocketId);
        });
    }

    // Viewer page specific code
    const joinButton = document.getElementById('joinButton') as HTMLButtonElement;

    if (joinButton) {

        joinButton.addEventListener('click', () => {
            console.log("Join button clicked");
            socket.emit("join");
        });

        socket.on("new-peer", (remoteSocketId: string) => {
            console.log("New peer connected:", remoteSocketId);
            // createPeer(false, remoteSocketId);
            createPeer(true, remoteSocketId);
        });
    }

    socket.on("signal", (data: { from: string, signal: any }) => {
        console.log("Signal received from:", data.from);
        if (!peer) {
            createPeer(false, data.from);
        }
        peer.signal(data.signal);
    });
});







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