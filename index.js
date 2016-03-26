var http = require('http');
var fs = require('fs');
var url = require('url');


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
		res.end();
	}

	
}).listen(process.env.PORT || 3000);

// ■■■■■■■■　socket.io（サーバー側）　■■■■■■■■■
var io = require('socket.io').listen(app);
io.sockets.on('connection', function(socket) {
	/*
	socket.on('message', function(data) {		// messageイベント：すべてのメッセージを受信時
    //io.sockets.emit('msg', data);
		socket.broadcast.emit('msg', data);
		console.log("to server msg" + data);
	});
	*/
	
	// python実行のためのchild_processを作成
	var spawn = require('child_process').spawn;
	
	socket.on('abc', function(data) {
		
		console.log("to server abc 「" + data　+ "」");
		
		// pythonを実行
		var py    = spawn('python', ['test.py']);
		
		// pythonからの受信イベントを登録
		py.stdout.on('data', function(data){
		  console.log("on." + data);
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