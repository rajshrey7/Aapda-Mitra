import { WebSocketServer } from 'ws';
import { URL } from 'url';

const wss = new WebSocketServer({ port: 8081 });

const clients = new Map();

wss.on('connection', function connection(ws, req) {
  const parameters = new URL(req.url, `http://${req.headers.host}`).searchParams;
  const role = parameters.get('role');
  const id = Date.now();
  clients.set(ws, { id, role });

  console.log(`Client ${id} connected with role: ${role}`);

  ws.on('error', console.error);

  ws.on('message', function message(data) {
    const messageData = data.toString();
    console.log(`received from ${id}: ${messageData}`);
    const senderInfo = clients.get(ws);

    if (senderInfo.role === 'teacher') {
      console.log(`Broadcasting message from teacher ${id}: ${messageData}`);
      wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === ws.OPEN) {
          const receiverInfo = clients.get(client);
          if (receiverInfo && receiverInfo.role === 'student') {
            client.send(messageData);
          }
        }
      });
    }
  });

  ws.on('close', function() {
    const clientInfo = clients.get(ws);
    console.log(`Client ${clientInfo.id} disconnected`);
    clients.delete(ws);
  });

  ws.send('Welcome to the disaster alert system.');
});

console.log('=== WebSocket server started on port 8081 ===');