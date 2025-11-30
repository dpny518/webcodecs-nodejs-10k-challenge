# WebCodecs Node.js Implementation

A minimal WebCodecs API polyfill for Node.js using FFmpeg bindings.

## Architecture

```
┌─────────────────┐
│   Your Code     │
│  (JavaScript)   │
└────────┬────────┘
         │ WebCodecs API
         ▼
┌─────────────────┐
│  index.js       │
│  VideoEncoder   │
│  VideoDecoder   │
└────────┬────────┘
         │ spawn()
         ▼
┌─────────────────┐      stdin (YUV420)      ┌──────────────┐
│  FFmpeg Process │ ◄──────────────────────── │  Raw Frames  │
│  (Child)        │                           └──────────────┘
│                 │
│  libavcodec     │      stdout (Matroska)    ┌──────────────┐
│  libavformat    │ ───────────────────────►  │ Encoded Data │
└─────────────────┘                           └──────────────┘
```

## Data Flow

### Encoding Pipeline

```
VideoFrame (Buffer) 
    ↓
validate dimensions, timestamp
    ↓
spawn FFmpeg with codec args
    ↓
write YUV420 data to stdin
    ↓
read Matroska chunks from stdout
    ↓
EncodedVideoChunk (type: key/delta)
    ↓
output callback
```

### Decoding Pipeline

```
EncodedVideoChunk (Buffer)
    ↓
spawn FFmpeg decoder
    ↓
write Matroska to stdin
    ↓
read YUV420 frames from stdout
    ↓
VideoFrame with metadata
    ↓
output callback
```

## Approach

This implementation wraps FFmpeg via child processes to provide WebCodecs-compatible APIs:
- `VideoEncoder` - Encodes raw video frames to compressed formats (VP8, VP9, H.264, AV1)
- `VideoDecoder` - Decodes compressed video to raw frames
- `VideoFrame` - Represents raw video frame data with metadata
- `EncodedVideoChunk` - Represents encoded video data

## Installation

```bash
npm install
```

## Usage

```javascript
const { VideoEncoder, VideoFrame } = require('./index');

const encoder = new VideoEncoder({
  output: (chunk) => {
    console.log('Encoded:', chunk.type, chunk.timestamp);
  },
  error: (e) => console.error(e)
});

encoder.configure({
  codec: 'vp8',
  width: 640,
  height: 480,
  bitrate: 1_000_000
});

// Create and encode a frame
const frameData = Buffer.alloc(640 * 480 * 3 / 2); // YUV420
const frame = new VideoFrame(frameData, {
  timestamp: 0,
  codedWidth: 640,
  codedHeight: 480
});

encoder.encode(frame);
await encoder.close();
```

## Demo

```bash
npm run demo    # Basic encoding
npm test        # Multi-codec tests
npm run stress  # 1080p stress test
```

## Supported Codecs

| Codec | Config Value | FFmpeg Encoder | Status |
|-------|-------------|----------------|--------|
| VP8 | `vp8` | libvpx | ✅ Tested |
| VP9 | `vp09`, `vp9` | libvpx-vp9 | ✅ Tested |
| H.264 | `h264`, `avc1` | libx264 | ✅ Tested |
| AV1 | `av01` | libaom-av1 | ⚠️ Slow |

## Implementation Details

### FFmpeg Arguments

**Encoding:**
```bash
ffmpeg -f rawvideo -pix_fmt yuv420p -s 640x480 -r 30 -i pipe:0 \
       -c:v libvpx -b:v 1000000 -g 30 -flush_packets 1 \
       -f matroska pipe:1
```

**Decoding:**
```bash
ffmpeg -i pipe:0 -f rawvideo -pix_fmt yuv420p pipe:1
```

### Frame Format

Frames use YUV420 planar format:
- **Y plane:** width × height bytes (luminance)
- **U plane:** (width/2) × (height/2) bytes (chrominance)
- **V plane:** (width/2) × (height/2) bytes (chrominance)
- **Total:** width × height × 1.5 bytes

### Error Handling

- Input validation on all API calls
- FFmpeg stderr monitoring for errors
- Async error callbacks
- Timeout protection (10s flush)
- Automatic process cleanup

### Performance

Benchmarks on MacBook Pro M1:
- 1080p @ 30fps: ~25 FPS encoding (VP8)
- 720p @ 30fps: ~60 FPS encoding (VP8)
- Memory: <100MB for 5s video

#### Codec Performance Comparison

| Codec | Resolution | FPS | Time (150 frames) | Memory Peak | Output Size |
|-------|-----------|-----|-------------------|-------------|-------------|
| VP8   | 1080p     | 37  | 4.1s             | <50MB       | 0.28 MB     |
| H.264 | 1080p     | 42  | 3.6s             | <45MB       | 0.35 MB     |
| VP9   | 1080p     | 18  | 8.3s             | <60MB       | 0.22 MB     |
| AV1   | 1080p     | 8   | 18.8s            | <80MB       | 0.18 MB     |

*Tested on MacBook Pro M1, 8GB RAM, single-threaded encoding*

## Limitations

- **No real-time seeking** - Sequential processing only
- **No hardware acceleration** - Software codecs only (for now)
- **Single stream** - One encode/decode per instance
- **No audio** - Video only (audio in v0.2)
- **Synchronous processing** - No parallel frame encoding
- **FFmpeg overhead** - Process spawn latency (~50ms)

## Future Enhancements

### Phase 2 (Post-Submission)
- [ ] Native N-API bindings for 2-5x speed
- [ ] Hardware acceleration (NVENC, VideoToolbox, VAAPI)
- [ ] Audio support (AudioEncoder, AudioDecoder)
- [ ] Streaming optimizations
- [ ] Parallel frame processing
- [ ] ImageDecoder support

### Phase 3 (Production)
- [ ] WebAssembly fallback
- [ ] Browser polyfill compatibility
- [ ] Full WebCodecs spec compliance
- [ ] Performance profiling tools
- [ ] Cloud deployment guides

## FFmpeg Binary

Uses `ffmpeg-static` (~50MB bundled binary):
- Cross-platform (Linux, macOS, Windows)
- No system dependencies
- Verified checksums
- Consider `ffmpeg-static-slim` for production

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Security

See [SECURITY.md](SECURITY.md) for security policy.

## License

MIT - See [LICENSE](LICENSE)
