var http = require('http'),
        fs = require('fs');


fs.readFile('index.html', function (err, html) {
    if (err) {
        throw err;
    }
    var server = http.createServer(function (request, response) {
        response.writeHeader(200, {"Content-Type": "text/html"});
        response.write(html);
        response.end();
    }).listen(3300);

    var io = require('socket.io').listen(server);

    io.sockets.on('connection', function (socket) {
        socket.on('create_join', function (room) {
            var numClients = io.sockets.adapter.rooms[room] !== undefined ? Object.keys(io.sockets.adapter.rooms[room]).length : 0;
            console.log('Client length=>', numClients);
            if (numClients === 0) {
                socket.join(room);
                socket.emit('created', room);
            } else if (numClients === 2) {
                io.sockets.in(room).emit('join', room);
                socket.join(room);
                socket.emit('joined', room);
            } else {
                socket.emit('full', room);
            }
        });
        socket.on('message', function (message) {
            socket.broadcast.emit('message', message);
        });

        socket.on('disconnect', function (data) {
            socket.leave('test');
            console.log('client disconnected');
        });
    });
});

