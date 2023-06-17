import * as net   from "net";
import * as dgram from "dgram";




// #region METHODS
// ===============

// #region UTILITY
// ---------------

/**
 * Sleep for a number of milliseconds.
 * @param {number} ms milliseconds
 * @returns {Promise<void>}
 */
export async function sleep(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}




// #region NTP SERVER
// ------------------

/**
 * Define an NTP-like server.
 */
export class NTPServer {
  /**
   * UDP socket.
   * @type {dgram.Socket}
   */
  socket = null;

  /**
   * Time error of the server.
   * @type {number}
   */
  timeError = 0;

  /**
   * Time offset of the server.
   * @type {number}
   */
  timeOffset = 0;

  /**
   * Additional delay before recieving a request.
   * @type {number}
   */
  recieveDelay = 0;

  /**
   * Additional delay before responding to a request.
   * @type {number}
   */
  responseDelay = 0;

  /**
   * Additional delay before sending a response.
   * @type {number}
   */
  transmitDelay = 0;


  /**
   * Create a new NTP-like server.
   * @param {string} protocol protocol [udp4]
   */
  constructor(protocol="udp4") {
    this.socket = dgram.createSocket(protocol);

    // The server was closed.
    this.socket.on("close", () => {
      console.log(`Server closed`);
    });

    // An error occurred.
    this.socket.on("error", (err) => {
      console.log(`Server error\n${err.stack}`);
      this.socket.close();
    });

    // A new request has arrived.
    this.socket.on("message", async (msg, rinfo) => {
      var timeError = this.timeError;
      // Get the originate timestamp (t0).
      var {originateTimestamp} = JSON.parse(msg);
      // Measure the recieved timestamp (t1).
      if (this.recieveDelay) await sleep(this.recieveDelay);
      var receiveTimestamp = new Date().getTime() + this.timeOffset;
      // Simulate a delay in responding to the message (t1 -> t2).
      if (this.responseDelay) await sleep(this.responseDelay);
      // Measure the transmit timestamp (t2).
      var transmitTimestamp = new Date().getTime() + this.timeOffset;
      // Send the response.
      if (this.transmitDelay) await sleep(this.transmitDelay);
      var out = Buffer.from(JSON.stringify({timeError, originateTimestamp, receiveTimestamp, transmitTimestamp}));
      this.socket.send(out, 0, out.length, rinfo.port, rinfo.address, (err, bytes) => {});
      // Log the request and response.
      console.log(`Server got request from ${rinfo.address}:${rinfo.port}`);
      console.log(`- originateTimestamp: ${new Date(originateTimestamp).toISOString()}`);
      console.log(`- receiveTimestamp:   ${new Date(receiveTimestamp)  .toISOString()}`);
      console.log(`- transmitTimestamp:  ${new Date(transmitTimestamp) .toISOString()}`);
    });

    // The socket is addressable and can receive datagrams.
    this.socket.on("listening", () => {
      var address = this.socket.address();
      console.log(`Server listening at ${address.address}:${address.port}`);
      console.log(`- timeError:  ${this.timeError} ms`);
      console.log(`- timeOffset: ${this.timeOffset} ms`);
      console.log(`- recieveDelay:  ${this.recieveDelay} ms`);
      console.log(`- responseDelay: ${this.responseDelay} ms`);
      console.log(`- transmitDelay: ${this.transmitDelay} ms`);
    });
  }


  /**
   * Get the address of the server.
   * @returns {net.AddressInfo} address
   */
  address() {
    return this.socket.address();
  }


  /**
   * Close the server.
   * @returns {Promise<void>}
   */
  close() {
    return new Promise((resolve, reject) => {
      this.socket.close(resolve);
    });
  }


  /**
   * Bind the server to a port.
   * @param {number} port port [1234]
   * @returns {Promise<void>}
   */
  bind(port) {
    return new Promise((resolve, reject) => {
      this.socket.on("error", reject);
      this.socket.bind(port, resolve);
    });
  }
}
// #endregion
// #endregion




// #region NTP CLIENT
// ------------------

