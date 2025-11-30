const { VideoEncoder, VideoFrame } = require('./index');
const fs = require('fs');

async function stressTest() {
  console.log('🔥 WebCodecs Stress Test - 1080p Video\n');
  
  const width = 1920;
  const height = 1080;
  const fps = 30;
  const duration = 5; // 5 seconds
  const totalFrames = fps * duration;
  
  console.log(`Config: ${width}x${height} @ ${fps}fps, ${totalFrames} frames`);
  console.log(`Expected size: ~${(width * height * 1.5 * totalFrames / 1024 / 1024).toFixed(1)}MB raw\n`);

  const startTime = Date.now();
  const startMem = process.memoryUsage().heapUsed;
  
  let encodedBytes = 0;
  let chunkCount = 0;

  const encoder = new VideoEncoder({
    output: (chunk) => {
      encodedBytes += chunk.data.length;
      chunkCount++;
      if (chunkCount % 30 === 0) {
        process.stdout.write(`\rEncoded ${chunkCount}/${totalFrames} frames...`);
      }
    },
    error: (e) => {
      console.error('\n❌ Error:', e.message);
      process.exit(1);
    }
  });

  encoder.configure({
    codec: 'vp8',
    width,
    height,
    bitrate: 2_000_000,
    keyframeInterval: 30
  });

  // Generate frames with gradient pattern
  const frameSize = width * height * 3 / 2; // YUV420
  
  for (let i = 0; i < totalFrames; i++) {
    const frameData = Buffer.alloc(frameSize);
    
    // Y plane - gradient
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        frameData[y * width + x] = ((x + i * 5) % 256);
      }
    }
    
    // U/V planes - gray
    frameData.fill(128, width * height);

    const frame = new VideoFrame(frameData, {
      timestamp: i * (1000000 / fps), // microseconds
      duration: 1000000 / fps,
      codedWidth: width,
      codedHeight: height
    });

    encoder.encode(frame, { keyFrame: i % 30 === 0 });
    frame.close();
  }

  await encoder.close();

  const endTime = Date.now();
  const endMem = process.memoryUsage().heapUsed;
  const elapsed = (endTime - startTime) / 1000;
  const memDelta = (endMem - startMem) / 1024 / 1024;

  console.log('\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Results:');
  console.log(`   Frames:     ${totalFrames}`);
  console.log(`   Chunks:     ${chunkCount}`);
  console.log(`   Output:     ${(encodedBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Time:       ${elapsed.toFixed(2)}s`);
  console.log(`   FPS:        ${(totalFrames / elapsed).toFixed(1)}`);
  console.log(`   Throughput: ${(encodedBytes / elapsed / 1024 / 1024).toFixed(2)} MB/s`);
  console.log(`   Memory Δ:   ${memDelta.toFixed(2)} MB`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Performance assertions
  if (elapsed > 60) {
    console.log('⚠️  Warning: Encoding took >60s');
  }
  if (memDelta > 500) {
    console.log('⚠️  Warning: High memory usage (possible leak)');
  }
  
  console.log('\n✅ Stress test complete!');
}

stressTest().catch((e) => {
  console.error('❌ Test failed:', e);
  process.exit(1);
});
