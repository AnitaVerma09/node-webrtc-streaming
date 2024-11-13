interface ViewerJoinedData {
    socketId: string;
    roomId: string;
}

const preStream = document.getElementById('preStream') as HTMLElement;
const videoContainer = document.getElementById('videoContainer') as HTMLVideoElement;
const broadcastId = document.getElementById('broadcastId') as HTMLElement;
const streamControls = document.getElementById('streamControls') as HTMLElement;
const toggleVideoButton = document.getElementById('toggleVideo') as HTMLButtonElement;
const toggleAudioButton = document.getElementById('toggleAudio') as HTMLButtonElement;

let videoEnabled = true;
let audioEnabled = true;

const videoOffIcon = `
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z M3 3l18 18" />
            </svg>
        `;

const videoOnIcon = `
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
        `;

const audioOffIcon = `
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
        `;

const audioOnIcon = `
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0-11V3" />
            </svg>
        `;


document.addEventListener("DOMContentLoaded", async () => {
    try {
        console.log("Initializing WebRTCService...");
        await initSocket();
    } catch (error) {
        console.error("Failed to initialize WebRTC:", error);
        return;
    }

    startButton.addEventListener("click", async () => {
        try {
            console.log("Start button clicked");
            await getMedia();
            preStream.classList.add('hidden');
            videoContainer.classList.add('active');
            streamControls.classList.add('active');
            broadcastId.classList.add('active');
            const roomId = await createRoom();
            broadcastId.textContent = `Broadcast ID: ${roomId}`;
        } catch (error) {
            console.error("Error starting broadcast:", error);
            broadcastId.textContent = "Failed to start broadcast";
        }
    });

    stopButton.addEventListener("click", () => {
        console.log("Stop button clicked");
        cleanup();
        preStream.classList.remove('hidden');
        videoContainer.classList.remove('active');
        streamControls.classList.remove('active');
        broadcastId.classList.remove('active');
        broadcastId.textContent = 'Broadcast ID: Not started';
        videoEnabled = true;
        window.location.reload();
        resetControls();
    });


    // toggleVideoButton.addEventListener("click", async () => {
    //     let videoTrack = await toggleVideo();
    //     console.log("videoTrack---", videoTrack)
    //     console.log("videoEnabled---", videoEnabled)
    //     // if (!videoTrack) return;
    //     if (videoEnabled) {
    //         console.log("if-----")
    //         videoTrack.stop(); // Stop the video track
    //         await videoEnable(videoTrack);
    //     }
    //     else {
    //         console.log("else-----")
    //         videoTrack = await newUserStream();
    //         console.log("else end----", videoTrack)
    //     }

    //     if (videoTrack) {
    //         videoEnabled = !videoEnabled;
    //         videoTrack.enabled = videoEnabled
    //         console.log("videoEnabled-------1", videoEnabled)
    //         toggleVideoButton.innerHTML = videoEnabled ? videoOnIcon : videoOffIcon;
    //         toggleVideoButton.classList.toggle('disabled');
    //     }

    // });

    toggleVideoButton.addEventListener("click", async () => {
        const videoTrack = await toggleVideo();
        if (videoTrack) {
            videoEnabled = !videoEnabled;
            videoTrack.enabled = videoEnabled;
            // toggleVideoButton.classList.toggle('muted', !videoEnabled)
            toggleVideoButton.innerHTML = videoEnabled ? videoOnIcon : videoOffIcon;
            toggleVideoButton.classList.toggle('disabled');
            // updateVideoIcon(videoEnabled);
        }
    });

    toggleAudioButton.addEventListener("click", async () => {
        const audioTrack = await toggleAudio();
        if (audioTrack) {
            audioEnabled = !audioEnabled;
            audioTrack.enabled = audioEnabled;
            toggleAudioButton.innerHTML = audioEnabled ? audioOnIcon : audioOffIcon;
            toggleAudioButton.classList.toggle('disabled');
        }
    });

    // Handle viewer connections
    socket.on("viewer-joined", async (data: ViewerJoinedData) => {
        console.log("Viewer joined", data);
        await handleNewViewer(data);
    });
});

function resetControls() {
    videoEnabled = true;
    audioEnabled = true;
    toggleVideoButton.classList.remove('muted');
    toggleAudioButton.classList.remove('muted');
    // updateVideoIcon(true);
    // updateAudioIcon(true);
}















// // interface ViewerJoinedData {
// //     socketId: string;
// //     roomId: string;
// // }

// // const preStream = document.getElementById('preStream') as HTMLElement;
// // const videoContainer = document.getElementById('videoContainer') as HTMLVideoElement;
// // const broadcastId = document.getElementById('broadcastId') as HTMLElement;
// // const stopVideoButton = document.getElementById('stopVideoButton') as HTMLButtonElement;
// // const startVideoButton = document.getElementById('startVideoButton') as HTMLButtonElement;
// // const stopAudioButton = document.getElementById('stopAudioButton') as HTMLButtonElement;
// // const startAudioButton = document.getElementById('startAudioButton') as HTMLButtonElement;

// // document.addEventListener("DOMContentLoaded", async () => {

// //     try {
// //         console.log("Initializing WebRTCService...");
// //         await initSocket();
// //     } catch (error) {
// //         console.error("Failed to initialize WebRTC:", error);
// //         return;
// //     }

// //     startButton.addEventListener("click", async () => {
// //         try {
// //             console.log("Start button clicked");
// //             await getMedia();
// //             preStream.classList.add('hidden'); // Hide pre-stream content and show video container
// //             videoContainer.classList.add('active');
// //             broadcastId.classList.add('active');
// //             const roomId = await createRoom();
// //             broadcastId.textContent = `Broadcast ID: ${roomId}`;
// //         } catch (error) {
// //             console.error("Error starting broadcast:", error);
// //             broadcastId.textContent = "Failed to start broadcast";
// //         }
// //     });

// //     stopButton.addEventListener("click", () => {
// //         console.log("Stop button clicked");
// //         cleanup();
// //         preStream.classList.remove('hidden');
// //         videoContainer.classList.remove('active');
// //         broadcastId.classList.remove('active');
// //         broadcastId.textContent = 'Broadcast ID: Not started';
// //     });

// //     stopVideoButton.addEventListener("click", () => {
// //         toggleVideo(false);
// //     });

// //     startVideoButton.addEventListener("click", () => {
// //         toggleVideo(true);
// //     })

// //     stopAudioButton.addEventListener("click", () => {
// //         toggleAudio(false);
// //     })

// //     startAudioButton.addEventListener("click", () => {
// //         toggleAudio(true);
// //     })

// //     // Handle viewer connections
// //     socket.on("viewer-joined", async (data: ViewerJoinedData) => {
// //         console.log("Viewer joined", data);
// //         await handleNewViewer(data);
// //     });
// // });