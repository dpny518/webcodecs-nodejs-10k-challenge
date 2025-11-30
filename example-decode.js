const { VideoDecoder, EncodedVideoChunk } = require('./index');
const fs = require('fs');

async function decodeDemo() {
  console.log('WebCodecs Node.js Demo - Decoding VP8 video');

  if (!fs.existsSync('output.webm')) {
    console.error('Run demo.js first to create output.webm');
    process.exit(1);
  }

  let frameCount = 0;

  const decoder = new VideoDecoder({
    output: (frame) => {
      frameCount++;
      console.log(`Decoded frame ${frameCount}: ${frame.codedWidth}x${frame.codedHeight}, timestamp: ${frame.timestamp}µs`);
      frame.close();
    },
    error: (e) => {
      console.error('Decoder error:', e);
    }
  });

  decoder.configure({
    codec: 'vp8',
    codedWidth: 640,
    codedHeight: 480
  });

  const videoData = fs.readFileSync('output.webm');
  const chunk = new EncodedVideoChunk({
    type: 'key',
    timestamp: 0,
    data: videoData
  });

  decoder.decode(chunk);
  
  await decoder.close();
  console.log(`\nDecoded ${frameCount} frames total`);
}

decodeDemo().catch(console.error);
