const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = 32768;
const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, 'frontend', req.url === '/' ? 'index.html' : req.url);
    fs.readFile(filePath, (err, content) => {
        if (err) { res.writeHead(404); res.end('File not found'); }
        else {
            const ext = path.extname(filePath);
            let contentType = 'text/html';
            switch (ext) { case '.js': contentType = 'text/javascript'; break; case '.css': contentType = 'text/css'; break; case '.json': contentType = 'application/json'; break; }
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});
server.listen(PORT, '127.0.0.1', () => console.log('Server running on 127.0.0.1:' + PORT));
