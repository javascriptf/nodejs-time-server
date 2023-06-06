Trying out [Network Time Protocol (NTP)][NTP] on Node.js.

The first experiment **01-echo** has a time server which responds with the time it recieved a message from the client (`recieved`), which can be used to calculate a rough estimate of *time offset*. The *time offset* of the server, and its *response delay* can be controlled by the environment variables `TIME_OFFSET` and `RESPONSE_DELAY` respectively.

The second experiment **02-basic** has a time server which responds with the time it recieved a message from the client (`recieved`) and the time it sent the response to the client (`sent`), which can be used to calculate a estimate of *time offset* and *round trip delay*, similar to the NTP.

[NTP]: https://en.wikipedia.org/wiki/Network_Time_Protocol
