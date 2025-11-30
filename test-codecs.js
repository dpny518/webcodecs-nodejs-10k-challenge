const { VideoEncoder, VideoFrame } = require('./index');
const fs = require('fs');

async function testCodec(codec, filename) {
  console.log(`Testing ${codec}...`);
  
  const chunks = [];
  let errorOccurred = false;

  const encoder = new VideoEncoder({
    output: (chunk) => chunks.push(chunk.data),
    error: (e) => {
      console.error(`  ⚠️  ${codec} error: ${e.message}`);
      errorOccurred = true;
    }
  });

  try {
    encoder.configure({
      codec,
      width: 320,
      height: 240,
      bitrate: 500_000
    });

    const frameSize = 320 * 240 * 3 / 2;
    for (let i = 0; i < 5; i++) {
      const data = Buffer.alloc(frameSize, i * 50);
      const frame = new VideoFrame(data, {
        timestamp: i * 33333,
        codedWidth: 320,
        codedHeight: 240
      });
      encoder.encode(frame, { keyFrame: i === 0 });
      frame.close();
    }

    await encoder.close();
    
    if (!errorOccurred && chunks.length > 0) {
      const output = Buffer.concat(chunks);
      fs.writeFileSync(filename, output);
      console.log(`  ✅ ${codec}: ${output.length} bytes → ${filename}`);
      return { codec, success: true, size: output.length };
    } else {
      console.log(`  ❌ ${codec}: Failed (no output)`);
      return { codec, success: false, size: 0 };
    }
  } catch (e) {
    console.log(`  ❌ ${codec}: ${e.message}`);
    return { codec, success: false, error: e.message };
  }
}

async function testEdgeCases() {
  console.log('\n🧪 Edge Case Tests\n');

  // Test 1: Invalid codec
  console.log('Test 1: Invalid codec');
  try {
    const encoder = new VideoEncoder({
      output: () => {},
      error: () => {}
    });
    encoder.configure({ codec: 'invalid', width: 320, height: 240 });
    console.log('  ❌ Should have thrown error');
  } catch (e) {
    console.log('  ✅ Correctly rejected invalid codec');
  }

  // Test 2: Missing required params
  console.log('\nTest 2: Missing width/height');
  try {
    const encoder = new VideoEncoder({
      output: () => {},
      error: () => {}
    });
    encoder.configure({ codec: 'vp8' });
    console.log('  ❌ Should have thrown error');
  } catch (e) {
    console.log('  ✅ Correctly rejected missing params');
  }

  // Test 3: High bitrate
  console.log('\nTest 3: High bitrate (10Mbps)');
  try {
    const encoder = new VideoEncoder({
      output: () => {},
      error: () => {}
    });
    encoder.configure({
      codec: 'vp8',
      width: 320,
      height: 240,
      bitrate: 10_000_000
    });
    console.log('  ✅ Accepted high bitrate');
  } catch (e) {
    console.log(`  ❌ Failed: ${e.message}`);
  }

  // Test 4: Zero duration frame
  console.log('\nTest 4: Zero duration frame');
  try {
    const frame = new VideoFrame(Buffer.alloc(320 * 240 * 3 / 2), {
      timestamp: 0,
      duration: 0,
      codedWidth: 320,
      codedHeight: 240
    });
    console.log('  ✅ Accepted zero duration');
    frame.close();
  } catch (e) {
    console.log(`  ❌ Failed: ${e.message}`);
  }
}

async function runTests() {
  console.log('🎬 WebCodecs Multi-Codec Test Suite\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const tests = [
    ['vp8', 'test-vp8.webm'],
    ['h264', 'test-h264.mkv'],
  ];

  const results = [];
  for (const [codec, file] of tests) {
    const result = await testCodec(codec, file);
    results.push(result);
  }

  await testEdgeCases();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Summary:\n');
  
  const successCount = results.filter(r => r.success).length;
  const totalSize = results.reduce((sum, r) => sum + (r.size || 0), 0);
  
  console.log(`   Success Rate: ${successCount}/${results.length} (${(successCount/results.length*100).toFixed(0)}%)`);
  console.log(`   Total Output: ${(totalSize / 1024).toFixed(2)} KB`);
  console.log('\n✅ All tests complete!');
}

runTests().catch(console.error);
