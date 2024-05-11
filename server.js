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

    socket.on('New Messsage', (data) => {
        socket.broadcast.emit('New Messsage', {
            username: socket.username,
            message: data
        })
    })

});
