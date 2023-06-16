const dgram = require('dgram');

// CONSTANTS
const E = process.env;
const TIME_OFFSET    = parseFloat(E.TIME_OFFSET    || '1');  // ms
const RECIEVE_DELAY  = parseFloat(E.RECIEVE_DELAY  || '1');  // ms
const RESPONSE_DELAY = parseFloat(E.RESPONSE_DELAY || '5');  // ms
const SEND_DELAY     = parseFloat(E.SEND_DELAY     || '1');  // ms




// UTILITY
// Sleep for a number of milliseconds.
async function sleep(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}




// MAIN
function main() {
  var server = dgram.createSocket('udp4');

  // The server was closed.
  server.on('close', () => {
    console.log(`Server closed`);
  });

  // An error occurred.
  server.on('error', (err) => {
    console.log(`Server error\n${err.stack}`);
    server.close();
  });

  // A new datagram has arrived.
  server.on('message', async (msg, rinfo) => {
    console.log(`Server got '${msg}' from ${rinfo.address}:${rinfo.port}`);
    // Simulate a delay in recieving the message.
    if (RECIEVE_DELAY) await sleep(RECIEVE_DELAY);
    // Get the recieved time.
    var recievedDate = new Date(new Date().getTime() + TIME_OFFSET);
    var recieved     = recievedDate.toISOString();
    // Simulate a delay in responding to the message.
    if (RESPONSE_DELAY) await sleep(RESPONSE_DELAY);
    if (SEND_DELAY)     await sleep(SEND_DELAY);
    // Respond with the current time after a delay.
    var out = Buffer.from(JSON.stringify({recieved}));
    server.send(out, 0, out.length, rinfo.port, rinfo.address, (err, bytes) => {});
  });

  // The socket is addressable and can receive datagrams.
  server.on('listening', () => {
    var address = server.address();
    console.log(`Server listening at ${address.address}:${address.port}`);
  });
  server.bind(41234);
}
main();
