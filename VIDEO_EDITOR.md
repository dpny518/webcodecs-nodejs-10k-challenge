# Video Editor Features

Advanced video editing capabilities powered by WebCodecs API on Node.js.

## 🎬 Features

### 1. Video Preview
- **Video Playback** - Full HTML5 video player with controls
- **Thumbnail Generation** - 8 thumbnails extracted from video
- **Scrubbing** - Click thumbnails to jump to specific times
- **Canvas Preview** - Frame-by-frame rendering

### 2. Trim & Cut ✂️
- **Visual Timeline** - Interactive timeline with markers
- **Start/End Selection** - Drag sliders to select trim points
- **Time Display** - Real-time duration updates
- **Frame-Accurate** - Precise cutting at any point

### 3. Export Options 💾
**Codec Selection:**
- VP8 (WebM)
- VP9 (WebM)
- H.264 (MP4)
- AV1 (WebM)

**Quality Presets:**
- Low: 500 Kbps
- Medium: 1 Mbps
- High: 2 Mbps
- Very High: 5 Mbps

**Resolution Options:**
- Original
- 1080p (1920×1080)
- 720p (1280×720)
- 480p (854×480)
- 360p (640×360)

**Frame Rate:**
- Original
- 60 fps
- 30 fps
- 24 fps

### 4. Media Information ℹ️
Displays comprehensive video metadata:
- Filename
- File size
- MIME type
- Duration
- Resolution (width × height)
- Aspect ratio

### 5. File Upload 📁
- **Drag & Drop** - Drop video files directly
- **Click to Browse** - Traditional file picker
- **Format Support** - MP4, WebM, MKV
- **Instant Analysis** - Automatic metadata extraction

## 🎯 Based on MDN WebCodecs API

All features follow the official [MDN WebCodecs API](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API) specification:

### Core Interfaces Used:
- `VideoEncoder` - Encoding video frames
- `VideoDecoder` - Decoding video chunks
- `VideoFrame` - Raw frame representation
- `EncodedVideoChunk` - Encoded data chunks
- `VideoColorSpace` - Color space handling

### Processing Model:
- Asynchronous queue-based processing
- `configure()` - Setup encoder/decoder
- `encode()`/`decode()` - Process frames
- `flush()` - Complete pending work
- `close()` - Cleanup resources

## 🚀 Usage

### Start the Editor:
```bash
docker-compose up --build
open http://localhost:3000
```

### Workflow:
1. **Upload** - Drop or select a video file
2. **Preview** - Generate thumbnails, play video
3. **Trim** - Select start/end points
4. **Export** - Choose codec, quality, resolution
5. **Info** - View detailed media information

## 📊 Technical Details

### Thumbnail Generation
- Extracts 8 evenly-spaced frames
- 160×90 resolution thumbnails
- Canvas-based rendering
- Click to seek to timestamp

### Timeline Control
- Visual markers for start/end points
- Range sliders for precise selection
- Real-time duration calculation
- Percentage-based positioning

### Export Pipeline
```
Video File → Decode → Process → Encode → Export
           ↓         ↓         ↓         ↓
      VideoDecoder  Trim/Cut  VideoEncoder  Download
```

## 🎨 UI Components

### Tab Navigation:
1. **📁 Upload** - File selection and upload
2. **🎬 Preview** - Video playback and thumbnails
3. **✂️ Trim & Cut** - Timeline editing
4. **💾 Export** - Output configuration
5. **ℹ️ Media Info** - Video metadata
6. **🧪 Basic Tests** - API testing

### Responsive Design:
- Grid-based thumbnail layout
- Flexible video player
- Mobile-friendly controls
- Adaptive timeline

## 🔧 Backend Integration

### API Endpoints:
- `POST /encode` - Encode video frames
- `POST /decode` - Decode video chunks
- `GET /health` - Health check

### Data Flow:
```
Frontend (Browser)
    ↓ HTTP
Backend (Node.js)
    ↓ WebCodecs API
FFmpeg (Codec)
    ↓ Encoded Data
Frontend (Download)
```

## 📚 Future Enhancements

### Phase 1 (Current):
- ✅ Video preview
- ✅ Thumbnail generation
- ✅ Trim & cut UI
- ✅ Export options
- ✅ Media info

### Phase 2 (Planned):
- [ ] Real-time preview during trim
- [ ] Multiple video tracks
- [ ] Audio track editing
- [ ] Filters & effects
- [ ] Transitions
- [ ] Text overlays

### Phase 3 (Advanced):
- [ ] Timeline zoom
- [ ] Keyframe editing
- [ ] Color grading
- [ ] Audio mixing
- [ ] Batch processing
- [ ] Cloud export

## 🎓 Learning Resources

- [MDN WebCodecs API](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API)
- [WebCodecs Samples](https://w3c.github.io/webcodecs/samples/)
- [Video Processing with WebCodecs](https://developer.chrome.com/docs/web-platform/best-practices/webcodecs)

## 📝 Notes

- All processing happens on the Node.js backend
- Frontend provides UI and preview
- Same WebCodecs API as browser
- Production-ready performance
- Extensible architecture

---

**Status:** Feature Complete  
**Date:** November 29, 2025  
**Version:** 0.2.0
