# Quick Start Guide

## Installation
```bash
npm install
```

## Run Examples

### Encode frames to video
```bash
npm run demo
```
Output: `output.webm` (8KB VP8 video)

### Decode video to frames
```bash
node example-decode.js
```

## API Overview

### VideoEncoder

```javascript
const { VideoEncoder, VideoFrame } = require('./index');

const encoder = new VideoEncoder({
  output: (chunk) => { 
    console.log(`${chunk.type} frame: ${chunk.byteLength} bytes`);
  },
  error: (e) => { 
    console.error('Encoding error:', e.message);
  }
});

encoder.configure({
  codec: 'vp8',      // 'vp8', 'vp09', 'h264', 'av01'
  width: 640,
  height: 480,
  bitrate: 1_000_000,
  keyframeInterval: 30  // Keyframe every 30 frames
});

const frame = new VideoFrame(buffer, {
  timestamp: 0,
  codedWidth: 640,
  codedHeight: 480
});

encoder.encode(frame, { keyFrame: true });

// Flush remaining frames
await encoder.flush();

// Close and cleanup
await encoder.close();
```

### Error Handling

```javascript
const encoder = new VideoEncoder({
  output: (chunk) => {
    // Handle encoded data
  },
  error: (e) => {
    // Handle errors asynchronously
    console.error('Error:', e.message);
    // Cleanup or retry logic
  }
});

try {
  encoder.configure({ codec: 'invalid' });
} catch (e) {
  // Handle synchronous validation errors
  console.error('Config error:', e.message);
}
```

### Complete Encode/Decode Pipeline

```javascript
const { VideoEncoder, VideoDecoder, VideoFrame, EncodedVideoChunk } = require('./index');

// Encode
const encodedChunks = [];
const encoder = new VideoEncoder({
  output: (chunk) => encodedChunks.push(chunk),
  error: (e) => console.error(e)
});

encoder.configure({
  codec: 'vp8',
  width: 640,
  height: 480,
  bitrate: 1_000_000
});

// Encode 10 frames
for (let i = 0; i < 10; i++) {
  const data = Buffer.alloc(640 * 480 * 3 / 2);
  const frame = new VideoFrame(data, {
    timestamp: i * 33333,
    codedWidth: 640,
    codedHeight: 480
  });
  encoder.encode(frame, { keyFrame: i === 0 });
  frame.close();
}

await encoder.close();

// Decode
const decoder = new VideoDecoder({
  output: (frame) => {
    console.log(`Decoded frame: ${frame.codedWidth}x${frame.codedHeight}`);
    frame.close();
  },
  error: (e) => console.error(e)
});

decoder.configure({
  codec: 'vp8',
  codedWidth: 640,
  codedHeight: 480
});

for (const chunk of encodedChunks) {
  decoder.decode(chunk);
}

await decoder.close();
```

### VideoDecoder
```javascript
const { VideoDecoder, EncodedVideoChunk } = require('./index');

const decoder = new VideoDecoder({
  output: (frame) => { /* handle decoded frame */ },
  error: (e) => { /* handle errors */ }
});

decoder.configure({
  codec: 'vp8',
  codedWidth: 640,
  codedHeight: 480
});

const chunk = new EncodedVideoChunk({
  type: 'key',
  timestamp: 0,
  data: encodedBuffer
});

decoder.decode(chunk);
await decoder.close();
```

## Frame Format

Frames use YUV420 planar format:
- Y plane: width × height bytes
- U plane: (width/2) × (height/2) bytes  
- V plane: (width/2) × (height/2) bytes
- Total: width × height × 1.5 bytes

## Supported Codecs

| Codec | Config Value | FFmpeg Encoder |
|-------|-------------|----------------|
| VP8 | `'vp8'` | libvpx |
| VP9 | `'vp09'` | libvpx-vp9 |
| H.264 | `'h264'` or `'avc1'` | libx264 |
| AV1 | `'av01'` | libaom-av1 |

## File Structure

```
.
├── index.js           # Core WebCodecs implementation
├── demo.js            # Encoding example
├── example-decode.js  # Decoding example
├── package.json       # Dependencies
├── IMPLEMENTATION.md  # Technical details
└── SUBMISSION.md      # Challenge submission info
```
