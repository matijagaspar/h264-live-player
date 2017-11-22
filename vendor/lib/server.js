// stream splitter, broadcasting, and player signaling
const Splitter = require('stream-split')

const NALseparator = new Buffer([ 0, 0, 0, 1 ])// NAL break


module.exports = class WSAvcServer {
    // TODO: changable width and height
    constructor (wss, width, height, options = {}) {
        // init ws
        if (!wss) {
            throw new Error('WS is required')
        }
        // etc
        this.options = {
            width: width || 960,
            height: height || 540,
            ...options,
        }
        this.wss = wss


        this.broadcast = this.broadcast.bind(this)
        this.new_client = this.new_client.bind(this)
        this.wss.on('connection', this.new_client)
    }

    setVideoStream (readStream) {
        this.readStream = readStream
        readStream = readStream.pipe(new Splitter(NALseparator))
        readStream.on('data', this.broadcast)
    }

    broadcast (data) {
        /* handle streams that don't retransmit sps/pps like fmpeg omx -.- */
        /* const frameType = data[0] & 0x1f
        if (frameType == 7) {
          this.lastSPS = data
        }
        else if (frameType == 8) {
          this.lastPPS = data
        } */

        // TODO: implement own client list
        this.wss.clients.forEach(function (socket) {

            if (socket.buzy)
                return

            socket.buzy = true
            socket.buzy = false

            socket.send(Buffer.concat([ NALseparator, data ]), { binary: true }, function ack (error) {
                socket.buzy = false
            })
        })
    }

    new_client (socket) {

        socket.send(JSON.stringify({
            action: 'init',
            width: this.options.width,
            height: this.options.height,
        }))

        /* handle streams that don't retransmit sps/pps like fmpeg omx -.- */
        /*
        if (this.lastSPS) {
            socket.send(Buffer.concat([ NALseparator, this.lastSPS ]), { binary: true })
        }
        if (this.lastPPS) {
            socket.send(Buffer.concat([ NALseparator, this.lastPPS ]), { binary: true })
        }
        */
    }

}