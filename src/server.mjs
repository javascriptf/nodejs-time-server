import {NTPServer} from "./common.mjs";


// FUNCTIONS
// Parse command line options.
function options(o, a, i) {
  if      (a[i]==='--time-error')  o.timeError  = parseFloat(a[++i]);
  else if (a[i]==='--time-offset') o.timeOffset = parseFloat(a[++i]);
  else if (a[i]==='--recieve-delay')  o.recieveDelay  = parseFloat(a[++i]);
  else if (a[i]==='--response-delay') o.responseDelay = parseFloat(a[++i]);
  else if (a[i]==='--transmit-delay') o.transmitDelay = parseFloat(a[++i]);
  else o.error = `Unknown option: ${a[i]}`;
  return ++i;
}


// Main function.
async function main(argv) {
  var server = new NTPServer();
  for (var i=2; i<argv.length;)
    i = options(server, argv, i);
  await server.bind(1234);
}
main(process.argv);
