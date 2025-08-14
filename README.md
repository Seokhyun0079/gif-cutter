# GIF Frame Viewer

## 🇯🇵 日本語

### 概要

GIF ファイルのフレームを個別に表示し、特定のフレームを画像として抽出できる Web アプリケーションです。

### 主な機能

- **GIF フレーム表示**: 各フレームを正確に表示（黒い部分の問題を解決）
- **フィルムストリップ UI**: 映画のようなフィルムスクロール効果
- **フレーム抽出**: 任意のフレームを PNG 画像としてダウンロード
- **自動再生**: GIF の元のタイミングで自動再生
- **フレームナビゲーション**: 前後フレームへの移動、スライダー操作

### 技術的特徴

- **フレーム累積処理**: GIF の圧縮方式に対応した正確なフレーム合成
- **透明度処理**: disposalType と transparentIndex の適切な処理
- **リアルタイムプレビュー**: 各フレームの即座な表示

---

## 🇺🇸 English

### Overview

A web application that displays individual frames of GIF files and allows extraction of specific frames as images.

### Key Features

- **GIF Frame Display**: Accurate frame rendering (solves black area issues)
- **Film Strip UI**: Cinematic film scroll effect
- **Frame Extraction**: Download any frame as PNG image
- **Auto Play**: Automatic playback with original GIF timing
- **Frame Navigation**: Previous/next frame navigation, slider control

### Technical Features

- **Frame Accumulation Processing**: Accurate frame composition for GIF compression
- **Transparency Handling**: Proper disposalType and transparentIndex processing
- **Real-time Preview**: Instant display of each frame

---

## 🇰🇷 한국어

### 개요

GIF 파일의 프레임을 개별적으로 표시하고, 특정 프레임을 이미지로 추출할 수 있는 웹 애플리케이션입니다.

### 주요 기능

- **GIF 프레임 표시**: 각 프레임을 정확하게 표시 (검은색 부분 문제 해결)
- **필름 스트립 UI**: 영화 같은 필름 스크롤 효과
- **프레임 추출**: 원하는 프레임을 PNG 이미지로 다운로드
- **자동 재생**: GIF의 원본 타이밍으로 자동 재생
- **프레임 네비게이션**: 이전/다음 프레임 이동, 슬라이더 조작

### 기술적 특징

- **프레임 누적 처리**: GIF 압축 방식에 대응한 정확한 프레임 합성
- **투명도 처리**: disposalType과 transparentIndex의 적절한 처리
- **실시간 프리뷰**: 각 프레임의 즉시 표시

---

## 🌐 데모 페이지

### Live Demo

**🔗 [GIF Cutter 데모 페이지](https://seokhyun0079.github.io/gif-cutter/)**

실제로 GIF 파일을 업로드하고 프레임을 확인해보세요!

### 데모 페이지 특징

- **즉시 사용 가능**: 별도 설치 없이 웹 브라우저에서 바로 사용
- **실시간 테스트**: 다양한 GIF 파일로 기능 테스트
- **모바일 지원**: 모바일 기기에서도 최적화된 사용자 경험
- **무료 사용**: 완전히 무료로 모든 기능 이용 가능

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/gif-cutter.git
cd gif-cutter

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🛠️ Technologies Used

- **Frontend**: React 19, TypeScript
- **GIF Processing**: gifuct-js
- **Build Tool**: Vite
- **Styling**: CSS3 with custom animations

---

## 🌐 Demo Page

### Live Demo

**🔗 [GIF Cutter Demo Page](https://seokhyun0079.github.io/gif-cutter/)**

Try uploading GIF files and exploring frames right now!

### Demo Page Features

- **Ready to Use**: No installation required, use directly in your web browser
- **Real-time Testing**: Test functionality with various GIF files
- **Mobile Optimized**: Optimized user experience on mobile devices
- **Completely Free**: All features available at no cost

---

## 📱 Features in Detail

---

## 🌐 デモページ

### ライブデモ

**🔗 [GIF Cutter デモページ](https://seokhyun0079.github.io/gif-cutter/)**

実際に GIF ファイルをアップロードしてフレームを確認してみてください！

### デモページの特徴

- **すぐに使用可能**: インストール不要でウェブブラウザからすぐに使用
- **リアルタイムテスト**: 様々な GIF ファイルで機能をテスト
- **モバイル対応**: モバイルデバイスでも最適化されたユーザー体験
- **完全無料**: すべての機能を無料で利用可能

---

### Film Strip UI

- **Horizontal Scrolling**: Smooth left-to-right film scroll animation
- **Frame Thumbnails**: Miniature preview of each frame
- **Interactive Navigation**: Click any frame to jump directly
- **Active Frame Highlight**: Current frame highlighted with orange border

### Frame Processing

- **Accumulative Rendering**: Each frame builds upon previous frames
- **Disposal Type Support**: Handles GIF disposal methods correctly
- **Transparency Support**: Proper alpha channel processing
- **Color Preservation**: Maintains original GIF colors accurately

---

## 🎯 Use Cases

- **Content Creation**: Extract specific moments from GIFs
- **Animation Analysis**: Study frame-by-frame animation
- **Educational**: Learn about GIF structure and compression
- **Debugging**: Troubleshoot GIF rendering issues

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [gifuct-js](https://github.com/matt-way/gifuct-js) for GIF parsing and decompression
- [React](https://reactjs.org/) for the UI framework
- [Vite](https://vitejs.dev/) for the build tool

---

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub.

**Happy GIF editing! 🎬✨**
