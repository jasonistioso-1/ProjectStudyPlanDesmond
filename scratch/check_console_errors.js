const { spawn } = require('child_process');
const http = require('http');

console.log('Launching Chrome with remote debugging...');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9222',
  '--disable-gpu',
  '--no-sandbox',
  'http://localhost:3000'
]);

setTimeout(() => {
  http.get('http://127.0.0.1:9222/json/list', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const pages = JSON.parse(data);
        const targetPage = pages.find(p => p.url && p.url.includes('localhost:3000'));
        if (targetPage) {
          const wsUrl = targetPage.webSocketDebuggerUrl;
          console.log('Target Page WebSocket URL:', wsUrl);
          
          const ws = new globalThis.WebSocket(wsUrl);
          ws.onopen = () => {
            console.log('Connected to Chrome DevTools WebSocket!');
            ws.send(JSON.stringify({ id: 1, method: 'Console.enable' }));
            ws.send(JSON.stringify({ id: 2, method: 'Runtime.enable' }));
            ws.send(JSON.stringify({ id: 3, method: 'Page.enable' }));
            ws.send(JSON.stringify({ id: 4, method: 'Page.reload' }));
          };
          ws.onmessage = (event) => {
            const parsed = JSON.parse(event.data);
            if (parsed.method === 'Console.messageAdded') {
              console.log('CONSOLE MSG:', parsed.params.message.text, parsed.params.message.url);
            } else if (parsed.method === 'Runtime.consoleAPICalled') {
              console.log('RUNTIME CONSOLE:', parsed.params.type, parsed.params.args.map(a => a.value || a.description));
            } else if (parsed.method === 'Runtime.exceptionThrown') {
              console.log('EXCEPTION THROWN:', JSON.stringify(parsed.params.exceptionDetails, null, 2));
            }
          };
          setTimeout(() => {
            ws.close();
            chrome.kill();
            process.exit(0);
          }, 4000);
        } else {
          console.log('Target page not found');
          chrome.kill();
          process.exit(0);
        }
      } catch (e) {
        console.error('Error in debugger script:', e);
        chrome.kill();
        process.exit(0);
      }
    });
  }).on('error', err => {
    console.error('Error connecting to Chrome DevTools:', err.message);
    chrome.kill();
    process.exit(0);
  });
}, 2000);
