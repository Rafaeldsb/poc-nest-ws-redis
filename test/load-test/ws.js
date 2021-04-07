import ws from 'k6/ws';
import { check } from 'k6';

export let options = {
  vus: 5,
  stages: [
    { duration: '0s', target: 5000 },
    { duration: '3m', target: 10000 },
  ],
};

export default function () {
  const url = 'ws://localhost:3003/';
  const params = { tags: { my_tag: 'hello' } };
  const res = ws.connect(url, params, function (socket) {
    socket.on('open', () => {
      // console.log('connected');
      socket.send(
        JSON.stringify({
          event: 'pix-mock',
          data: { txid: 123456 },
        }),
      );
    });
    socket.on('message', (data) => {
      const message = JSON.parse(data);
      // console.log('Message received: ', message);
      if (message.event === 'pix') {
        socket.close();
      }
    });
    // socket.on('close', () => console.log('disconnected'));
  });

  check(res, { 'status is 101': (r) => r && r.status === 101 });
}
