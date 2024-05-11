import 'dotenv/config'
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log(`Server listening at port ${port}...`)
})

app.use(express);

let numUsers = 0;

io.on('connection', (socket) => {
    let addedUser = false;

    // Add messages
    socket.on('New Messsage', (data) => {
        socket.broadcast.emit('New Messsage', {
            username: socket.username,
            message: data
        })
    })
    
    // User Join (?)
    socket.on('Add User', (username) => {
        if(addedUser) return;

        socket.username = username
        ++numUsers
        addedUser = true
        socket.emit('Login', {
            numUsers: numUsers
        })
    })

    // Notify New User Join
    socket.broadcast.emit('User Joined', {
        username: socket.username,
        numUsers: numUsers
    })

    socket.on('Typing', () => {
        socket.broadcast.emit('Typing', {
            username: socket.username
        })
    })

    socket.on('Stop Typing', () => {
        socket.broadcast.emit('Stop Typing', {
            username: socket.username
        })
    })

    socket.on('disconnect', () => {
        if(addedUser) {
            --numUsers

            socket.broadcast.emit('User Left', {
                username: socket.username,
                numUsers: numUsers
            })
        }
    })
});
