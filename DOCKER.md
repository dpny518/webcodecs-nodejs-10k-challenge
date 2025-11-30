# Docker Full-Stack Demo

Complete frontend + backend demo showing WebCodecs API in action.

## Architecture

```
┌─────────────┐      HTTP      ┌─────────────┐
│  Frontend   │ ──────────────> │   Backend   │
│  (Nginx)    │                 │  (Node.js)  │
│  Port 3000  │ <────────────── │  Port 3001  │
└─────────────┘                 └─────────────┘
      │                               │
      │                               │
   Browser UI                   WebCodecs API
   Tests                        (index.js)
```

## Quick Start

```bash
# Build and start services
docker-compose up --build

# Access UI
open http://localhost:3000
```

## What It Does

### Frontend (http://localhost:3000)
Interactive UI with 3 tabs:

**1. Basic Tests**
- Health check - Verify backend
- Encode test - Generate and encode frame
- Decode test - Decode video
- Full pipeline - Run all tests

**2. File Upload**
- 📁 Drag & drop video files (MP4, WebM, MKV)
- Encode uploaded files to VP8
- Decode and count frames
- Real file processing demo

**3. MDN Examples**
- WebCodecs API examples from [MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API)
- VideoEncoder usage patterns
- Complete encode/decode pipeline
- Same API as browser WebCodecs!

### Backend (http://localhost:3001)
- `/health` - Health check endpoint
- `/encode` - Accepts raw frames, returns encoded video
- `/decode` - Accepts video, returns frame count

## UI Tests

### Tab 1: Basic Tests
1. **Health Check** - Verifies backend is running
2. **Encode Test** - Generates frame, encodes to VP8
3. **Decode Test** - Decodes previously encoded video
4. **Full Pipeline** - Runs all tests in sequence

### Tab 2: File Upload
1. **Drag & Drop** - Drop video files directly
2. **File Selection** - Click to browse files
3. **Encode File** - Process uploaded video
4. **Decode File** - Extract frames from video

### Tab 3: MDN Examples
1. **VideoEncoder Example** - Based on MDN documentation
2. **Pipeline Example** - Complete encode/decode workflow
3. **API Compatibility** - Same API as browser WebCodecs

## Manual Testing

```bash
# Test backend directly
curl http://localhost:3001/health

# Encode a frame
curl -X POST http://localhost:3001/encode \
  -F "frames=@test-frame.yuv" \
  -F "width=320" \
  -F "height=240" \
  -F "codec=vp8" \
  --output encoded.webm

# Decode video
curl -X POST http://localhost:3001/decode \
  -F "video=@encoded.webm"
```

## Stop Services

```bash
docker-compose down
```

## Development

```bash
# Rebuild after code changes
docker-compose up --build

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Ports

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
