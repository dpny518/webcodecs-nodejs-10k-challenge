### Instructions for Implementing the WebCodecs Node.js 10k Challenge

Hey dev, this is a high-impact project with a $10k prize pool for advancing server-side video processing in Node.js. The goal is to create a functional implementation of the [WebCodecs API](https://w3c.github.io/webcodecs/) (low-level audio/video encoding/decoding) that works natively in Node.js environments. This enables browser-like video editing workflows (e.g., frame-by-frame manipulation, real-time encoding) on servers without relying on browser runtimes.

You don't need a 100% complete solution—**partial progress with real demos (e.g., encoding/decoding a video file) is eligible**. Focus on core classes like `VideoEncoder`, `VideoDecoder`, `AudioEncoder`, `AudioDecoder`, `VideoFrame`, and `AudioData`. The deadline is December 31, 2025 (PST), so aim for a MVP by mid-December.

#### 1. What to Study (Core Resources)
Start with these to build foundational knowledge. Allocate 1-2 days per section.

| Topic | Why It's Important | Key Resources | Estimated Time |
|-------|--------------------|---------------|----------------|
| **WebCodecs API Spec** | Understand the exact interface you need to implement (e.g., `configure()`, `encode()`, `decode()`, error handling, chunk types). | - [Official W3C Spec](https://w3c.github.io/webcodecs/)<br>- [MDN Docs](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API)<br>- [Sample Code](https://github.com/w3c/webcodecs-samples) (adapt browser examples to Node) | 4-6 hours |
| **Node.js Internals & Bindings** | Learn how to expose C/C++ libs (like FFmpeg) to JS via Node.js for performance. | - [Node.js N-API Docs](https://nodejs.org/api/n-api.html) (for native addons)<br>- [node-ffi-napi](https://github.com/node-ffi/node-ffi) (for dynamic FFI if avoiding full C++ builds)<br>- [Node.js Streams](https://nodejs.org/api/stream.html) (for handling `EncodedChunk` as streams) | 6-8 hours |
| **FFmpeg Integration** | FFmpeg is the go-to for codec handling; you'll wrap it to mimic WebCodecs. | - [FFmpeg Docs](https://ffmpeg.org/documentation.html) (focus on libavcodec, libavformat)<br>- [node-fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) (JS wrapper to prototype)<br>- [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) (WASM port for inspiration, but aim for native speed) | 8-10 hours |
| **Provided Polyfills for Inspiration** | These show WebCodecs-like APIs in non-native envs; adapt their logic (e.g., chunk construction) to Node. | - [libavjs-webcodecs-polyfill](https://github.com/ennuicastr/libavjs-webcodecs-polyfill): Browser polyfill using libav.js (WASM FFmpeg). Key: Implements encoders/decoders via FFmpeg; supports VP8/AV1/Opus. **Adaptation Tip**: Extract the JS abstraction layer (e.g., `VideoEncoder` class) and replace WASM/canvas calls with Node's fs/buffer APIs. Not Node-ready, but great for API mocking.<br>- **Deno WebGPU Video Rendering Engine**: Based on your description ("A cross-platform video rendering engine with WebGPU backend running in deno using WebCodecs polyfills"), this likely refers to a Deno-based project like [Deno's experimental WebCodecs + WebGPU support](https://github.com/denoland/deno/issues/16803) or a custom engine (e.g., inspired by [Remotion](https://github.com/remotion-dev/remotion) but Deno-ported). Study Deno's [WebCodecs polyfill experiments](https://deno.land/manual@v1.40.5/runtime/web_platform_apis#webcodecs) for server-side rendering patterns. **Adaptation Tip**: Port Deno's runtime hooks to Node; use WebGPU via [node-webgpu](https://github.com/greggman/webgpu) if hardware accel is a stretch goal. | 10-12 hours |
| **Server-Side Video Workflows** | Get context on real use cases (e.g., transcoding, editing). | - Challenge README: [vjeux/webcodecs-nodejs-10k-challenge](https://github.com/vjeux/webcodecs-nodejs-10k-challenge)<br>- [Browser-to-Server Video Editing](https://remotion.dev/docs/webcodecs) (Remotion examples) | 2-4 hours |

**Pro Tip**: Run browser WebCodecs demos in Chrome/Edge, then trace calls with DevTools to map to FFmpeg equivalents.

#### 2. What to Do: Step-by-Step Implementation Plan
Build iteratively: Prototype in pure JS first, then add native bindings for speed. Target a demo that encodes/decodes a sample MP4 to VP8 in <10s.

1. **Setup Project (1 day)**:
   - Fork/clone the challenge repo: `git clone https://github.com/vjeux/webcodecs-nodejs-10k-challenge.git`.
   - Init a new Node module: `npm init -y; npm i ffmpeg-static @types/node`.
   - Create `index.js` with basic structure:
     ```js
     const { VideoEncoder, VideoDecoder } = require('./webcodecs-polyfill'); // Your impl
     async function demo() {
       // Load sample video via fs
       const input = await loadVideo('input.mp4');
       const encoder = new VideoEncoder({ output: chunk => console.log('Encoded:', chunk), error: e => console.error(e) });
       encoder.configure({ codec: 'vp8', width: 640, height: 480, bitrate: 1e6 });
       // Encode frames...
       await encoder.close();
     }
     ```
   - Test env: Node 20+; use `jest` for unit tests.

2. **Implement Core API (3-5 days)**:
   - **Mimic Spec Classes**: Start with `VideoEncoder`/`VideoDecoder`.
     - Use fluent-ffmpeg for quick prototype: Pipe buffers as `VideoFrame` (Node Buffer -> FFmpeg input).
     - Example stub for `VideoEncoder.encode(frame)`:
       ```js
       class VideoEncoder {
         constructor(config) { /* ... */ }
         async configure(options) { /* Map to FFmpeg cmd: e.g., -c:v libvpx-vp9 */ }
         encode(frame) { /* Convert Buffer to FFmpeg frame, encode, emit EncodedVideoChunk */ }
         close() { /* Flush & cleanup */ }
       }
       ```
     - Handle `VideoFrame`: Wrap Node `Buffer` with metadata (timestamp, duration, codedWidth/Height).
   - **Polyfill Inspiration**:
     - From libavjs-polyfill: Copy the `EncodedVideoChunk` constructor and codec config logic (e.g., `LibAVJSCodec` for custom FFmpeg params).
     - For Deno/WebGPU: If it's a rendering engine, integrate GPU accel via node-webgpu for `VideoFrame` processing (e.g., resize/filter frames on GPU before encoding).
   - **Edge Cases**: Support keyframes (`keyFrame: true`), timestamps, error callbacks. Test with AV1/VP9 for modern codecs.

3. **Add Real-World Demo (2-3 days)**:
   - Port a browser example: E.g., decode H.264 input, apply filter (e.g., grayscale via FFmpeg), re-encode to WebM.
   - Benchmark: Time encode/decode vs. native FFmpeg CLI.
   - Stretch: Add audio support (`AudioEncoder`); stream via Node HTTP server.

4. **Native Optimization (if time; 3-5 days)**:
   - Build N-API addon: Wrap libavcodec C API.
     - Use [node-gyp](https://github.com/nodejs/node-gyp) to compile.
     - Expose functions like `avcodec_encode_video2`.
   - Alternative: Use [sharp](https://github.com/lovell/sharp) for image frames if video is frame-based.

5. **Test & Polish (1-2 days)**:
   - Unit tests: Mock FFmpeg, assert chunk types/timestamps.
   - Integration: Run on sample files (download from challenge repo).
   - Docs: README with `npm install; node demo.js`.

#### 3. Submission & Winning Tips
- **Submit**: Open a GitHub issue on the challenge repo with:
  - Repo link (public GitHub).
  - Approach summary (e.g., "FFmpeg-wrapped encoders with N-API").
  - Setup/run instructions.
  - Demo video/GIF.
  - Team/prize split.
- **To Maximize Prize Chance**:
  - Show impact: Integrate with a tool like FFmpeg CLI or a simple editor (e.g., port [Kap](https://github.com/wulkano/Kap) logic).
  - Performance: Aim for 2x faster than pure JS.
  - Open-source everything; engage community via PRs/discussions.
  - If stuck: Post progress issues for feedback.

Track time in a doc; ping me weekly. This could land you $10k *and* resume gold. Let's crush it! 🚀
