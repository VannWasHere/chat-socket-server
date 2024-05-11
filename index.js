import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import cors from 'cors';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
      origin: "*", // Web Test 
      methods: ["GET", "POST"],
      transports: ['websocket', 'polling'],
      credentials: true,
    },
    allowEIO3: true
});
const port = process.env.PORT || 3000;

server.listen(port, '0.0.0.0', () => {
    console.log(`Server listening at port ${port}...`);
});

app.use(cors());
app.use(express.static(path.join(__dirname, '/public')));

let numUsers = 0;

io.on('connection', (socket) => {
    let addedUser = false;

    // Add messages
    socket.on('new message', (data) => {
        console.log(`New message added from ${socket.username}: ${data}`)
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data
        })
    })
    
    // User Join (?)
    socket.on('add user', (username) => {
        if(addedUser) return;

        socket.username = username
        ++numUsers
        addedUser = true
        console.log(`${socket.username} join the chat!`)
        socket.emit('login', {
            numUsers: numUsers
        })
    })

    // Notify New User Join
    socket.broadcast.emit('user joined', {
        username: socket.username,
        numUsers: numUsers
    })

    socket.on('typing', () => {
        socket.broadcast.emit('typing', {
            username: socket.username
        })
    })

    socket.on('stop typing', () => {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        })
    })

    socket.on('disconnect', () => {
        if(addedUser) {
            --numUsers
            console.log(`${socket.username} left the chat!`)
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            })
        }
    })
});
