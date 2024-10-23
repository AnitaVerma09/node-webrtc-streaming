let socket: any;
let localStream: MediaStream;
let peer: any;
const localVideo = document.getElementById("localVideo") as HTMLVideoElement;
const remoteVideo = document.getElementById("remoteVideo") as HTMLVideoElement;

const initSocket = async () => {
    const response = await fetch('/api/config');
    const config = await response.json();
    socket = (window as any).io(config.PATH);

    socket.on("signal", (data: { from: string, signal: any }) => {
        console.log("Signal received from:", data.from);
        if (!peer) {
            createPeer(false, data.from);
        }
        peer.signal(data.signal);
    });

    return socket;
}

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

    console.log("peer----", peer);

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