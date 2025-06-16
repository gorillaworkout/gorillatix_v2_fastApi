// k6.js
import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 400, // 200 virtual users
  duration: '1m', // selama 30 detik
};

export default function () {
  http.get('https://www.gorillatix.com'); // ganti dengan URL halaman kamu (misalnya /checkout)
  sleep(1);
}
