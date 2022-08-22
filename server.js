// Setting up express app
const express = require('express');
const app = express();
const server = require('http').Server(app);

// uuid v4 (to create room id)
const { v4: uuidv4 } = require('uuid');

// Setting up view engine as ejs 
app.set('view engine', 'ejs');

// Static files
app.use(express.static('public'));

// Socketio
const { Socket } = require('dgram');
const io = require('socket.io')(server)

// Importing Peer
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});


// A server side element to broker connections between PeerJS clients.
app.use('/peerjs', peerServer);


// It will create a new room for user with new roomId using uuidv4
app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`);      
});


// If user join with custom roomId 
app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
});


// Socketio events
io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);

        socket.to(roomId).emit('user-connected', userId);

        socket.on('message', message => {
            io.to(roomId).emit('createMessage', message)
        })
    })
})

server.listen(3000);