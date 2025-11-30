const { VideoEncoder, VideoFrame } = require('./index');
const fs = require('fs');

async function demo() {
  console.log('WebCodecs Node.js Demo - Encoding frames to VP8');

  const outputChunks = [];
  
  const encoder = new VideoEncoder({
    output: (chunk) => {
      console.log(`Encoded chunk: ${chunk.type}, timestamp: ${chunk.timestamp}µs, size: ${chunk.data.length} bytes`);
      outputChunks.push(chunk.data);
    },
    error: (e) => {
      console.error('Encoder error:', e);
    }
  });

  encoder.configure({
    codec: 'vp8',
    width: 640,
    height: 480,
    bitrate: 1_000_000
  });

  // Generate simple test frames (black frames in YUV420 format)
  const frameSize = 640 * 480 * 3 / 2; // YUV420 size
  const numFrames = 10;

  for (let i = 0; i < numFrames; i++) {
    const frameData = Buffer.alloc(frameSize);
    
    // Fill with gradient pattern
    for (let y = 0; y < 480; y++) {
      for (let x = 0; x < 640; x++) {
        frameData[y * 640 + x] = (x + i * 10) % 256;
      }
    }

    const frame = new VideoFrame(frameData, {
      timestamp: i * 33333, // ~30fps in microseconds
      duration: 33333,
      codedWidth: 640,
      codedHeight: 480
    });

    encoder.encode(frame, { keyFrame: i === 0 });
    frame.close();
  }

  await encoder.close();

  // Save output
  const output = Buffer.concat(outputChunks);
  fs.writeFileSync('output.webm', output);
  console.log(`\nEncoded ${numFrames} frames to output.webm (${output.length} bytes)`);
}

demo().catch(console.error);
