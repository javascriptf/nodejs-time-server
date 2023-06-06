const dgram = require('dgram');

// CONSTANTS
const E = process.env;
const TIME_OFFSET    = parseFloat(E.TIME_OFFSET    || '1');  // ms
const RESPONSE_DELAY = parseFloat(E.RESPONSE_DELAY || '5');  // ms




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
  server.on('message', (msg, rinfo) => {
    console.log(`Server got '${msg}' from ${rinfo.address}:${rinfo.port}`);
    var recievedDate = new Date(new Date().getTime() + TIME_OFFSET);
    var recieved     = recievedDate.toISOString();
    // Respond with the current time after a delay.
    setTimeout(() => {
      var out = Buffer.from(JSON.stringify({recieved}));
      server.send(out, 0, out.length, rinfo.port, rinfo.address, (err, bytes) => {});
    }, RESPONSE_DELAY);
  });

  // The socket is addressable and can receive datagrams.
  server.on('listening', () => {
    var address = server.address();
    console.log(`Server listening at ${address.address}:${address.port}`);
  });
  server.bind(41234);
}
main();