/**
 * NTP client response.
 * @typedef {object} NTPClientResponse
 * @property {number} timeError time error of the server
 * @property {number} originateTimestamp originate timestamp (t0)
 * @property {number} receiveTimestamp receive timestamp (t1)
 * @property {number} transmitTimestamp transmit timestamp (t2)
 * @property {number} terminateTimestamp terminate timestamp (t3)
 * @property {number} roundTripDelay round-trip delay (δ)
 * @property {number} timeOffset time offset (θ)
 */


/**
 * Define an NTP-like client.
 */
export class NTPClient {
  /**
   * UDP socket.
   * @type {dgram.Socket}
   */
  socket = null;

  /**
   * Timeout for the response.
   * @type {number}
   */
  timeout = 4000;

  /**
   * Timeout ID.
   * @type {NodeJS.Timeout}
   */
  timeoutId = null;

  /**
   * Callback function for the response.
   * @type {function}
   * @param {NTPClientResponse} response response
   */
  onResponse = null;


  /**
   * Create a new NTP-like client.
   * @param {string} protocol protocol [udp4]
   */
  constructor(protocol="udp4") {
    this.socket = dgram.createSocket(protocol);

    // The client was closed.
    this.socket.on("close", () => {
      if (this.timeoutId) clearTimeout(this.timeoutId);
      console.log(`Client closed`);
    });

    // An error occurred.
    this.socket.on("error", (err) => {
      console.log(`Client error\n${err.stack}`);
      this.socket.close();
    });

    // A response has arrived.
    this.socket.on("message", (msg, rinfo) => {
      // Get the server's response.
      var {timeError, originateTimestamp, receiveTimestamp, transmitTimestamp} = JSON.parse(msg);
      // Measure the client recieved timestamp (t3).
      var terminateTimestamp = new Date().getTime();
      // Use the standard short notation for the time stamps.
      var t0 = originateTimestamp;
      var t1 = receiveTimestamp;
      var t2 = transmitTimestamp;
      var t3 = terminateTimestamp;
      // Calculate the round-trip delay and time offset.
      var roundTripDelay = (t3 - t0)   - (t2 - t1);
      var timeOffset     = (t1 + t2)/2 - (t0 + t3)/2;
      // Provide response and close the client.
      if (this.onResponse) this.onResponse({
        timeError, originateTimestamp, receiveTimestamp, transmitTimestamp,
        terminateTimestamp, roundTripDelay, timeOffset
      });
      this.socket.close();
      // Log the response.
      console.log(`Client got message from ${rinfo.address}:${rinfo.port}`);
      console.log(`- timeError:         ${timeError} ms`);
      console.log(`- originateTimestamp ${new Date(originateTimestamp).toISOString()}`);
      console.log(`- receiveTimestamp:  ${new Date(receiveTimestamp)  .toISOString()}`);
      console.log(`- transmitTimestamp: ${new Date(transmitTimestamp) .toISOString()}`);
      console.log(`- terminateTimestamp ${new Date(terminateTimestamp).toISOString()}`);
      console.log(`- roundTripDelay:    ${roundTripDelay} ms`);
      console.log(`- timeOffset:        ${timeOffset} ms`);
    });
  }


  /**
   * Send a request to the server.
   * @param {string} host host [localhost]
   * @param {number} port port [1234]
   * @param {number} originateTimestamp originate timestamp [new Date().getTime()]
   * @returns {Promise<NTPClientResponse>} response
   */
  send(host="localhost", port=1234, originateTimestamp=new Date().getTime()) {
    return new Promise((resolve, reject) => {
      // Set a timeout for the response.
      this.timeoutId = setTimeout(() => {
        reject(new Error("Client timeout: No response recieved"));
        this.socket.close();
      }, this.timeout);
      // Send the request.
      var out = Buffer.from(JSON.stringify({originateTimestamp}));
      this.onResponse = resolve;
      this.socket.send(out, 0, out.length, port, host, (err, bytes) => {
        if (err) { reject(err); this.socket.close(); }
      });
    });
  }
}
// #endregion
