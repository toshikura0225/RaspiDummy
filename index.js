var http = require('http');
var fs = require('fs');
var url = require('url');

var http_src = fs.readFileSync('./index.html');

var app = http.createServer(function(req, res) {
	
	var url_parts = url.parse(req.url);
	
	console.log(url_parts.pathname);
	
	if(url_parts.pathname == '/')
	{
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write(http_src);
		res.end();
	}
	else
	{
		res.end();
	}

	
}).listen(process.env.PORT || 3000);

var io = require('socket.io').listen(app);
io.sockets.on('connection', function(socket) {
  socket.on('msg', function(data) {
    //io.sockets.emit('msg', data);
	socket.broadcast.emit('msg', data);
	console.log("to server msg" + data);
  });
    socket.on('abc', function(data) {
    //io.sockets.emit('msg', data);
	//socket.broadcast.emit('msg', data);
	console.log("to server abc" + data);
  });
});

var client = require('socket.io-client');
var cli_socket = client.connect('http://localhost:3000');
cli_socket.on('connect',function(socket){
    cli_socket.send('how are you?');
 //   cli_socket.disconnect();
 //   process.exit(0);
   cli_socket.on('msg', function(data) {
cli_socket.emit('abc', "thank you");
	console.log('to client' + data);
  });
});

console.log('Server running!');