const http = require('http');

const data = JSON.stringify({
  messages: [{ role: "user", content: "Say the exact phrase: Hello Streaming World" }],
  stream: true,
  sessionId: "test-session-123"
});

const req = http.request(
  'http://localhost:5000/api/chat',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
      // Need an auth token from prior implementation or we can't test easily without bypassing.
      // Wait, there's a protect middleware on /api/chat!
    }
  },
  (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      console.log(`BODY: ${chunk}`);
    });
    res.on('end', () => {
      console.log('No more data in response.');
    });
  }
);

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});
req.write(data);
req.end();
