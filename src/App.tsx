import React, { useState, useRef, useEffect } from "react";
import { parseGIF, decompressFrames } from "gifuct-js";
import "./App.css";

interface Frame {
  imageData: ImageData;
  delay: number;
  disposalType: number;
}

function App() {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [totalFrames, setTotalFrames] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const gif = parseGIF(arrayBuffer);
      const decompressedFrames = decompressFrames(gif, true);

      const frameData: Frame[] = decompressedFrames.map((frame) => {
        // Create ImageData
        console.log(frame.pixels.length);
        console.log(frame.dims.width);
        console.log(frame.dims.height);
        console.log(frame.patch.length);
        const { width, height } = frame.dims;
        const { pixels, colorTable } = frame;
        const rgba = new Uint8ClampedArray(width * height * 4);
        for (let i = 0; i < pixels.length; i++) {
          const colorIdx = pixels[i];
          const [r, g, b] = colorTable[colorIdx];
          rgba[i * 4 + 0] = r;
          rgba[i * 4 + 1] = g;
          rgba[i * 4 + 2] = b;
          rgba[i * 4 + 3] = 255; // 기본적으로 불투명
        }
        const imageData = new ImageData(frame.patch, width, height);

        return {
          imageData,
          delay: frame.delay,
          disposalType: frame.disposalType,
        };
      });

      setFrames(frameData);
      setTotalFrames(frameData.length);
      setCurrentFrame(0);
      setIsPlaying(false);

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
    canvas.width = frame.imageData.width;
    canvas.height = frame.imageData.height;

    // Draw frame
    ctx.putImageData(frame.imageData, 0, 0);
  };

  const handleFrameChange = (frameIndex: number) => {
    if (frameIndex >= 0 && frameIndex < frames.length) {
      setCurrentFrame(frameIndex);
      displayFrame(frames[frameIndex]);
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

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || frames.length === 0) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => {
        const nextFrame = (prev + 1) % frames.length;
        displayFrame(frames[nextFrame]);
        return nextFrame;
      });
    }, frames[currentFrame]?.delay || 100);

    return () => clearInterval(interval);
  }, [isPlaying, frames, currentFrame]);

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
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
