const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const { spawn } = require('child_process');

ffmpeg.setFfmpegPath(ffmpegPath);

class VideoFrame {
  constructor(data, init) {
    if (!Buffer.isBuffer(data)) {
      throw new TypeError('data must be a Buffer');
    }
    if (!init || typeof init.timestamp !== 'number') {
      throw new TypeError('timestamp is required');
    }
    if (!init.codedWidth || !init.codedHeight) {
      throw new TypeError('codedWidth and codedHeight are required');
    }
    
    this.data = data;
    this.timestamp = init.timestamp;
    this.duration = init.duration || 0;
    this.codedWidth = init.codedWidth;
    this.codedHeight = init.codedHeight;
    this.format = init.format || 'I420';
    this.colorSpace = init.colorSpace || 'bt709';
  }

  close() {
    this.data = null;
  }
}

class EncodedVideoChunk {
  constructor(init) {
    if (!init || !init.type || !init.data) {
      throw new TypeError('type and data are required');
    }
    this.type = init.type; // 'key' or 'delta'
    this.timestamp = init.timestamp || 0;
    this.duration = init.duration || 0;
    this.data = init.data;
    this.byteLength = init.data.length;
  }
}

class VideoEncoder {
  constructor(init) {
    if (!init || typeof init.output !== 'function') {
      throw new TypeError('output callback is required');
    }
    this.outputCallback = init.output;
    this.errorCallback = init.error || ((e) => { throw e; });
    this.state = 'unconfigured';
    this.encodeQueue = [];
    this.config = null;
    this.process = null;
    this.frameCount = 0;
  }

  configure(config) {
    if (!config || !config.codec) {
      throw new TypeError('codec is required');
    }
    if (!config.width || !config.height) {
      throw new TypeError('width and height are required');
    }
    if (config.bitrate && config.bitrate <= 0) {
      throw new TypeError('bitrate must be positive');
    }

    const validCodecs = ['vp8', 'vp09', 'vp9', 'avc1', 'h264', 'av01'];
    if (!validCodecs.includes(config.codec)) {
      throw new TypeError(`Unsupported codec: ${config.codec}`);
    }

    this.config = config;
    this.state = 'configured';
    this.frameCount = 0;
  }

  encode(frame, options = {}) {
    if (this.state !== 'configured') {
      throw new Error('Encoder not configured');
    }

    const codecMap = {
      'vp8': 'libvpx',
      'vp09': 'libvpx-vp9',
      'vp9': 'libvpx-vp9',
      'avc1': 'libx264',
      'av01': 'libaom-av1',
      'h264': 'libx264'
    };

    const codec = codecMap[this.config.codec] || this.config.codec;
    const keyframeInterval = this.config.keyframeInterval || 30;

    const args = [
      '-f', 'rawvideo',
      '-pix_fmt', 'yuv420p',
      '-s', `${this.config.width}x${this.config.height}`,
      '-r', '30',
      '-i', 'pipe:0',
      '-c:v', codec,
      '-b:v', (this.config.bitrate || 1000000).toString(),
      '-g', keyframeInterval.toString(),
      '-flush_packets', '1',
      '-f', 'matroska',
      'pipe:1'
    ];

    if (!this.process) {
      this.process = spawn(ffmpegPath, args);
      
      let chunks = [];
      this.process.stdout.on('data', (data) => {
        chunks.push(data);
      });

      this.process.stdout.on('end', () => {
        if (chunks.length > 0) {
          const isKeyframe = this.frameCount % keyframeInterval === 0;
          const chunk = new EncodedVideoChunk({
            type: isKeyframe ? 'key' : 'delta',
            timestamp: frame.timestamp,
            duration: frame.duration,
            data: Buffer.concat(chunks)
          });
          try {
            this.outputCallback(chunk);
          } catch (e) {
            this.errorCallback(e);
          }
        }
      });

      this.process.stderr.on('data', (data) => {
        const msg = data.toString();
        if (msg.includes('Error') || msg.includes('error')) {
          this.errorCallback(new Error(`FFmpeg: ${msg}`));
        }
      });

      this.process.on('error', (err) => {
        this.errorCallback(err);
      });
    }

    try {
      this.process.stdin.write(frame.data);
      this.frameCount++;
    } catch (e) {
      this.errorCallback(e);
    }
  }

  async flush() {
    return new Promise((resolve, reject) => {
      if (!this.process) {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Flush timeout'));
      }, 10000);

      this.process.stdin.end();
      this.process.on('close', () => {
        clearTimeout(timeout);
        resolve();
      });
    });
  }

  async close() {
    try {
      await this.flush();
      if (this.process) {
        this.process.kill();
        this.process = null;
      }
      this.state = 'closed';
    } catch (e) {
      this.errorCallback(e);
      throw e;
    }
  }
}

class VideoDecoder {
  constructor(init) {
    if (!init || typeof init.output !== 'function') {
      throw new TypeError('output callback is required');
    }
    this.outputCallback = init.output;
    this.errorCallback = init.error || ((e) => { throw e; });
    this.state = 'unconfigured';
    this.config = null;
    this.process = null;
  }

  configure(config) {
    if (!config || !config.codec) {
      throw new TypeError('codec is required');
    }
    if (!config.codedWidth || !config.codedHeight) {
      throw new TypeError('codedWidth and codedHeight are required');
    }

    this.config = config;
    this.state = 'configured';
  }

  decode(chunk) {
    if (this.state !== 'configured') {
      throw new Error('Decoder not configured');
    }

    const args = [
      '-i', 'pipe:0',
      '-f', 'rawvideo',
      '-pix_fmt', 'yuv420p',
      'pipe:1'
    ];

    if (!this.process) {
      this.process = spawn(ffmpegPath, args);

      this.process.stdout.on('data', (data) => {
        try {
          const frame = new VideoFrame(data, {
            timestamp: chunk.timestamp,
            duration: chunk.duration,
            codedWidth: this.config.codedWidth,
            codedHeight: this.config.codedHeight
          });
          this.outputCallback(frame);
        } catch (e) {
          this.errorCallback(e);
        }
      });

      this.process.stderr.on('data', (data) => {
        const msg = data.toString();
        if (msg.includes('Error') || msg.includes('error')) {
          this.errorCallback(new Error(`FFmpeg: ${msg}`));
        }
      });

      this.process.on('error', (err) => {
        this.errorCallback(err);
      });
    }

    try {
      this.process.stdin.write(chunk.data);
    } catch (e) {
      this.errorCallback(e);
    }
  }

  async flush() {
    return new Promise((resolve, reject) => {
      if (!this.process) {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Flush timeout'));
      }, 10000);

      this.process.stdin.end();
      this.process.on('close', () => {
        clearTimeout(timeout);
        resolve();
      });
    });
  }

  async close() {
    try {
      await this.flush();
      if (this.process) {
        this.process.kill();
        this.process = null;
      }
      this.state = 'closed';
    } catch (e) {
      this.errorCallback(e);
      throw e;
    }
  }
}

module.exports = {
  VideoFrame,
  EncodedVideoChunk,
  VideoEncoder,
  VideoDecoder
};
