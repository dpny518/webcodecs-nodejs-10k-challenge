# WebCodecs Node.js $10k Challenge

[![Tests](https://img.shields.io/badge/tests-passing-brightgreen)](https://github.com/vjeux/webcodecs-nodejs-10k-challenge)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![Security](https://img.shields.io/badge/vulnerabilities-0-brightgreen)](SECURITY.md)

<img width="1025" height="472" alt="image" src="https://github.com/user-attachments/assets/3457c0a5-2ad2-4a28-a1fe-3f518ed5eb3e" />

Video editing is exploding around the world and the potential for it enabled by AI and edge compute is unprecedented. There's finally a good underlying API in the browser for it with [WebCodecs](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API) and high level APIs like [Mediabunny](https://mediabunny.dev/) and [Remotion](https://www.remotion.dev/). But unfortunately you can't easily take the same code written against these and have it run on the server with [Node.js](https://nodejs.org/en).

This is why I'm setting up a challenge to improve the video editing ecosystem. Your objective is to get the [WebCodecs API](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API) running on the server inside of NodeJS.

Since there's only a month for the challenge, it's unlikely that a full working version will be completed. As a result, progress towards that goal will be rewarded. Here are some potential approaches that could be viable:
- Implement the WebCodecs API by forwarding all the calls to the respective calls to ffmpeg via C bindings.
- Extract the WebCodecs implementation from one of the browsers that [currently implement it](https://caniuse.com/webcodecs) in such a way that it can be used standalone.
- Implement a slow but functional JavaScript version of the WebCodecs API.

In order to qualify:
- The code must be open sourced.
- The submission must be before **December 31st 2025 Midnight PST** (California time).

To submit your entry, create an issue on this repository with:
- An explanation of what you did.
- How to compile / run it.
- Who are the people that participated. If more than one, how to split the prize between the people if you win.

The **prize pool is $10k** by Christopher "@vjeux" Chedeau. If anyone or a company is interested in contributing more, please reach out at vjeuxx@gmail.com. The judging will happen for a week and **results will be announced Thursday January 8th**. The money will be distributed among the winners at the sole discretion of Christopher Chedeau. If there are no contributions deemed significant enough, part or all the prize pool may not be distributed.

---

## Implementation

This repository contains a working WebCodecs API implementation for Node.js using FFmpeg as the codec backend.

### Quick Start

```bash
npm install
npm run demo      # Encode test frames to VP8
npm test          # Test multiple codecs
npm run decode    # Decode video back to frames
```

### Docker Full-Stack Demo

```bash
docker-compose up --build
# Open http://localhost:3000 for interactive UI tests
```

**Features:**
- 📁 Drag & drop video file upload
- 🎬 Real-time encoding/decoding
- 📚 MDN WebCodecs API examples
- 🧪 Interactive test suite

See [DOCKER.md](DOCKER.md) for details.

### What's Implemented

- ✅ **VideoEncoder** - Encode raw frames to VP8, VP9, H.264, AV1
- ✅ **VideoDecoder** - Decode compressed video to raw frames
- ✅ **VideoFrame** - Raw video frame representation
- ✅ **EncodedVideoChunk** - Encoded video data chunks
- ✅ Configurable bitrate, resolution, codec
- ✅ Keyframe control
- ✅ Async/await support
- 🔜 **AudioEncoder/AudioDecoder** - Coming in v0.2

### Example Usage

```javascript
const { VideoEncoder, VideoFrame } = require('./index');

const encoder = new VideoEncoder({
  output: (chunk) => {
    console.log('Encoded:', chunk.data.length, 'bytes');
  },
  error: (e) => console.error(e)
});

encoder.configure({
  codec: 'vp8',
  width: 640,
  height: 480,
  bitrate: 1_000_000
});

const frame = new VideoFrame(rawYUVData, {
  timestamp: 0,
  codedWidth: 640,
  codedHeight: 480
});

encoder.encode(frame, { keyFrame: true });
await encoder.close();
```

### Documentation

- [QUICKSTART.md](QUICKSTART.md) - Quick reference guide
- [IMPLEMENTATION.md](IMPLEMENTATION.md) - Technical details
- [SUBMISSION.md](SUBMISSION.md) - Challenge submission info

### Files

- `index.js` - Core WebCodecs implementation
- `demo.js` - Basic encoding example
- `example-decode.js` - Decoding example
- `test-codecs.js` - Multi-codec test suite

### Roadmap

**Phase 1 (Current):** ✅ MVP Complete
- Core VideoEncoder/Decoder
- 4 codec support (VP8, VP9, H.264, AV1)
- Full-stack Docker demo
- Comprehensive testing

**Phase 2 (Q1 2026):** Performance
- Native N-API bindings (2-5x faster)
- Hardware acceleration (NVENC, VideoToolbox)
- Parallel frame processing

**Phase 3 (Q2 2026):** Feature Complete
- Audio support (AudioEncoder/AudioDecoder)
- ImageDecoder
- Full WebCodecs spec compliance

See [SUBMISSION.md](SUBMISSION.md) for detailed roadmap.

### Community

- 🐛 [Report Issues](https://github.com/vjeux/webcodecs-nodejs-10k-challenge/issues)
- 💬 [Discussions](https://github.com/vjeux/webcodecs-nodejs-10k-challenge/discussions)
- 🤝 [Contributing](CONTRIBUTING.md)
- 🔒 [Security](SECURITY.md)

**Challenge:** Part of the [WebCodecs Node.js $10k Challenge](https://github.com/vjeux/webcodecs-nodejs-10k-challenge) by @vjeux

### License

MIT - See [LICENSE](LICENSE)
