"use strict";

var Avc            = require('../broadway/Decoder');
var YUVWebGLCanvas = require('../canvas/YUVWebGLCanvas');
var YUVCanvas      = require('../canvas/YUVCanvas');
var Size           = require('../utils/Size');
var EventEmitter = require('events').EventEmitter

var debug          = require('debug');
var log            =  debug("wsavc");


class WSAvcPlayer extends EventEmitter {
  constructor(canvas, canvastype) {
        super()
        this.canvas     = canvas;
        this.canvastype = canvastype;
        // AVC codec initialization
        this.avc = new Avc();
        if(false) this.avc.configure({
          filter: "original",
          filterHorLuma: "optimized",
          filterVerLumaEdge: "optimized",
          getBoundaryStrengthsA: "optimized"
        });
    
        //WebSocket variable
        this.ws;
        this.pktnum = 0;
    
      }
    
    
      decode (data) {
        var naltype = "invalid frame";
    
        if (data.length > 4) {
          if (data[4] == 0x65) {
            naltype = "I frame";
          }
          else if (data[4] == 0x41) {
            naltype = "P frame";
          }
          else if (data[4] == 0x67) {
            naltype = "SPS";
          }
          else if (data[4] == 0x68) {
            naltype = "PPS";
          }
        }
        log("Passed " + naltype + " to decoder");
        this.avc.decode(data);
      }
    
      connect(url) {
    
        // Websocket initialization
        if (this.ws != undefined) {
          this.ws.close();
          delete this.ws;
        }
        this.ws = new WebSocket(url);
        this.ws.binaryType = "arraybuffer";
    
        this.ws.onopen = () => {
          log("Connected to " + url);
          this.emit('connected', url)
        };
    
    
        var framesList = [];
    
        this.ws.onmessage = (evt) => {
          if(typeof evt.data == "string")
            return this.cmd(JSON.parse(evt.data));
    
          this.pktnum++;
          var frame = new Uint8Array(evt.data);
          //log("[Pkt " + this.pktnum + " (" + evt.data.byteLength + " bytes)]");
          //this.decode(frame);
          framesList.push(frame);
        };
    
    
        var running = true;
    
        var shiftFrame = function() {
          if(!running)
            return;
    
    
          if(framesList.length > 10) {
            log("Dropping frames", framesList.length);
            framesList = [];
          }
    
          var frame = framesList.shift();
    
    
          if(frame)
            this.decode(frame);
    
          requestAnimationFrame(shiftFrame);
        }.bind(this);
    
    
        shiftFrame();
    
    
    
        this.ws.onclose = () => {
          running = false;
          this.emit("disconnected");
          log("WSAvcPlayer: Connection closed")
        };

        return this.ws
    
      }
    
      initCanvas (width, height) {
        var canvasFactory = this.canvastype == "webgl" || this.canvastype == "YUVWebGLCanvas"
                            ? YUVWebGLCanvas
                            : YUVCanvas;
    
        var canvas = new canvasFactory(this.canvas, new Size(width, height));
        this.avc.onPictureDecoded = canvas.decode;
        this.emit("canvas_initialized", width, height);
        
      }
    
      cmd (cmd){
        log("Incoming request", cmd);
    
        if(cmd.action == "init") {
          this.initCanvas(cmd.width, cmd.height);
          this.canvas.width  = cmd.width;
          this.canvas.height = cmd.height;
        }else{
          this.emit('message',cmd)
        }
      }
    
      disconnect () {
        this.ws.close();
        
      }
      
      sendToServer(message){
        this.ws.send(message)
      }
}

module.exports = WSAvcPlayer;
module.exports.debug = debug;
