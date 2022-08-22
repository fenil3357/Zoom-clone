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

navigator.mediaDevices.getUserMedia({     // Permission for mediaDevices
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    // If new user joins room
    peer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })
    

    // Socket event handling for 'user-connected'
    socket.on('user-connected', userId => {
            // user is joining`
            setTimeout(() => {
            // user joined
            connectToNewUser(userId, stream)
            }, 1000)
        })


    // User's input message
    let textMsg = $('input')
    

    // Socket event 'message' when  user type message and hit enter
    $('html').keydown((e) => {
        if(e.which == 13 && textMsg.val().length !== 0) {
            // console.log(textMsg.val());
            socket.emit('message', textMsg.val());
            textMsg.val('')
        }
    })

    // Socket evenet handling for incoming message 
    socket.on('createMessage', message => {
        // console.log('this message is coming from server', message)

        $('.messages').append(`<li class="message"><b>user</b><br/>${message}</li>`)
        scrollToBottom();
    })

})

// When user joins room
peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
})


// Connecting to new user
function connectToNewUser(userId, stream){
    const call = peer.call(userId, stream);
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
}


// This function will append a new video stream into videoGrid
function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);
}


// If chat window overflow 
const scrollToBottom = () => {
    let d = $('.main_chat_window')
    d.scrollTop(d.prop("scrollHeight"))
}


// mute or unmute  audio
const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;

    if(enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    }
    else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}


// This function will make changes to the frontend when user turn on his audio
const setMuteButton = () => {
    const html = `
        <i class="fas fa-microphone"></i>
        <span>Mute</span>
    `
    document.querySelector('.main_mute_button').innerHTML = html;
}


// This function will make changes to the frontend when user turn off his audio
const setUnmuteButton = () => {
    const html = `
        <i class="unmute fas fa-microphone-slash"></i>
        <span>Unmute</span>
    `
    document.querySelector('.main_mute_button').innerHTML = html;
}


// mute or unmute video
const playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;

    if(enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    }
    else {
        setStopVideo();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}


// This function will make changes to the frontend when user turn on his video
const setStopVideo = () => {
    const html = `
        <i class="fas fa-video"></i>
        <span>Stop Video</span>
    `
    document.querySelector('.main_video_button').innerHTML = html;
}


// This function will make changes to the frontend when user turn off his video
const setPlayVideo = () => {
    const html = `
        <i class="unmute stop fas fa-video-slash"></i>
        <span>Play Video</span>
    `
    document.querySelector('.main_video_button').innerHTML = html;
}