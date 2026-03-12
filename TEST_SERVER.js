// Simple test server to verify Node.js works
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <body style="font-family: Arial; padding: 50px; text-align: center;">
        <h1 style="color: green;">✅ Server is Working!</h1>
        <p>Node.js server is running successfully on port 5000</p>
        <p>Now you can start the main server</p>
      </body>
    </html>
  `);
});

server.listen(5000, () => {
  console.log('✅ TEST SERVER RUNNING on http://localhost:5000');
  console.log('✅ Open your browser to http://localhost:5000');
  console.log('✅ Press Ctrl+C to stop');
});
