# Contributing to WebCodecs Node.js

Thank you for your interest in contributing! This project aims to bring WebCodecs API to Node.js.

## Getting Started

```bash
git clone https://github.com/vjeux/webcodecs-nodejs-10k-challenge
cd webcodecs-nodejs-10k-challenge
npm install
npm test
```

## Development Workflow

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/my-feature`
3. **Make** your changes
4. **Test** your changes: `npm test && npm run stress`
5. **Lint** your code: `npm run lint`
6. **Commit** with clear messages
7. **Push** to your fork
8. **Submit** a pull request

## Code Style

- Use ES2022 features
- Follow existing code patterns
- Add JSDoc comments for public APIs
- Keep functions focused and small
- Run `npm run lint` before committing

## Testing

Add tests for new features:
- Unit tests in `test-codecs.js`
- Integration tests in `demo.js`
- Performance tests in `stress-test.js`

## Areas for Contribution

### High Priority
- [ ] Native N-API bindings for libavcodec
- [ ] Hardware acceleration support
- [ ] Audio encoding/decoding
- [ ] Better error messages
- [ ] Performance optimizations

### Medium Priority
- [ ] More codec support (HEVC, etc.)
- [ ] Streaming API improvements
- [ ] Better TypeScript definitions
- [ ] CI/CD pipeline
- [ ] More examples

### Low Priority
- [ ] Browser polyfill compatibility
- [ ] WebAssembly fallback
- [ ] GUI demo application

## Pull Request Guidelines

- Keep PRs focused on a single feature/fix
- Update documentation for API changes
- Add tests for new functionality
- Ensure all tests pass
- Update CHANGELOG.md

## Questions?

Open an issue with the `question` label or join discussions.

## License

By contributing, you agree to license your contributions under the MIT License.
