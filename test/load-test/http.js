import { sleep } from 'k6';
import http from 'k6/http';

export let options = {
  vus: 5,
  stages: [
    { duration: '0s', target: 3000 },
    { duration: '10m', target: 3000 },
  ],
};

const avgTimeToSuccess = 60;
const timeToRetry = 3;

export default function () {
  for (let i = 0; i < avgTimeToSuccess / timeToRetry; i++) {
    http.get('http://localhost:3003/txid/123456');
    sleep(timeToRetry);
  }
}
