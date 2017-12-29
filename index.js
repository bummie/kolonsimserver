var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Config
var SERVER_UPDATE_INTERVAL = 600;
var SERVER_PING_INTERVAL = 3000;
var pingtime_start = 0;
var players = [];

app.get('/', function(req, res)
{
  res.send("<div id='serverinfo'>Info</div>");
});

io.on('connection', function(socket)
{
    console.log('a user connected with id: ' + socket.id);
   
    socket.emit("connection_response", socket.id);
    socket.on('new_player', function(datain)
    {
        let data  = JSON.parse(datain);
        players.push(data);
        console.log("NewPly: " + data["SocketId"] + " Amount: " + players.length);
        //console.log(JSON.stringify(players));
        socket.emit("update_clients_init", JSON.stringify(players));
    });

    // Send updated data to all clients
    setInterval(() => 
    {
        io.sockets.emit('update_clients', strippedPlayersData());
    }, SERVER_UPDATE_INTERVAL)
    
    // Ping the clients to get latency
    setInterval(() => 
    {
        pingtime_start = Date.now();
        io.sockets.emit('ping_latency');
    }, SERVER_PING_INTERVAL)

    socket.on('pong_latency', function()
    {
        let latency = Date.now() - pingtime_start;
        setPing(socket.id, latency);
    });

    socket.on('update_kolonial', function(datain)
    {
        io.sockets.emit('update_kolonial', datain);
    });

    socket.on('update_data', function(datain)
    {
        let data  = JSON.parse(datain);
        updateData(data);
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

/////////////////////
// Helper functions
///////////////////
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

// Updates the pos and rot data in players array
function updateData(data)
{
    if(data === undefined || data === null) { console.log("Bad data received");return;}
    //console.log(JSON.stringify(data));
    let index = findPlayerIndex(data["SocketId"]);
    if(index != null)
    {
        players[index]["Pos"] = data["Pos"];
        players[index]["Rot"] = data["Rot"];
    }
}

// Removes unnecesary data from playerarray
function strippedPlayersData()
{
    let strippedData = players;
    for(let i = 0; i < players.length; i++)
    {
        delete strippedData[i]["Kolonial"];
        delete strippedData[i]["Item"];
    }
    //console.log("Players: " + players.length + " Strip: " + strippedData.length);
    //console.log("StrippedData: " + JSON.stringify(strippedData));
    return strippedData;
}

// Sets the ping for given socketid
function setPing(socketid, latency)
{
    if(socketid === undefined || socketid === null) { console.log("Bad ping id received");return;}
    let index  = findPlayerIndex(socketid);
    
    if(index != null)
    {
        players[index]["Ping"] = latency;
    }
}