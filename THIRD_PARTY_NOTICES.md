# Third-party notices

- Preview uses browser-native SVG, Web Audio and JavaScript. No third-party JavaScript runtime or font file is bundled for playback.
- Optional browser verification and frame export use `puppeteer-core`; its own Apache-2.0 license and dependency notices apply. Dependencies are installed by npm and are not committed in this repository.
- Export uses a user-installed Chrome/Chromium browser and FFmpeg executable. Their respective licenses apply; these programs are not bundled.
- The lesson's prerecorded narration uses the Microsoft `zh-CN-XiaoxiaoNeural` voice. This repository includes only the rendered example audio under the lesson-content terms, not a speech model, service account, voice-cloning asset, or permission to access any third-party TTS service. The publisher does not claim ownership of the voice identity.
- The example's sound effects come from the course's existing locally synthesized effect track. They are lesson assets, not a separately licensed sound library.
- System fonts are selected by CSS. Appearance may vary by operating system. No Apple or other commercial font file is redistributed.

The earlier course implementation used GSAP for a back-out easing curve. This extraction uses the polynomial directly and does not bundle GSAP. See `src/runtime.js` for the implementation.
