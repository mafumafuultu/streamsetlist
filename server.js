const http = require('http');
const fs = require('fs');
const mime = require('mime-types');
const markdown = require("markdown-wasm");
const {Server} = require('socket.io');
const hostname = '127.0.0.1';
const port = 3000;
const targetfile = './live.md';
const names = {
	targetfile: './live.md',
};
const server = http.createServer((req, res) => {
	var filePath = '.' + req.url;
	if (filePath == './') filePath = './index.html';
	var contentType = mime.lookup(filePath) || 'application/octet-stream';
	fs.readFile(filePath, function(err, content) {
		if (err) {
			if (err.code == 'ENOENT') {
				fs.readFile('./404.html', function(err, content) {
					res.writeHead(404, { 'Content-Type': 'text/html' });
					res.end(content, 'utf-8');
				});
			} else {
				res.writeHead(500);
				res.end('Sorry, check with the site admin for err: ' + err.code + ' ..\n');
			}
		} else {
			res.writeHead(200, {'Content-Type': contentType});
			res.end(content, 'utf-8');
		}
	});
});

const readFile = name => {
	if (name) names.targetfile = name;
	fs.readFile(names.targetfile, 'utf-8', function(err, data) {
		if (err) throw err;
		io.emit('fswatch', markdown.parse(data));
	});
};
server.listen(port, hostname, () => console.log(`Server running at http://${hostname}:${port}/`));
const io = new Server(server);
io.on('connection', socket => {
	console.debug(`connect`);
	socket.on('disconnect', () => console.debug('disconnected'));
	socket.on('chat message', msg => console.debug(msg))
	socket.on('readlive', readFile);
});
fs.watch(targetfile, (_, fname) => fname ? readFile() : void 0);