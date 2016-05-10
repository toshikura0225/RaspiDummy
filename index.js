var http = require('http');
var fs = require('fs');
var url = require('url');
var serialport = require('serialport');


// ■■■■■■■■　Node.js　■■■■■■■■■
var http_src = fs.readFileSync('./index.html');

var app = http.createServer(function(req, res) {
	
	var url_parts = url.parse(req.url);
	
	console.log(url_parts.pathname);
	
	if(url_parts.pathname == '/' || url_parts.pathname == '/index.html')
	{
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write(http_src);
		res.end();
	}
	else
	{
		res.writeHead(404);
		res.write(url_parts.pathname + "not found.");	// 脆弱性
		res.end();
	}

	
}).listen(process.env.PORT || 3000);

var sp;

// ■■■■■■■■　socket.io（サーバー側）　■■■■■■■■■
var io = require('socket.io').listen(app);
io.sockets.on('connection', function(socket) {
	
	// なぜか.htmlにアクセス時に'connection'イベントが発生することがある
	
	/*
	socket.on('message', function(data) {		// messageイベント：すべてのメッセージを受信時
    //io.sockets.emit('msg', data);
		socket.broadcast.emit('msg', data);
		console.log("to server msg" + data);
	});
	*/
	
	console.log("socket.io connected.");
	
	socket.on('open-connection', function(data) {
		
		console.log("socket.io received 'open-connection' event and '" + data + "' message from html");
		
		sp = new serialport.SerialPort(data, {
			baudRate: 38400,
			dataBits: 8,
			parity: 'none',
			stopBits: 1,
			flowControl: true,
		});
		
		sp.on('data', function(recv) {
			console.log('recv:' + recv);
		});
		
		
		// list serial ports:
		serialport.list(function (err, ports) {
			ports.forEach(function(port) {
				console.log(port.comName);
			});
		})
		
	});	
			
	socket.on('path-through', function(data) {
		
		console.log();
		console.log("socket.io received 'path-through' event and '" + data + "' message from html");
	

		sp.write("OK", function(err, results) {
			console.log(err + "  " + results);
		});
	});
	
	
	
	// python実行のためのchild_processを作成
	var spawn = require('child_process').spawn;
	
	socket.on('old_path-through', function(data) {
		
		console.log();
		console.log("socket.io received 'path-through' event and '" + data + "' message from html");
		
		// pythonを実行
		var py = spawn('python', ['zw.py', data]);
		console.log("var py = spawn('python', ['zw.py', data]);");
		
		// pythonからの受信イベントを登録
		py.stdout.on('data', function(data){
			console.log("py.stdout.on('data', ... " + data);
			//socket.broadcast.emit('response', data);
			socket.emit('response', data);
		});
		
		// pythonからエラーイベントを受信時
		py.stderr.on('data', function (data) {
			console.log('stderr: ' + data);
		});
		
		py.on('exit', function(){
			console.log("exit event");
		});
	});
	
	socket.on('abc', function(data) {
		
		console.log();
		console.log("socket.io received 'abc' event and '" + data + "' message from html");
		
		// pythonを実行
		var py = spawn('python', ['test.py', 'my_arg']);
		console.log("var py = spawn('python', ['test.py']);");
		
		// pythonからの受信イベントを登録
		py.stdout.on('data', function(data){
			console.log("py.stdout.on('data', ... " + data);
		});
		
		// pythonからエラーイベントを受信時
		py.stderr.on('data', function (data) {
			console.log('stderr: ' + data);
		});
		
		py.on('exit', function(){
			console.log("exit event");
		});
	});
	
	
});

// ■■■■■■■■　socket.io-client（クライアント側）　■■■■■■■■■
var client = require('socket.io-client');
var cli_socket = client.connect('http://localhost:3000');
cli_socket.on('connect',function(socket){
	cli_socket.send('how are you?');
	cli_socket.on('msg', function(data) {
		//cli_socket.emit('abc', "thank you");
		console.log('to client' + data);
	});
});
console.log('Server running!');