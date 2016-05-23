var http = require('http');
var fs = require('fs');
var url = require('url');
var serialport = require('serialport');


// ■■■■■■■■　Node.js　■■■■■■■■■
var http_src = fs.readFileSync('./index.html');		// HTMLファイルのソースを同期処理で読み出す

// HTTPサーバーを作成
var app = http.createServer(function(req, res) {
	
	// リクエストされたURLを取得
	var url_parts = url.parse(req.url);
	console.log(url_parts.pathname);
	
	// ルートまたはindex.htmlの場合
	if(url_parts.pathname == '/' || url_parts.pathname == '/index.html')
	{
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write(http_src);
		res.end();
	}
	
	// その他のファイルは404コードを返答する
	else
	{
		res.writeHead(404);
		res.write(url_parts.pathname + "not found.");	// 脆弱性
		res.end();
	}

}).listen(process.env.PORT || 3000);	// サーバー内環境のポートまたは3000番で待受

// シリアルポートのインスタンス
var sp;

// ■■■■■■■■　socket.io（サーバー側）　■■■■■■■■■
var io = require('socket.io').listen(app);
io.sockets.on('connection', function(socket) {
	
	// なぜか.htmlにアクセス時に'connection'イベントが発生する（原因不明）
	console.log("socket.io connected.");
	
	/*
	socket.on('message', function(data) {		// messageイベント：すべてのメッセージを受信時
    //io.sockets.emit('msg', data);
		socket.broadcast.emit('msg', data);
		console.log("to server msg" + data);
	});
	*/
	
	// 接続開始時のイベントハンドラを定義
	socket.on('open-connection', function(data) {
		
		console.log("socket.io received 'open-connection' event and '" + data + "' message from html");
		
		// シリアルポートのインスタンスを作成する
		sp = new serialport.SerialPort(data, {
			baudRate: 38400,
			dataBits: 8,
			parity: 'none',
			stopBits: 1,
			flowControl: true,
		});
		
		// 受信イベントハンドラを定義
		sp.on('data', function(recv) {
			console.log('recv:' + recv);
			
			// 受信データをファイルに書き出し
			fs.appendFile('zw.csv', recv, 'utf8', function(err) {
				if(! err) {
					fs.appendFileSync('zw.csv', '\n', 'utf8');
				} else {
					console.log('recv_err:' + err);					
				}
			});
			
			// 受信データをHTMLへ送信
			socket.emit('response', recv);	
			
		});
		
	});	
	
	// クライアントからシリアルデータの送信要求イベントに対するハンドラ
	socket.on('path-through', function(data) {
		
		console.log();
		console.log("socket.io received 'path-through' event and '" + data + "' message from html");
		
		// シリアルデータを送信
		sp.write(data, function(err, results) {
			if (! err) {	// エラーなし
				console.log(results + ' bytes written');
			} else {		// エラーあり
				console.log("error : " + err + "  " + results);
			}
		});
	});
	
			
	// 使用可能なCOMポートを書き出す
	serialport.list(function (err, ports) {
		ports.forEach(function(port) {
			console.log(port.comName);
		});
	})
	
	
	
	// ～～～～～　OLDコード　～～～～～
	
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