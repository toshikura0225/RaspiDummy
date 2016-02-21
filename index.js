var http = require('http');
var fs = require('fs');
var url = require('url');

// こんなものもある
var spawn = require('child_process').spawn,
    py    = spawn('python', ['test.py']),
    data = [1,2,3,4,5,6,7,8,9],
    dataString = '';

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
	socket.on('message', function(data) {		// messageイベント：すべてのメッセージを受信時
    //io.sockets.emit('msg', data);
		socket.broadcast.emit('msg', data);
		console.log("to server msg" + data);
	});
	socket.on('abc', function(data) {
    //io.sockets.emit('msg', data);
	//socket.broadcast.emit('msg', data);
		console.log("to server abc" + data);
		py.stdin.write("OKK");
//	py.stdin.end();
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
/*
var tk_spawn = require("child_process").spawn;
var tk_process = tk_spawn('python',["test.py"]);
tk_process.stdout.on('data', function (data){
	console.log(data);
});
*/

/*
var PythonShell = require('python-shell');
 
var options = {

  mode: 'text',
 // pythonPath: 'F:\Program Files F\python2.7',
  pythonOptions: ['-u'],
  scriptPath: './',
  args: ['value1', 'value2', 'value3']
 
};

 var pyshell = new PythonShell('test.py', options, function (err, results) {
  if (err) throw err;
  // results is an array consisting of messages collected during execution 
  console.log('results: %j', results);
});


pyshell.stdout.on('data', function(data) {
    pyshell.send('go');
    console.log("on." + data);
});
*/


py.stdout.on('data', function(data){
  console.log("on." + data);
});
//py.stdin.write(JSON.stringify(data));
//py.stdin.end();

console.log('Server running!');