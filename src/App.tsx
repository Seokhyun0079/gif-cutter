import React, { useState, useRef, useEffect } from "react";
import { parseGIF, decompressFrames } from "gifuct-js";
import "./App.css";

interface Frame {
  imageData: ImageData;
  delay: number;
  disposalType: number;
  cumulativeImageData: ImageData; // 누적된 이미지 데이터
}

function App() {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [totalFrames, setTotalFrames] = useState(0);
  const [filmScrollPosition, setFilmScrollPosition] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const filmContainerRef = useRef<HTMLDivElement>(null);

  // 필름 스크롤 애니메이션
  useEffect(() => {
    if (!isPlaying || frames.length === 0) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => {
        const nextFrame = (prev + 1) % frames.length;
        displayFrame(frames[nextFrame]);

        // 필름 스크롤 위치 업데이트
        const scrollStep = 100; // 스크롤 스텝 크기
        setFilmScrollPosition((prevPos) => {
          const newPos = prevPos + scrollStep;
          return newPos >= 0 ? newPos : 0;
        });

        return nextFrame;
      });
    }, frames[currentFrame]?.delay || 100);

    return () => clearInterval(interval);
  }, [isPlaying, frames, currentFrame]);

  // 필름 스크롤 위치를 프레임 변경에 맞춰 조정
  useEffect(() => {
    if (frames.length > 0 && currentFrame > 0) {
      const scrollStep = 100;
      const newPosition = currentFrame * scrollStep;
      setFilmScrollPosition(newPosition);
    }
  }, [currentFrame, frames.length]);

  // 프레임 누적 처리 함수
  const processCumulativeFrames = (decompressedFrames: any[]) => {
    const { width, height } = decompressedFrames[0].dims;
    const frameData: Frame[] = [];

    console.log("Frame accumulation processing started:", {
      width,
      height,
      totalFrames: decompressedFrames.length,
    });

    // 첫 번째 프레임 처리
    const firstFrame = decompressedFrames[0];
    const firstImageData = createImageDataFromFrame(firstFrame, width, height);
    const firstCumulativeData = new ImageData(
      new Uint8ClampedArray(firstImageData.data),
      width,
      height
    );

    frameData.push({
      imageData: firstImageData,
      delay: firstFrame.delay,
      disposalType: firstFrame.disposalType,
      cumulativeImageData: firstCumulativeData,
    });

    console.log("First frame processing completed:", {
      disposalType: firstFrame.disposalType,
      delay: firstFrame.delay,
      hasTransparency: firstFrame.transparentIndex !== undefined,
    });

    // 나머지 프레임들을 누적 처리
    for (let i = 1; i < decompressedFrames.length; i++) {
      const frame = decompressedFrames[i];
      const currentImageData = createImageDataFromFrame(frame, width, height);

      // 이전 프레임의 누적 데이터를 복사
      const previousCumulative = new Uint8ClampedArray(
        frameData[i - 1].cumulativeImageData.data
      );

      // 현재 프레임을 이전 프레임 위에 합성
      const cumulativeData = new Uint8ClampedArray(previousCumulative);

      // disposalType에 따른 처리
      const prevDisposalType = frameData[i - 1].disposalType;
      if (prevDisposalType === 2) {
        // 이전 프레임 영역을 투명하게 만들기
        const prevFrame = decompressedFrames[i - 1];
        const {
          left: prevLeft,
          top: prevTop,
          width: prevWidth,
          height: prevHeight,
        } = prevFrame.dims;

        console.log(
          `Frame ${i}: disposalType 2 processing - making previous frame transparent`,
          {
            prevLeft,
            prevTop,
            prevWidth,
            prevHeight,
          }
        );

        for (let y = 0; y < prevHeight; y++) {
          for (let x = 0; x < prevWidth; x++) {
            const dstIdx = ((prevTop + y) * width + (prevLeft + x)) * 4;
            if (dstIdx < cumulativeData.length - 3) {
              cumulativeData[dstIdx + 3] = 0; // 알파값을 0으로 (투명)
            }
          }
        }
      } else if (prevDisposalType === 3) {
        // 이전 프레임을 배경색으로 복원 (GIF의 배경색 사용)
        const prevFrame = decompressedFrames[i - 1];
        const {
          left: prevLeft,
          top: prevTop,
          width: prevWidth,
          height: prevHeight,
        } = prevFrame.dims;

        // GIF의 배경색 (보통 첫 번째 프레임의 첫 번째 색상)
        const bgColor = frameData[0].imageData.data.slice(0, 3);

        console.log(
          `Frame ${i}: disposalType 3 processing - restoring with background color`,
          {
            prevLeft,
            prevTop,
            prevWidth,
            prevHeight,
            bgColor,
          }
        );

        for (let y = 0; y < prevHeight; y++) {
          for (let x = 0; x < prevWidth; x++) {
            const dstIdx = ((prevTop + y) * width + (prevLeft + x)) * 4;
            if (dstIdx < cumulativeData.length - 3) {
              cumulativeData[dstIdx] = bgColor[0]; // R
              cumulativeData[dstIdx + 1] = bgColor[1]; // G
              cumulativeData[dstIdx + 2] = bgColor[2]; // B
              cumulativeData[dstIdx + 3] = 255; // A (불투명)
            }
          }
        }
      }

      // 현재 프레임을 누적 데이터에 합성
      const { left, top } = frame.dims;
      let transparentPixels = 0;
      let opaquePixels = 0;

      for (let y = 0; y < frame.dims.height; y++) {
        for (let x = 0; x < frame.dims.width; x++) {
          const srcIdx = (y * frame.dims.width + x) * 4;
          const dstIdx = ((top + y) * width + (left + x)) * 4;

          // 투명하지 않은 픽셀만 복사 (알파값이 0보다 큰 경우)
          if (currentImageData.data[srcIdx + 3] > 0) {
            cumulativeData[dstIdx] = currentImageData.data[srcIdx]; // R
            cumulativeData[dstIdx + 1] = currentImageData.data[srcIdx + 1]; // G
            cumulativeData[dstIdx + 2] = currentImageData.data[srcIdx + 2]; // B
            cumulativeData[dstIdx + 3] = currentImageData.data[srcIdx + 3]; // A
            opaquePixels++;
          } else {
            transparentPixels++;
          }
        }
      }

      console.log(`Frame ${i} composition completed:`, {
        disposalType: frame.disposalType,
        delay: frame.delay,
        position: { left, top },
        size: { width: frame.dims.width, height: frame.dims.height },
        pixels: { opaque: opaquePixels, transparent: transparentPixels },
        hasTransparency: frame.transparentIndex !== undefined,
      });

      const cumulativeImageData = new ImageData(cumulativeData, width, height);

      frameData.push({
        imageData: currentImageData,
        delay: frame.delay,
        disposalType: frame.disposalType,
        cumulativeImageData,
      });
    }

    console.log("All frame processing completed:", frameData.length);
    return frameData;
  };

  // 프레임에서 ImageData 생성
  const createImageDataFromFrame = (
    frame: any,
    totalWidth: number,
    totalHeight: number
  ) => {
    const { width, height, left, top } = frame.dims;
    const { pixels, colorTable, transparentIndex } = frame;

    // 전체 크기의 ImageData 생성
    const rgba = new Uint8ClampedArray(totalWidth * totalHeight * 4);

    // 투명으로 초기화
    for (let i = 0; i < rgba.length; i += 4) {
      rgba[i] = 0; // R
      rgba[i + 1] = 0; // G
      rgba[i + 2] = 0; // B
      rgba[i + 3] = 0; // A (투명)
    }

    // 프레임 데이터 채우기
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixelIdx = y * width + x;
        const colorIdx = pixels[pixelIdx];

        if (colorIdx < colorTable.length) {
          const [r, g, b] = colorTable[colorIdx];
          const dstIdx = ((top + y) * totalWidth + (left + x)) * 4;

          // 투명 색상 처리
          const isTransparent =
            transparentIndex !== undefined && colorIdx === transparentIndex;

          rgba[dstIdx] = r; // R
          rgba[dstIdx + 1] = g; // G
          rgba[dstIdx + 2] = b; // B
          rgba[dstIdx + 3] = isTransparent ? 0 : 255; // A (투명 또는 불투명)
        }
      }
    }

    return new ImageData(rgba, totalWidth, totalHeight);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const gif = parseGIF(arrayBuffer);
      const decompressedFrames = decompressFrames(gif, true);

      // GIF 메타데이터 로깅
      console.log("GIF Metadata:", {
        width: decompressedFrames[0].dims.width,
        height: decompressedFrames[0].dims.height,
        totalFrames: decompressedFrames.length,
        firstFrame: decompressedFrames[0],
        hasTransparency: decompressedFrames.some(
          (f) => f.transparentIndex !== undefined
        ),
      });

      // 누적 프레임 처리
      const frameData = processCumulativeFrames(decompressedFrames);

      setFrames(frameData);
      setTotalFrames(frameData.length);
      setCurrentFrame(0);
      setIsPlaying(false);
      setFilmScrollPosition(0);

      // Display first frame
      if (frameData.length > 0) {
        displayFrame(frameData[0]);
      }
    } catch (error) {
      console.error("GIF parsing error:", error);
      alert("Error occurred while processing GIF file.");
    }
  };

  const displayFrame = (frame: Frame) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = frame.cumulativeImageData.width;
    canvas.height = frame.cumulativeImageData.height;

    // 누적된 이미지 데이터를 사용하여 프레임 표시
    ctx.putImageData(frame.cumulativeImageData, 0, 0);
  };

  // 프레임을 이미지로 다운로드
  const downloadFrame = (frame: Frame) => {
    const canvas = document.createElement("canvas");
    canvas.width = frame.cumulativeImageData.width;
    canvas.height = frame.cumulativeImageData.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.putImageData(frame.cumulativeImageData, 0, 0);

    // 이미지 다운로드
    const link = document.createElement("a");
    link.download = `frame_${currentFrame + 1}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleFrameChange = (frameIndex: number) => {
    if (frameIndex >= 0 && frameIndex < frames.length) {
      setCurrentFrame(frameIndex);
      displayFrame(frames[frameIndex]);

      // 필름 스크롤 위치 업데이트
      const scrollStep = 100;
      setFilmScrollPosition(frameIndex * scrollStep);
    }
  };

  const togglePlay = () => {
    if (frames.length === 0) return;

    setIsPlaying(!isPlaying);
  };

  const nextFrame = () => {
    if (currentFrame < frames.length - 1) {
      handleFrameChange(currentFrame + 1);
    }
  };

  const prevFrame = () => {
    if (currentFrame > 0) {
      handleFrameChange(currentFrame - 1);
    }
  };

  // 필름 스크롤을 클릭하여 특정 프레임으로 이동
  const handleFilmFrameClick = (frameIndex: number) => {
    handleFrameChange(frameIndex);
  };

  return (
    <div className="app">
      <h1>GIF Frame Viewer</h1>

      <div className="upload-section">
        <input
          ref={fileInputRef}
          type="file"
          accept=".gif"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="upload-btn"
        >
          Select GIF File
        </button>
      </div>

      {frames.length > 0 && (
        <>
          <div className="viewer-section">
            <div className="canvas-container">
              <canvas ref={canvasRef} className="frame-canvas" />
            </div>

            <div className="controls">
              <div className="frame-info">
                Frame: {currentFrame + 1} / {totalFrames}
              </div>

              <div className="control-buttons">
                <button onClick={prevFrame} disabled={currentFrame === 0}>
                  Previous
                </button>
                <button onClick={togglePlay}>
                  {isPlaying ? "Stop" : "Play"}
                </button>
                <button
                  onClick={nextFrame}
                  disabled={currentFrame === frames.length - 1}
                >
                  Next
                </button>
              </div>

              <div className="frame-slider">
                <input
                  type="range"
                  min="0"
                  max={frames.length - 1}
                  value={currentFrame}
                  onChange={(e) => handleFrameChange(parseInt(e.target.value))}
                  className="slider"
                />
              </div>

              <div className="download-section">
                <button
                  onClick={() => downloadFrame(frames[currentFrame])}
                  className="download-btn"
                >
                  Download Current Frame
                </button>
              </div>
            </div>
          </div>

          {/* 필름 스크롤 UI */}
          <div className="film-scroll-container">
            <div className="film-header">
              <h3>Film Strip</h3>
              <div className="film-info">
                {frames.length} frames • Click any frame to jump
              </div>
            </div>

            <div className="film-container" ref={filmContainerRef}>
              <div
                className="film-strip"
                style={{ transform: `translateX(-${filmScrollPosition}px)` }}
              >
                {frames.map((frame, index) => (
                  <div
                    key={index}
                    className={`film-frame ${
                      index === currentFrame ? "active" : ""
                    }`}
                    onClick={() => handleFilmFrameClick(index)}
                  >
                    <canvas
                      width={frame.cumulativeImageData.width}
                      height={frame.cumulativeImageData.height}
                      className="film-frame-canvas"
                      ref={(canvas) => {
                        if (canvas) {
                          const ctx = canvas.getContext("2d");
                          if (ctx) {
                            ctx.putImageData(frame.cumulativeImageData, 0, 0);
                          }
                        }
                      }}
                    />
                    <div className="frame-number">{index + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
