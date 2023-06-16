const dgram = require('dgram');




// MAIN
function ntpQuery() {
  return new Promise((resolve, reject) => {
    var client = dgram.createSocket('udp4');
    var roundTripDelay = 0;
    var timeOffset = 0;


    // The client was closed.
    client.on('close', () => {
      resolve({timeOffset, roundTripDelay});
      console.log('Client closed');
    });

    // An error occurred.
    client.on('error', (err) => {
      console.log(`Client error\n${err.stack}`);
      reject(err);
      client.close();
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
      roundTripDelay = (t3 - t0) - (t2 - t1);
      console.log(`Round trip delay is ${roundTripDelay}ms`);
      // Calculate the time offset.
      timeOffset = (t1 + t2) / 2 - (t0 + t3) / 2;
      console.log(`Time offset is ${timeOffset}ms`);
      client.close();
    });

    // Send a ping to the server.
    var clientSentDate = new Date();
    var msg = Buffer.from('Ting-tong');
    client.send(msg, 0, msg.length, 41234, 'localhost', (err, bytes) => {});
  });
}


async function main() {
  var requests = [];
  for (var i=0; i<10; ++i)
    requests[i] = ntpQuery();
  var responses = await Promise.all(requests);
  // Calculate median time offset and round trip delay.
  var timeOffsets     = responses.map((r) => r.timeOffset);
  var roundTripDelays = responses.map((r) => r.roundTripDelay);
  var medianTimeOffset     = timeOffsets.sort()[Math.floor(timeOffsets.length/2)];
  var medianRoundTripDelay = roundTripDelays.sort()[Math.floor(roundTripDelays.length/2)];
  console.log(`Median time offset is ${medianTimeOffset} ± ${medianRoundTripDelay} ms`);
}
main();
