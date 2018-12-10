const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const port = process.env.PORT || 8081;
const app = express();
const socketServer = http.createServer(app);
const io = socketIo(socketServer);

// const mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost/paexpress');
// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function() {
//   console.log('we are connected!');
// });

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'palocal/build')));

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/palocal/build/index.html'));
});

// create a GET route
app.get('/express_backend', (req, res) => {
  res.send({
    express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT'
  });
});

app.get('/', (req, res) => {
  res.send('Haha');
});

// let interval;
io.on('connection', socket => {
  console.log('New client connected');

  // Disconnect event
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  socket.on('down click', function() {
    console.log('sending down click to: ' + socket.room);
    let rooms = Object.keys(socket.rooms);
    console.log('Current rooms for this socket: ' + rooms);
    io.sockets.to(socket.room).emit('SOMEONE CLICKED THE DOWN BUTTON!!!!');
  });

  socket.on('up click', function() {
    io.sockets.to(socket.room).emit('SOMEONE CLICKED THE UP BUTTON!!!!');
  });

  socket.on('left click', function() {
    io.sockets.to(socket.room).emit('SOMEONE CLICKED THE LEFT BUTTON!!!!');
  });

  socket.on('right click', function() {
    io.sockets.to(socket.room).emit('SOMEONE CLICKED THE RIGHT BUTTON!!!!');
  });

  socket.on('next slide', pageNum => {
    console.log('get next slide event from react');
    io.sockets.to(socket.room).emit('SOMEONE HIT NEXT', pageNum + 1);
    socket.pageNum = pageNum;
  });

  socket.on('back slide', pageNum => {
    io.sockets.to(socket.room).emit('SOMEONE HIT BACK', pageNum - 1);
    socket.pageNum = pageNum;
  });

  socket.on('login', username => {
    socket.leave(socket.id);
    socket.join(username);
    socket.room = username;
  });

  socket.on('what is my page?', msg => {
    console.log('your page is: ' + socket.pageNum);
    io.sockets
      .to(socket.room)
      .emit('update page for new socket', socket.pageNum);
  });

  // Emit a message on an interval
  // if (interval) {
  //   clearInterval(interval);
  // }
  // interval = setInterval(
  //   () => socket.emit('Interval Event', 'No message right now'),
  //   1000
  // );
});

//useless db code
// const Connection = require('./palocal/models/connection');
// function createUser(username,socket){
//   let newConnection = new Connection ({
//     socketID: [socket.id],
//     username: username
//   });
//   newConnection
//     .save()
//     .then(() => {
//       console.log('Connection saved')
//     })
// }

// function addUser(username,connections,socket){
//   var newConnections = connections[0].socketID.push(socket.id);
//   Connections.update({ username: username }, { $set: { socketID: newConnections } })
//     .then(console.log('addUser promise complete'))
//     .error(console.log(error));
// }
//
// function login(username, socket) {
//   Connection.find({username: username})
//     .exec()
//     .then(connections => {
//       console.dir(connections)
//       if (connections.length == 0){
//         createUser(username, socket);
//         console.log('created socket connection')
//       } else {
//         addUser(username,connections,socket);
//         console.log('added socket connection')
//       }
//     })
//     .catch(error => {
//       console.log(error.message);
//     });
// }
socketServer.listen(port, () => console.log(`Listening on port ${port}`));
