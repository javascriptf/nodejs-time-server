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
    var {recieved, sent} = JSON.parse(msg.toString());
    // Obtain all the time stamps.
    var clientRecievedDate = new Date();
    var serverRecievedDate = new Date(recieved);
    var serverSentDate     = new Date(sent);
    // Use the standard short notation for the time stamps.
    var t0 = clientSentDate.getTime();
    var t1 = serverRecievedDate.getTime();
    var t2 = serverSentDate.getTime();
    var t3 = clientRecievedDate.getTime();
    // Calculate the round trip delay.
    var roundTripDelay = (t3 - t0) - (t2 - t1);
    console.log(`Round trip delay is ${roundTripDelay}ms`);
    // Calculate the time offset.
    var timeOffset = (t1 + t2) / 2 - (t0 + t3) / 2;
    console.log(`Time offset is ${timeOffset}ms`);
    client.close();
  });

  // Send a ping to the server.
  var clientSentDate = new Date();
  var msg = Buffer.from('Ting-tong');
  client.send(msg, 0, msg.length, 41234, 'localhost', (err, bytes) => {});
}
main();
