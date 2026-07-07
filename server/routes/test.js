const express = require('express');
const router = express.Router();
const net = require('net');

router.get('/smtp-test', (req, res) => {
  const start = Date.now();
  const socket = net.createConnection(587, 'smtp.gmail.com', () => {
    socket.end();
    res.json({ success: true, message: 'Connected to Gmail SMTP on port 587', timeMs: Date.now() - start });
  });
  
  socket.setTimeout(5000);
  
  socket.on('timeout', () => {
    socket.destroy();
    res.json({ success: false, error: 'Connection timed out (Port 587 is blocked by firewall)', timeMs: Date.now() - start });
  });
  
  socket.on('error', (err) => {
    res.json({ success: false, error: err.message, timeMs: Date.now() - start });
  });
});

module.exports = router;
