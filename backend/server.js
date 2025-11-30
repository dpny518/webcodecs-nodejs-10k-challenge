const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { VideoEncoder, VideoDecoder, VideoFrame, EncodedVideoChunk } = require('./index');
const { spawn } = require('child_process');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Encode endpoint - process video with FFmpeg
app.post('/encode', upload.single('video'), async (req, res) => {
  try {
    const { codec = 'vp8', bitrate = '1000000', start, end } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    // Save uploaded file temporarily
    const tempInput = path.join('/tmp', `input_${Date.now()}.mp4`);
    const tempOutput = path.join('/tmp', `output_${Date.now()}.${codec === 'h264' ? 'mp4' : 'webm'}`);
    
    fs.writeFileSync(tempInput, req.file.buffer);

    // Map codec names
    const codecMap = {
      'vp8': 'libvpx',
      'vp9': 'libvpx-vp9',
      'h264': 'libx264',
      'av01': 'libaom-av1'
    };

    const ffmpegCodec = codecMap[codec] || 'libvpx';
    const format = codec === 'h264' ? 'mp4' : 'webm';

    // Build FFmpeg command
    const args = ['-i', tempInput];

    // Add trim if specified
    if (start !== undefined && end !== undefined) {
      args.push('-ss', start, '-to', end);
    }

    args.push(
      '-c:v', ffmpegCodec,
      '-b:v', bitrate
    );

    // Handle audio codec based on container format
    if (format === 'webm') {
      // WebM requires Opus or Vorbis audio
      args.push('-c:a', 'libopus');
    } else {
      // MP4 can use AAC
      args.push('-c:a', 'aac');
    }

    args.push('-f', format, tempOutput);

    // Run FFmpeg
    const ffmpeg = spawn(ffmpegPath, args);

    let stderr = '';
    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ffmpeg.on('close', (code) => {
      // Clean up input
      fs.unlinkSync(tempInput);

      if (code !== 0) {
        console.error('FFmpeg error:', stderr);
        return res.status(500).json({ error: 'Encoding failed', details: stderr });
      }

      // Send output file
      const outputBuffer = fs.readFileSync(tempOutput);
      fs.unlinkSync(tempOutput);

      res.set('Content-Type', codec === 'h264' ? 'video/mp4' : 'video/webm');
      res.send(outputBuffer);
    });

    ffmpeg.on('error', (err) => {
      console.error('FFmpeg spawn error:', err);
      if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
      if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
      res.status(500).json({ error: 'Failed to start encoding' });
    });

  } catch (e) {
    console.error('Encode error:', e);
    res.status(500).json({ error: e.message });
  }
});

// Decode endpoint - accepts video, returns frame count
app.post('/decode', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const tempInput = path.join('/tmp', `decode_${Date.now()}.mp4`);
    fs.writeFileSync(tempInput, req.file.buffer);

    // Use FFprobe to count frames
    const ffprobe = spawn(ffmpegPath.replace('ffmpeg', 'ffprobe'), [
      '-v', 'error',
      '-select_streams', 'v:0',
      '-count_packets',
      '-show_entries', 'stream=nb_read_packets',
      '-of', 'csv=p=0',
      tempInput
    ]);

    let stdout = '';
    ffprobe.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    ffprobe.on('close', (code) => {
      fs.unlinkSync(tempInput);
      
      if (code !== 0) {
        return res.status(500).json({ error: 'Failed to decode video' });
      }

      const frames = parseInt(stdout.trim()) || 0;
      res.json({ frames });
    });

  } catch (e) {
    console.error('Decode error:', e);
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
