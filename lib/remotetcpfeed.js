"use strict";

const net    = require('net');
const merge  = require('mout/object/merge');

const Server = require('./_server');
const firstPacket = []
class TCPFeed extends Server {

  constructor(server, opts) {
    super(server, merge({
      feed_ip   : '127.0.0.1',
      feed_port : 5001,
    }, opts));
    const that = this
    this.tcpServer = net.createServer((socket) => {
        //console.log(socket)
        that.rsckt = socket
        this.sendFirst = []

          this.start_feed()
  });
  this.tcpServer.listen(5000, '0.0.0.0');

  }

  get_feed() {

    /*var readStream = net.connect(this.options.feed_port, this.options.feed_ip, function(){
      console.log("remote stream ready");
    });*/
    //console.log(this.rsckt)
    return this.rsckt;
  }

}



module.exports = TCPFeed;
