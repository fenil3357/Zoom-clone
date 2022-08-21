const socket = io('/'); 

// video will be appended inside this div
const videoGrid = document.getElementById('video-grid');

// Created a video element
const myVideo = document.createElement('video');
myVideo.muted = true;

// Create new peer connection
var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '3000'
})

let myVideoStream;

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', userId => {
            // user is joining`
            setTimeout(() => {
            // user joined
            connectToNewUser(userId, stream)
        }, 1000)
    })
})

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
})

function connectToNewUser(userId, stream){
    const call = peer.call(userId, stream);
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
}

function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);
}

let textMsg = $('input')
// console.log(msg)

$('html').keydown((e) => {
    if(e.which == 13 && textMsg.val().length !== 0) {
        console.log(textMsg.val());
        socket.emit('message', textMsg.val());
        textMsg.val('')
    }
})