const express = require('express');
const app = express();
const http = require('http');
const httpServer = http.Server(app);
const io = require('socket.io')(httpServer);

// var PORT = process.env.PORT || 39584;
var PORT = 3000;

httpServer.listen(3000, () => {
	console.log('Server listening on port 3000');
});
app.get('/', (req, res, next) => {
	return res.sendFile(__dirname + '/client/index.html');
});

var files = {}, 
    struct = { 
        name: null, 
        type: null, 
        size: 0, 
        data: [], 
        slice: 0, 
    };

io.on('slice upload', (data) => { 
    if (!files[data.name]) { 
        files[data.name] = Object.assign({}, struct, data); 
        files[data.name].data = []; 
    }
    
    //convert the ArrayBuffer to Buffer 
    data.data = new Buffer(new Uint8Array(data.data)); 
    //save the data 
    files[data.name].data.push(data.data); 
    files[data.name].slice++;
    
    if (files[data.name].slice * 100000 >= files[data.name].size) { 
        //do something with the data 
        io.emit('end upload'); 
    } else { 
        io.emit('request slice upload', { 
            currentSlice: files[data.name].slice 
        }); 
    } 
});

