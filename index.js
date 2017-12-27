var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Config
var SERVER_UPDATE_INTERVAL = 1000;
var players = [];

app.get('/', function(req, res)
{
  res.send("Yo dawgh");
});

io.on('connection', function(socket)
{
    console.log('a user connected with id: ' + socket.id);
    socket.emit("connection_response", socket.id);

    setInterval(() => 
    {
        io.sockets.emit('update_clients', players);
    }, SERVER_UPDATE_INTERVAL)

    socket.on('new_player', function(data)
    {
        console.log('A player sent: ' + data);
        players.push(data);
    });

    socket.on('disconnect', function () 
    {
        console.log('a user disconnected with id: ' + socket.id);
    });
});

http.listen(3000, function()
{
  console.log('listening on *:3000');
});