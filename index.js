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
        let index = findPlayerIndex(socket.id);
        deletePlayerAtIndex(index);
        io.sockets.emit('disconected_player', socket.id);
    });
});

http.listen(3000, function()
{
  console.log('listening on *:3000');
});

// Helper functions

// Searches the players and returns the index of given socketid
function findPlayerIndex(socketid)
{
    if(socketid === undefined || socketid === null) {return null;}
    let indexResult = null;
    for(let i = 0; i < players.length; i++)
    {
        if(players[i]["SocketId"] === socketid)
        {
            indexResult = i;
            break;
        }
    }

    return indexResult; 
}

// Deletes a player at given index from player array
function deletePlayerAtIndex(index)
{
    if(index === undefined || index === null) {return null;}
    if(index < 0 || index >= players.length) {return null;}
    players.splice(index, 1);
}