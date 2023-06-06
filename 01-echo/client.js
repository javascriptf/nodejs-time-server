const dgram = require('dgram');




// MAIN
function main() {
  var client = dgram.createSocket('udp4');


  // The client was closed.
  client.on('close', () => {
    console.log('Client closed');
  });

  // A response datagram has arrived.
  client.on('message', (msg, rinfo) => {
    // Parse the response {recieved} object.
    // `recieved` is the server's time when it recieved the ping.
    console.log(`Client got '${msg}' from ${rinfo.address}:${rinfo.port}`);
    var {recieved} = JSON.parse(msg.toString());
    // Obtain all the time stamps.
    var clientRecievedDate = new Date();
    var serverRecievedDate = new Date(recieved);
    // Use the standard short notation for the time stamps.
    var t1 = serverRecievedDate.getTime();
    var t3 = clientRecievedDate.getTime();
    var timeOffset = t1 - t3;
    console.log(`Server time is ${timeOffset}ms ahead of local time`);
    client.close();
  });

  // Send a ping to the server.
  var msg = Buffer.from('Ting-tong');
  client.send(msg, 0, msg.length, 41234, 'localhost', (err, bytes) => {});
}
main();
