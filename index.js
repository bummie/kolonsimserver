var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var players = [];

app.get('/', function(req, res)
{
  res.send("Yo dawgh");
});

io.on('connection', function(socket)
{
  console.log('a user connected with id: ' + socket.id);

    setInterval(() => 
    {
        io.sockets.emit('update_clients', players);
    }, 1000)

    socket.on('new_player', function(data)
    {
        console.log('a user connected with id: ' + socket.id);
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