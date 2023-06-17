import {sleep, NTPClient} from "./common.mjs";




// MAIN
async function main() {
  var host = 'localhost', port = 1234;
  // Make 16 requests to the server.
  var requests = [];
  for (var i=0; i<16; ++i) {
    await sleep(1000);
    requests[i] = new NTPClient().send(host, port);
  }
  // Wait for all the requests to complete.
  var responses = await Promise.all(requests);
  // Remove outliers.
  responses.sort((a, b) => a.timeOffset - b.timeOffset);
  responses = responses.slice(2, -2);
  responses.sort((a, b) => a.roundTripDelay - b.roundTripDelay);
  responses = responses.slice(2, -2);
  // Calculate average round trip delay and time offset.
  var timeError = 0, roundTripDelay = 0, timeOffset = 0;
  for (var i=0; i<responses.length; ++i) {
    timeError      += responses[i].timeError;
    roundTripDelay += responses[i].roundTripDelay;
    timeOffset     += responses[i].timeOffset;
  }
  timeError      /= responses.length;
  roundTripDelay /= responses.length;
  timeOffset     /= responses.length;
  // Print the results.
  console.log(`Client time offset is ${timeOffset} ± ${timeError + roundTripDelay/2} ms`);
  console.log(`Client needs to add ${-timeOffset} ms to its clock`);
}
main();
