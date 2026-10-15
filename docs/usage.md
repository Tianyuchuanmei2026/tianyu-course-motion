# 运行与导出

## 预览

安装 Node.js 22.12 或更新版本，在仓库根目录运行：

```bash
npm run serve
```

打开 `http://127.0.0.1:4173/`。本地服务器只监听本机；它只提供预览所需的页面、脚本与示例资源，不向外暴露整个工作目录。单纯预览不需要 npm install、API key、数据库或在线生成服务。

播放按钮第一次点击时载入两条已有音轨。拖动进度条可以随时回看。切到其他标签页时播放器会暂停。课程字幕为中文；系统字体决定最终字形，跨系统可能存在细微差别。

## 制作自己的内容

通用运行代码在 `src/runtime.js` 与 `src/player.js`。场景、讲稿、时间轴与音频放在自己的独立目录，通过配置接入。示例只演示第一讲的实现，并非所有课程都能仅替换文本。

- 场景：SVG 图层和具体教学画面。
- 时间轴：总时长、各场起止时间、字幕与动作 cue。
- 音频：自己有权使用的完整配音与效果音，按真实时长安排。
- 专用效果：随时间改变地图、参数或其它教学状态的回调。

示例保留 `window.renderAt(seconds)` 与 `window.__duration`，供开发者定位和逐帧导出。播放器用 Web Audio 的时间作为播放时钟，避免画面和声音分别计时造成累计偏差。

工具代码允许按 MIT 使用和修改。研究完示例后，请编写自己的讲稿、画面与素材；具体示例课程的许可见 `examples/lesson-01/LICENSE.txt`。

## 可选导出

需要另行准备 Chrome 或 Chromium、FFmpeg，并安装开发依赖：

```bash
npm ci
npm run export -- --help
npm run export -- --browser /path/to/chrome --ffmpeg /path/to/ffmpeg
```

路径是占位示例，替换成本机实际可执行文件路径。Windows 可使用带引号的完整 `.exe` 路径。默认输出到 `outputs/`；该目录被 Git 忽略。导出参数以 `--help` 实际列出的选项为准。

帧渲染使用本机浏览器，视频编码使用本机 FFmpeg；导出不会调用视频生成模型。分辨率、时长、帧率、画面复杂度会共同影响耗时和临时磁盘使用量。

## 已验证的范围

首版在 macOS + Chrome 上完成以下检查：

- 8场资源与114条字幕、音轨加载。
- 24次前进与回跳状态一致性。
- 真实点击播放、暂停和跳转后的音画时钟。
- 本地静态服务器的资源访问和音频范围请求。
- 0.2秒短段导出：1080×1920、H.264/AAC、30fps。

本次工程提取没有重新导出完整236秒MP4，也没有完成Windows/Linux实机验证。以上技术检查不代表任何新制作内容已完成教学或审美验收。

测试命令：

```bash
npm test
BROWSER_PATH=/path/to/chrome npm run test:browser
```

第二条为 macOS/Linux 的环境变量语法；Windows 请先用当前终端设置 `BROWSER_PATH`，再运行 `npm run test:browser`。
