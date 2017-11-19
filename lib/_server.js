"use strict";


const WebSocketServer = require('uws').Server;
const Splitter        = require('stream-split');
const merge           = require('mout/object/merge');

const NALseparator    = new Buffer([0,0,0,1]);//NAL break


class _Server {

  constructor(server, options) {

    this.options = merge({
        width : 960,
        height: 540,
    }, options);

    this.wss = new WebSocketServer({ port:3333 });

    this.new_client = this.new_client.bind(this);
    this.start_feed = this.start_feed.bind(this);
    this.broadcast  = this.broadcast.bind(this);

    this.wss.on('connection', this.new_client);
  }
  

  start_feed() {
    var readStream = this.get_feed();
    this.readStream = readStream;
    /*if(this.sendFirst){
      for(let f of this.sendFirst){
        this.broadcast(f)
      }
    }*/
    readStream = readStream.pipe(new Splitter(NALseparator));
    readStream.on("data", this.broadcast);
  }

  get_feed() {
    throw new Error("to be implemented");
  }

  broadcast(data) {
    /*if(!this.doneFirst){
      console.log(data)
      this.doneFirst = true
    }*/

    //console.log(data[0] & 0x1f)
    const frameType = data[0] & 0x1f
    if (frameType == 7) {
      //naltype = "SPS";
      //clearTimeout(this.lastSPSTimeout)
      //console.log('got sps')
      //this.lastSPSTimeout = setTimeout(()=>this.broadcast(this.lastSPS),2000)
      this.lastSPS = data
    }
    else if (frameType == 8) {
      //clearTimeout(this.lastPPSTimeout)
      //console.log('got pps')
      //this.lastPPSTimeout = setTimeout(()=>this.broadcast(this.lastPPS),2000)
      this.lastPPS = data
      //naltype = "PPS";
    }

    this.wss.clients.forEach(function(socket) {

      if(socket.buzy)
        return;

      socket.buzy = true;
      socket.buzy = false;

      socket.send(Buffer.concat([NALseparator, data]), { binary: true}, function ack(error) {
        socket.buzy = false;
      });
    });
  }

  new_client(socket) {
  
    var self = this;
    console.log('New guy');

    socket.send(JSON.stringify({
      action : "init",
      width  : this.options.width,
      height : this.options.height,
    }));

    if(this.lastSPS){
      socket.send(Buffer.concat([NALseparator, this.lastSPS]), { binary: true})
    }
    if(this.lastPPS){
    socket.send(Buffer.concat([NALseparator, this.lastPPS]), { binary: true})
    }
    
    socket.on("message", function(data){
      var cmd = "" + data, action = data.split(' ')[0];
      console.log("Incomming action '%s'", action);

      if(action == "REQUESTSTREAM")
        self.start_feed();
      if(action == "STOPSTREAM")
        self.readStream.pause();
    });

    /*socket.on('close', function() {
      self.readStream.end();
      console.log('stopping client interval');
    });*/
  }


};


module.exports = _Server;
