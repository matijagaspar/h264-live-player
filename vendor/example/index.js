const AvcServer = require('../lib/server')
const path = require('path')
const http = require('http')
const WebSocketServer = require('uws').Server
const net = require('net')


const express = require('express')
const app = express()
// serve the html/index.html
app.use(express.static(path.resolve(__dirname, 'html')))
// serve the player
app.use(express.static(path.resolve(__dirname, '../lib')))

const server = http.createServer(app)

// init web socket
const wss = new WebSocketServer({ /* port: 3333 */ server })
// init the avc server. 
const avcServer = new AvcServer(wss, 640, 480)

// create the tcp stream server
this.tcpServer = net.createServer((socket) => {
    // set video stream
    avcServer.setVideoStream(socket)
})
this.tcpServer.listen(5000, '0.0.0.0')


server.listen(8080)


// ffmpeg OSX
// then run ffmpeg: ffmpeg -framerate 30 -video_size 640x480 -f avfoundation -i 0  -vcodec libx264 -vprofile baseline -b:v 500k -bufsize 600k -tune zerolatency -pix_fmt yuv420p -r 15 -g 30 -f rawvideo - | nc localhost 5000

// RPI
// /opt/vc/bin/raspivid -t 0 -w 640 -h 480 -hf -fps 15 -o - | nc localhost 5000


/**
* on the remote rpi run
* raspivid -t 0 -o - -w 1280 -h 720 -fps 25 | nc -k -l 5001
* to create a raw tcp h264 streamer
*/
