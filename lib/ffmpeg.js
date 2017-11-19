"use strict";


const spawn  = require('child_process').spawn;
const merge  = require('mout/object/merge');

const Server = require('./_server');


class FFMpegServer extends Server {

  constructor(server, opts) {
    super(server, merge({
      fps : 30,
    }, opts));
    this.get_feed_vaw()
    this.start_feed()
  }
  get_feed(){
    return this.teh_feed
  }
  get_feed_vaw() {

    /*var args = [
        "-f", "gdigrab",
        "-framerate", this.options.fps,
        "-offset_x", 10, 
        "-offset_y", 20, 
        "-video_size", this.options.width + 'x' + this.options.height,
        '-i',  'desktop', 
        '-pix_fmt',  'yuv420p',
        '-c:v',  'libx264',
        '-vprofile', 'baseline',
        '-tune', 'zerolatency',
        '-f' ,'rawvideo',
        '-'
    ];*/

      //https://trac.ffmpeg.org/wiki/Limiting%20the%20output%20bitrate
    var args = [
        "-f", "dshow",
        "-i",  "video=Logitech HD Webcam C270",//video=Integrated Webcam" ,
        "-framerate", this.options.fps,
        "-video_size", this.options.width + 'x' + this.options.height,
        '-pix_fmt',  'yuv420p',
        '-c:v',  'libx264',
        '-b:v', '600k',
        '-bufsize', '600k',
        '-vprofile', 'baseline',
        '-tune', 'zerolatency',
        '-keyint_min', '1',
        '-g','15',
        '-f' ,'rawvideo',
        '-'
    ];
    //ffmpeg -framerate 15 -video_size 640x480 -f dshow -i video="Logitech HD Webcam C270"  -vcodec libx264 -vprofile baseline -b:v 600k -bufsize 600k -tune zerolatency -pix_fmt yuv420p -r 50 -g 100 -force_key_frames "expr:gte(t,n_forced*2)" -f rawvideo tcp://localhost:5000
//    ffmpeg -framerate 25 -video_size 640x480 -i "video=Logitech HD Webcam C270"  -vcodec libx264 -vprofile baseline -b:v 500k -bufsize 600k -tune zerolatency -pix_fmt yuv420p -f rawvideo tcp://localhost:5000


    console.log("ffmpeg " + args.join(' '));
    var streamer = spawn('ffmpeg', args);
    //streamer.stderr.pipe(process.stderr);
    //streamer.stderr.on("data", function(code){console.log(code.toString())})
    //streamer.stdout.on("data", function(code){console.log(code.toString())})
    streamer.on("exit", function(code){
      
      console.log("Failure", code);
    });

    /*return*/ this.teh_feed = streamer.stdout;
  }

};


module.exports = FFMpegServer;


