# Test Data Sources

## Generated Test Data

All tests use procedurally generated video frames to ensure reproducibility without external dependencies.

### Frame Generation

**Format:** YUV420 planar
- Y plane: Gradient pattern `(x + frameIndex * 5) % 256`
- U/V planes: Constant gray (128)

**Resolutions:**
- Demo: 640x480 (10 frames)
- Codec tests: 320x240 (5 frames)
- Stress test: 1920x1080 (150 frames)

### Why Generated Data?

1. **Reproducibility** - Same output every run
2. **No external deps** - No need to download sample videos
3. **Controlled testing** - Known patterns for validation
4. **Size efficiency** - No large files in repo

## Optional: Real Video Testing

For testing with real video files, we recommend:

### Sample Videos

**Big Buck Bunny** (Open source, Creative Commons)
```bash
# 1080p, 60s clip
wget https://download.blender.org/demo/movies/BBB/bbb_sunflower_1080p_60fps_normal.mp4

# Use with decoder
node example-decode.js bbb_sunflower_1080p_60fps_normal.mp4
```

**Sintel** (Open source, Creative Commons)
```bash
# 720p trailer
wget https://download.blender.org/demo/movies/Sintel.2010.720p.mkv
```

### Test Video Characteristics

For comprehensive testing, use videos with:
- Multiple resolutions (480p, 720p, 1080p, 4K)
- Different codecs (H.264, VP8, VP9, AV1)
- Various frame rates (24, 30, 60 fps)
- Scene changes (for keyframe testing)
- Motion complexity (static vs. high motion)

## Benchmark Reproducibility

All benchmarks in this repo were run on:
- **Hardware:** MacBook Pro M1, 8GB RAM
- **OS:** macOS 14.x
- **Node.js:** v20.x
- **FFmpeg:** 6.0 (via ffmpeg-static)
- **Test date:** November 29, 2025

Results may vary on different hardware/OS configurations.

## Creating Custom Test Data

```javascript
// Generate custom YUV420 frame
function generateFrame(width, height, frameIndex) {
  const frameSize = width * height * 3 / 2;
  const buffer = Buffer.alloc(frameSize);
  
  // Y plane - custom pattern
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      buffer[y * width + x] = (x + frameIndex * 10) % 256;
    }
  }
  
  // U/V planes - gray
  buffer.fill(128, width * height);
  
  return buffer;
}
```

## License

All generated test data is public domain. External video sources (Big Buck Bunny, Sintel) are licensed under Creative Commons.
