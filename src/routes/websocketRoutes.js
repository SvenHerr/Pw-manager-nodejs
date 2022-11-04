// This script runs on serversider

// here are the sockets defined https://socket.io/
import { Server } from 'socket.io';

export default function (server) {
    let io = new Server(server);

    io.on('connection', (socket) => {
        console.log('a user connected');
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });

    io.on('connection', (socket) => {
        socket.on('refresh', () => {
            console.log('refresh bitte');
        });
    });
}
