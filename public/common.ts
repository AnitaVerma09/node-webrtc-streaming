interface PeerConnection {
    connection: RTCPeerConnection;
    socketId: string;
}

interface ServerConfig {
    PATH: string;
}

interface SocketData {
    from: string;
    offer?: RTCSessionDescriptionInit;
    answer?: RTCSessionDescriptionInit;
    candidate?: RTCIceCandidateInit;
    roomId: string;
}

interface ViewerJoinedData {
    socketId: string;
    roomId: string;
}

let socket: any;
const peerConnections = new Map<string, RTCPeerConnection>();
let localStream: MediaStream;
let currentRoomId: string | null = null;
const config: RTCConfiguration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

const errorMessage = document.getElementById('errorMessage') as HTMLElement;
const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
const startButton = document.getElementById('startButton') as HTMLButtonElement;
const stopButton = document.getElementById('stopButton') as HTMLButtonElement;
const joinButton = document.getElementById('joinButton') as HTMLButtonElement;
const leaveButton = document.getElementById('leaveButton') as HTMLButtonElement;
const roomIdInput = document.getElementById('roomIdInput') as HTMLInputElement;


const initSocket = async (): Promise<void> => {
    try {
        console.log("----initSocket")
        socket = (window as any).io();
        setupSocketListeners();
    } catch (error) {
        console.error('Socket initialization failed:', error);
        throw error;
    }
}

const setupSocketListeners = async (): Promise<void> => {
    console.log("setupSocketListeners----")
    socket.on("offer", async (data: any) => {
        console.log(" setupSocketListeners ---  offer data----", data)
        console.log("currentRoomId---", currentRoomId)
        if (currentRoomId === data.roomId) {
            console.log("setupSocketListeners ---  offer iffff")
            await handleOffer(data.from, data.offer);
        }
    });

    socket.on("answer", async (data: any) => {
        console.log(" setupSocketListeners ---  answer data----", data)

        const pc = peerConnections.get(data.from);
        console.log("pc----", pc)
        if (pc) await pc.setRemoteDescription(data.answer);
    });

    socket.on("ice-candidate", async (data: any) => {
        console.log(" setupSocketListeners ---  ice-candidate data----", data)

        const pc = peerConnections.get(data.from);
        console.log("pc----", pc)
        if (pc) await pc.addIceCandidate(data.candidate);
    });
}

const getMedia = async (): Promise<MediaStream> => {
    try {
        console.log("---getMedia")
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideo) localVideo.srcObject = localStream;
        return localStream;
    } catch (error) {
        console.error("Error accessing media devices:", error);
        throw error;
    }
}

const toggleVideo = () => {
    try {
        const videoTrack = localStream.getVideoTracks()[0];
        return videoTrack;
    }
    catch (error) {
        console.error("Error on toggle video:", error);
        throw error;
    }
};

const videoEnable = (videoTrack: MediaStreamTrack) => {
    try {
         localStream.removeTrack(videoTrack);
    }
    catch (error) {
        console.error("Error on video enable:", error);
        throw error;
    }
}

const newUserStream = async () => {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true });
        localVideo.srcObject = localStream;
        const newVideoTrack = localStream.getVideoTracks()[0];
        console.log("newVideoTrack---", newVideoTrack)
        const track = localStream.addTrack(newVideoTrack);
        console.log("track---",track)
        return newVideoTrack;
    }
    catch (err) {
        throw err;
    }
}


const toggleAudio = () => {
    if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        return audioTrack;
    }
};

const createPeerConnection = async (remoteSocketId: string, isInitiator: boolean) => {
    console.log("createPeerConnection-----")
    const pc = new RTCPeerConnection(config);

    if (localStream) {
        localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    }

    pc.onicecandidate = (event) => {
        console.log("pc.onicecandidate----", event.candidate)
        if (event.candidate) {
            console.log("pc.onicecandidate----event.candidate")
            socket.emit("ice-candidate", { to: remoteSocketId, candidate: event.candidate, roomId: currentRoomId });
        }
    };

    pc.ontrack = (event) => {
        console.log("pc.ontrack----", remoteVideo)

        if (remoteVideo) remoteVideo.srcObject = event.streams[0];
    };

    peerConnections.set(remoteSocketId, pc);

    if (isInitiator) {
        console.log("if.isInitiator----", isInitiator)

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { to: remoteSocketId, offer, roomId: currentRoomId });
    }
    return pc;
}

const handleOffer = async (remoteSocketId: string, offer: RTCSessionDescriptionInit) => {
    console.log("handleOffer-----")
    const pc = await createPeerConnection(remoteSocketId, false);
    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit("answer", { to: remoteSocketId, answer, roomId: currentRoomId });
}

const createRoom = async (): Promise<string> => {
    console.log("----createRoom")
    currentRoomId = Math.random().toString(36).substring(2, 9);
    socket.emit("create-room", currentRoomId);
    return currentRoomId;
}

const joinRoom = async (roomId: string): Promise<void> => {
    console.log("joinRoom------");
    currentRoomId = roomId;
    socket.emit("join-room", roomId);
}

const handleNewViewer = async (data: any): Promise<void> => {
    console.log("handleNewViewer-----", data)
    console.log("currentRoomId---", currentRoomId);
    if (currentRoomId === data.roomId) {
        await createPeerConnection(data.socketId, true);
    }
}

const cleanup = (): void => {
    console.log("cleanup------")
    if (localStream) localStream.getTracks().forEach(track => track.stop());
    if (localVideo) localVideo.srcObject = null;
    if (remoteVideo) remoteVideo.srcObject = null;
    peerConnections.forEach(pc => pc.close());
    peerConnections.clear();
    if (currentRoomId) {
        console.log("currentRoomId----")
        socket.emit("leave-room", currentRoomId);
        currentRoomId = null;
    }
}

const getCurrentRoomId = (): string | null => {
    console.log("getCurrentRoomId----")
    return currentRoomId;
}

const showError = (message: string) => {
console.log("Show error message:", message);
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
    setTimeout(() => {
        errorMessage.style.display = "none";
    }, 10000);
};

