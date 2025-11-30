# Security Policy

## Dependency Security

Last audit: **November 29, 2025**

```bash
npm audit
```

**Status:** No known vulnerabilities

### Dependencies
- `fluent-ffmpeg@2.1.3` - Deprecated but stable
- `ffmpeg-static@5.2.0` - Bundled FFmpeg binary (~50MB)
- `express@4.18.2` - Latest stable (backend only)
- `multer@1.4.5-lts.1` - Latest LTS (backend only)
- `cors@2.8.5` - Latest stable (backend only)

### FFmpeg Binary

This package bundles FFmpeg via `ffmpeg-static`. The binary is:
- Downloaded from official FFmpeg builds
- Verified checksums
- ~50MB size (consider `ffmpeg-static-slim` for production)

### Input Validation

All user inputs are validated:
- Frame dimensions checked
- Codec strings validated against whitelist
- Buffer types verified
- Bitrate bounds enforced

### Process Isolation

FFmpeg runs in isolated child processes:
- No shell injection (uses spawn with array args)
- Timeout protection (10s flush timeout)
- Automatic cleanup on close

## Reporting Vulnerabilities

Please report security issues to the repository maintainer via GitHub Issues with the `security` label.

## Best Practices

When using this library:
1. Validate all input buffers before encoding
2. Set reasonable bitrate limits
3. Implement rate limiting for API endpoints
4. Monitor memory usage in production
5. Keep dependencies updated: `npm update`

## Future Enhancements

- [ ] Add input sanitization for codec strings
- [ ] Implement resource limits (max frame size)
- [ ] Add rate limiting examples
- [ ] Sandboxed FFmpeg execution
