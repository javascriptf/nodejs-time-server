Trying out [Network Time Protocol (NTP)][NTP] on Node.js.

![](https://i.imgur.com/gvoJosL.jpg)

<br>

**NTP** is a protocol for *synchronizing clocks* over a *network*. It is used to
keep the time on a computer synchronized with a *reference time source*. The
reference time source is usually a radio or satellite transmitter, or a GPS
receiver. In our case, we will use our custom NTP server.

Our NTP server is implemented in `src/server.mjs`. It starts a UDP server on
port `1234` by default, and accepts and responds to NTP requests in *JSON*. An
NTP client sends it `{originateTimestamp}` (**t0**), and the server responds
with `{timeError, originateTimestamp, receiveTimestamp, transmitTimestamp}`
(**Δtₛ**, **t0**, **t1**, **t2**). Upon receiving the response at
`{terminateTimestamp}` (**t3**), the client calculates the `{roundTripDelay}`
**δ** `(t3 - t0)   - (t2 - t1)` and the `{timeOffset}` **θ** `(t1 + t2)/2 - (t0 + t3)/2`
to synchronize its clock. This step is repeated a few times, outliers
are removed, and resulting values averaged, to get a more accurate estimate of
the **time offset**. Note that you must include the `{timeError}` of the NTP
server in the error bounds of the time offset, i.e., client time offset is
`${AVERAGE(timeOffset)} ± ${timeError + AVERAGE(roundTripDelay)/2}`. Our NTP
client is implemented in `src/client.mjs`.

<br>

We simulate an NTP synchronication over the *local network* using ([logs-0]):

```bash
$ node src/server.mjs
# Server listening at 0.0.0.0:1234
# - timeError:  0 ms
# - timeOffset: 0 ms
# - recieveDelay:  0 ms
# - responseDelay: 0 ms
# - transmitDelay: 0 ms
```

```bash
$ node src/client.mjs
# Client got message from 127.0.0.1:1234
# ...
# Client time offset is -0.75 ± 1.5 ms
# Client needs to add 0.75 ms to its clock
```

<br>

We simulate an NTP synchronication over the *intracontinential network* using a
symmetric *recieve* and *transmit delay* of `15 ms` each ([logs-30]):

```bash
$ node ./src/server.mjs --recieve-delay 15 --transmit-delay 15
# Server listening at 0.0.0.0:1234
# - timeError:  0 ms
# - timeOffset: 0 ms
# - recieveDelay:  15 ms
# - responseDelay: 0 ms
# - transmitDelay: 15 ms
```

```bash
$ node src/client.mjs
# Client got message from 127.0.0.1:1234
# ...
# Client time offset is 6.0625 ± 24.4375 ms
# Client needs to add -6.0625 ms to its clock
```

<br>

We simulate an NTP synchronication over the *intercontinential network* using a
symmetric *recieve* and *transmit delay* of `250 ms` each ([logs-500]):

```bash
$ node ./src/server.mjs --recieve-delay 250 --transmit-delay 250
# Server listening at 0.0.0.0:1234
# - timeError:  0 ms
# - timeOffset: 0 ms
# - recieveDelay:  250 ms
# - responseDelay: 0 ms
# - transmitDelay: 250 ms
```

```bash
$ node src/client.mjs
# Client got message from 127.0.0.1:1234
# ...
# Client time offset is 0 ± 264.75 ms
# Client needs to add 0 ms to its clock
```

<br>
<br>


## References

- [Network Time Protocol (NTP)][NTP]
- [song940/node-ntp : Lsong](https://github.com/song940/node-ntp/blob/master/packet.js)
- [How much network latency is "typical" for east - west coast USA?](https://serverfault.com/q/137348)
- [IP Latency Statistics - Verizon](https://www.verizon.com/business/terms/latency/)
- [What is NTP? Network Time Protocol Overview - study-ccna.com](https://study-ccna.com/ntp-network-time-protocol/)
- [UDP/datagram sockets - Node.js Documentation](https://nodejs.org/api/dgram.html)

<br>
<br>


[![](https://img.youtube.com/vi/BAo5C2qbLq8/maxresdefault.jpg)](https://www.youtube.com/watch?v=BAo5C2qbLq8)<br>
[![ORG](https://img.shields.io/badge/org-javascriptf-green?logo=Org)](https://javascriptf.github.io)
[![DOI](https://zenodo.org/badge/650028750.svg)](https://zenodo.org/badge/latestdoi/650028750)


[NTP]: https://en.wikipedia.org/wiki/Network_Time_Protocol
[logs-0]: https://gist.github.com/wolfram77/a67bfe95230fb4c9331cc68b2a822384
[logs-30]: https://gist.github.com/wolfram77/65816f75bcc5538c5f847e7510e3beff
[logs-500]: https://gist.github.com/wolfram77/bf0455474065f23844f123c0a788a739
