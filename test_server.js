const http = require('http');
const server = http.createServer((req, res) => {
  res.end('Hello from Sandbox');
});
server.listen(32768, 'localhost', () => console.log('Server running on 32768'));
