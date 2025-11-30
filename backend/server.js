const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { VideoEncoder, VideoDecoder, VideoFrame, EncodedVideoChunk } = require('../index');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Encode endpoint - accepts raw frames, returns encoded video
app.post('/encode', upload.single('frames'), async (req, res) => {
  try {
    const { width, height, codec } = req.body;
    const chunks = [];

    const encoder = new VideoEncoder({
      output: (chunk) => chunks.push(chunk.data),
      error: (e) => console.error(e)
    });

    encoder.configure({
      codec: codec || 'vp8',
      width: parseInt(width) || 640,
      height: parseInt(height) || 480,
      bitrate: 1_000_000
    });

    // Encode uploaded frame data
    const frameData = req.file.buffer;
    const frame = new VideoFrame(frameData, {
      timestamp: 0,
      codedWidth: parseInt(width) || 640,
      codedHeight: parseInt(height) || 480
    });

    encoder.encode(frame, { keyFrame: true });
    await encoder.close();

    const output = Buffer.concat(chunks);
    res.set('Content-Type', 'video/webm');
    res.send(output);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Decode endpoint - accepts video, returns frame count
app.post('/decode', upload.single('video'), async (req, res) => {
  try {
    let frameCount = 0;

    const decoder = new VideoDecoder({
      output: (frame) => {
        frameCount++;
        frame.close();
      },
      error: (e) => console.error(e)
    });

    decoder.configure({
      codec: 'vp8',
      codedWidth: 640,
      codedHeight: 480
    });

    const chunk = new EncodedVideoChunk({
      type: 'key',
      timestamp: 0,
      data: req.file.buffer
    });

    decoder.decode(chunk);
    await decoder.close();

    res.json({ frames: frameCount });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', webcodecs: 'ready' });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`WebCodecs backend running on port ${PORT}`);
});
