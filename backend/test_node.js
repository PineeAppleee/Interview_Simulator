const http = require('http');
const port = process.env.PORT || 8084;
const server = http.createServer((req, res) => {
    res.end('Hello');
});
server.listen(port, '127.0.0.1', () => {
    console.log(`Server listening on 127.0.0.1:${port}`);
});

