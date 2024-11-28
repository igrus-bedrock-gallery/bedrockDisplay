"use client";

import { useEffect, useState, useCallback } from "react";
import { ImageData, FrameData } from "@/types/frames";
import PollerComponent from "../_components/PollerComponent";
import { useDataHandler } from "@/hooks/useDataHandler";
import { usePolling } from "@/hooks/usePolling";

export default function MiddleScreen() {
  const [pendingImages, setPendingImages] = useState(0);

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

  const [frames, setFrames] = useState<FrameData[]>([
    // {
    //   key: 1,
    //   Image: "/images/mock1.png",
    //   Description:
    //     "당신은 미래 소방관으로 선발되어 화재 현장에서 빛나는 활약을 펼쳤으며, 뛰어난 공로로 세계적인 소방 안전상까지 수상했습니다. ",
    //   timestamp: Date.now() + Math.random(),
    // },
    // {
    //   key: 2,
    //   Image: "/images/mock2.png",
    //   Description:
    //     "당신은 미래 소방관으로 선발되어 화재 현장에서 빛나는 활약을 펼쳤으며, 뛰어난 공로로 세계적인 소방 안전상까지 수상했습니다. ",
    //   timestamp: Date.now() + Math.random(),
    // },
    // {
    //   key: 3,
    //   Image: "/images/mock3.png",
    //   Description:
    //     "당신은 미래 소방관으로 선발되어 화재 현장에서 빛나는 활약을 펼쳤으며, 뛰어난 공로로 세계적인 소방 안전상까지 수상했습니다. ",
    //   timestamp: Date.now() + Math.random(),
    // },
    // {
    //   key: 4,
    //   Image: "/images/mock4.png",
    //   Description:
    //     "당신은 미래 소방관으로 선발되어 화재 현장에서 빛나는 활약을 펼쳤으며, 뛰어난 공로로 세계적인 소방 안전상까지 수상했습니다. ",
    //   timestamp: Date.now() + Math.random(),
    // },
  ]);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/get-data');
      const data = await response.json();
      console.log(data);
      setFrames(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  // const updateFramesMiddle = useCallback(
  //   (frameKey: number, data: ImageData) => {
  //     console.log("updateFrames called with:", { frameKey, data });

  //     setFrames((prev) => {
  //       console.log("Previous frames state:", prev);
  //       const updatedFrames = prev.map((frame) =>
  //         frame.key === frameKey
  //           ? {
  //               ...frame,
  //               Image: data.Image,
  //               Description: data.Description,
  //               timestamp: Date.now() + Math.random(),
  //             }
  //           : frame
  //       );
  //       console.log("Updated frames state:", updatedFrames);
  //       return updatedFrames;
  //     });
  //   },
  //   []
  // );
  // useDataHandler(pendingImages, updateFramesMiddle, () => {});

  // useDataHandler(pendingImages, updateFrames); //pendingImages가 바뀔 때마다 실행될 것임

  // useEffect(() => {
  //   console.log("Frames updated - Rendering check:");
  //   frames.forEach((frame, index) => {
  //     console.log(`Frame ${index}:`, frame);
  //   });
  // }, [frames]);

  // useEffect(() => {
  //   console.log("pendingImages updated in middle-page:", pendingImages);
  // }, [pendingImages]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  usePolling(fetchData, 30000);

  return (
    <main
      className="relative flex items-center justify-center h-screen bg-contain bg-center"
      style={{
        backgroundImage: "url('/images/background.png')",
        backgroundSize: "calc(100% + 180px)", // 너비 2790 기준으로 배경 크기를 2970에 맞춤
      }}
    >
      {/* <PollerComponent setPendingImages={setPendingImages} /> */}

      <div
        className="relative grid grid-cols-4 items-center"
        style={{
          height: "100%",
          aspectRatio: "2790 / 1080", // 2790 x 1080 비율 고정

          // width: "100%", // 화면 크기에 비례
          paddingLeft: "5%",
        }}
      >
        {frames.map((frame, index) => (
          <div
            key={frame.timestamp}
            className="relative flex flex-col justify-center items-center"
            style={{
              height: "90%", // 동적으로 높이 조정
              width: "100%", // 비율 유지
            }}
          >
            {/* 프레임과 인물 이미지 영역 */}
            <div
              className="relative"
              style={{
                height: "70%", // 전체 높이의 3/4
                width: "100%", // 너비는 100%
              }}
            >
              {/* 프레임 이미지 */}
              <img
                key={index}
                src={gridImages[index]}
                alt={`Frame ${index}`}
                className="relative h-full object-contain z-30"
                style={{ width: "calc(100%*1.03)" }}
              />

              {/* 인물 이미지 */}
              <img
                src={frame.Image}
                alt={`Portrait ${index}`}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[52%] z-10"
                style={{
                  height: "70%",
                  aspectRatio: "360 / 490",
                  // height: "45vh",
                  // width: "15.2vw",
                  // width: "50%",
                  // width: "calc(100% * 1.03)", // 너비를 1.2배로 설정

                  clipPath: "ellipse(50% 50% at 50% 50%)", // 타원형 클리핑
                }}
              />
            </div>

            {/* 하단 설명 영역 */}
            <div
              className="relative flex items-center justify-center"
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
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] flex items-center justify-center text-white text-center"
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
        ))}
      </div>
    </main>
  );
}
