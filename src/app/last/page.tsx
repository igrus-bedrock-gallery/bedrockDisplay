"use client";

import { useEffect, useState, useContext, useCallback } from "react";
import { ImageData, FrameData } from "@/types/frames";
import { FrameContext } from "../../contexts/FrameContext";

export default function LastScreen() {
  const { frameQueue } = useContext(FrameContext)!;

  // 고정 frame
  const [gridImages] = useState<string[]>([
    "/images/frame1.png",
    "/images/frame2.png",
    "/images/frame3.png",
    "/images/frame4.png",
  ]);

  const [explainBox] = useState<string[]>([
    "/images/1st.png",
    "/images/2nd.png",
    "/images/3rd.png",
    "/images/4th.png",
  ]);

  // 프레임 데이터 상태 관리
  const [frames, setFrames] = useState<FrameData[]>([
    {
      key: 5,
      Image: "/images/mock1.png",
      Description:
        "당신은 미래 소방관으로 선발되어 화재 현장에서 빛나는 활약을 펼쳤으며, 뛰어난 공로로 세계적인 소방 안전상까지 수상했습니다. ",
      timestamp: Date.now() + Math.random(),
    },
    {
      key: 0,
      Image: "/images/mock1.png",
      Description:
        "당신은 미래 소방관으로 선발되어 화재 현장에서 빛나는 활약을 펼쳤으며, 뛰어난 공로로 세계적인 소방 안전상까지 수상했습니다. ",
      timestamp: Date.now() + Math.random(),
    },
    {
      key: 6,
      Image: "/images/mock3.png",
      Description:
        "당신은 미래 소방관으로 선발되어 화재 현장에서 빛나는 활약을 펼쳤으며, 뛰어난 공로로 세계적인 소방 안전상까지 수상했습니다. ",
      timestamp: Date.now() + Math.random(),
    },
    {
      key: 7,
      Image: "/images/mock4.png",
      Description:
        "당신은 미래 소방관으로 선발되어 화재 현장에서 빛나는 활약을 펼쳤으며, 뛰어난 공로로 세계적인 소방 안전상까지 수상했습니다. ",
      timestamp: Date.now() + Math.random(),
    },
  ]);

  const updateFramesLast = useCallback((frameKey: number, data: FrameData) => {
    console.log("updateFramesLast called with:", { frameKey, data });

    setFrames((prev) =>
      prev.map((frame) =>
        frame.key === frameKey
          ? {
              ...frame,
              Image: data.Image,
              Description: data.Description,
              timestamp: Date.now() + Math.random(), // 새 타임스탬프 추가
            }
          : frame
      )
    );
  }, []);

  // 프레임 큐에서 데이터 반영
  useEffect(() => {
    const newFrames = frameQueue.filter(
      (item) => item.frameKey >= 5 && item.frameKey <= 7
    );
    newFrames.forEach((frame) => {
      updateFramesLast(frame.frameKey, {
        key: frame.frameKey,
        Image: frame.data.Image,
        Description: frame.data.Description,
        timestamp: Date.now() + Math.random(),
      });
    });
  }, [frameQueue, updateFramesLast]);

  return (
    <main
      className="relative flex items-center justify-start h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: "url('/images/background.png')" }}
    >
      <div
        className="relative flex flex-row items-center "
        style={{
          height: "100%",
          aspectRatio: "2970 / 1080", // 2790 x 1080 비율 고정
          paddingRight: "6%",
          paddingLeft: "5%",
        }}
      >
        {frames.map((frame, index) =>
          frame.key === 0 ? (
            <div
              key={frame.timestamp}
              className="w-[40%]"
              style={{ visibility: "hidden" }}
            >
              {" "}
            </div>
          ) : (
            <div
              key={frame.timestamp}
              className="relative flex flex-col justify-center items-center"
              style={{
                height: "90%", // 동적으로 높이 조정
                width: "100%", // 비율 유지
              }}
            >
              {/* 프레임과 인물 이미지 영역 (3/4 높이) */}
              <div
                className="relative"
                style={{
                  height: "70%", // 전체 높이의 3/4
                  width: "100%", // 너비는 100%
                }}
              >
                {/* 프레임 이미지 */}
                <img
                  src={gridImages[index]}
                  alt={`Frame ${index}`}
                  className="relative w-full h-full object-contain z-30"
                  style={{
                    transform: frame.key === 5 ? "calc(100%*1.03)" : "none", // 키가 5일 때 너비를 1.2배로 확대
                  }}
                />

                {/* 인물 이미지 */}
                <img
                  src={frame.Image}
                  alt={`Portrait ${index}`}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[52%] z-10"
                  style={{
                    height: "70%",
                    aspectRatio: "360 / 490",
                    clipPath: "ellipse(50% 50% at 50% 50%)", // 타원형 클리핑
                  }}
                />
              </div>

              {/* 하단 설명 영역 */}
              <div
                className="relative flex items-center justify-center "
                style={{
                  height: "16%", // 전체 높이의 1/4
                  width: "auto",
                }}
              >
                {/* 설명 이미지 */}
                <img
                  src={explainBox[index]}
                  alt="Explain Box"
                  className="relative w-full h-full object-contain"
                />

                {/* 설명 텍스트 */}
                <div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] flex items-center justify-center text-white text-center "
                  style={{
                    textOverflow: "ellipsis", // 넘어가는 텍스트를 ...으로 표시
                    fontWeight: 300,
                    fontSize: "clamp(10px, 2vw, 20px)", // 반응형 폰트 크기
                  }}
                >
                  <p className="w-full break-keep leading-tight">
                    {frame.Description}
                  </p>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </main>
  );
}
