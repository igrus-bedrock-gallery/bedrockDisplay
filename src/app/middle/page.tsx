"use client";

import { useEffect, useState, useContext, useCallback } from "react";
import { FrameData, Frame } from "@/types/frames";
import { FrameContext } from "../../contexts/FrameContext";

export default function MiddleScreen() {
  const { frameQueue, removeFromQueue } = useContext(FrameContext)!;

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

  const makeUniqueID = () => {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  };

  const [frames, setFrames] = useState<FrameData[]>([
    {
      key: 1,
      Image: "/images/mock1.png",
      Description:
        "당신은 미래 소방관으로 선발되어 화재 현장에서 빛나는 활약을 펼쳤으며, 뛰어난 공로로 세계적인 소방 안전상까지 수상했습니다. 당신은 미래 소방관으로 선발되어 화재 현장에서 빛나는 활약을 펼쳤으며, 뛰어난 공로로 세계적인 소방 안전상까지 수상했습니다.당신은 미래 소방관으로 선발되어 화재 현장에서 빛나는 활약을 펼쳤으며, 뛰어난 공로로 세계적인 소방 안전상까지 수상했습니다. ",
      timestamp: makeUniqueID(),
    },
    {
      key: 2,
      Image: "/images/mock2.png",
      Description:
        "당신은 미래 경찰관으로 선발되어 범죄 예방과 시민 보호에 헌신하며, 뛰어난 직업 윤리와 리더십으로 여러 상을 수상했습니다. 당신의 노력은 지역 사회의 안전을 지키는 데 큰 기여를 하고 있습니다.",
      timestamp: makeUniqueID(),
    },
    {
      key: 3,
      Image: "/images/mock3.png",
      Description:
        "당신은 세계적인 사업가로 인정받아 혁신적인 아이디어와 도전 정신으로 다양한 산업 분야에서 성공을 이루었습니다. 당신의 기업은 수많은 일자리를 창출하며, 전 세계적으로 영향을 미치고 있습니다.",
      timestamp: makeUniqueID(),
    },
    {
      key: 4,
      Image: "/images/mock4.png",
      Description:
        "당신은 미래의 전기기사로 선발되어 첨단 기술을 활용해 전력 시스템의 효율성을 혁신적으로 개선하며, 지속 가능한 에너지 산업 발전에 기여하고 있습니다.",
      timestamp: makeUniqueID(),
    },
  ]);

  const updateFramesMiddle = useCallback(
    (frameKey: number, data: FrameData) => {
      setFrames((prev) =>
        prev.map((frame) =>
          frame.key === frameKey
            ? {
                ...frame,
                Image: data.Image,
                Description: data.Description,
                timestamp: `${Date.now()}-${data.key}-${Math.random()
                  .toString(36)
                  .slice(2, 11)}`,
              }
            : frame
        )
      );
    },
    []
  );

  useEffect(() => {
    if (frameQueue.length === 0) return;

    const processFrames = async () => {
      const initialKey = frameQueue[0].frameKey; // 첫 번째 처리할 frameKey 기억

      for (let i = 0; i < frameQueue.length; i++) {
        const frame = frameQueue[i];

        // `initialKey`가 반복될 때만 60초 대기
        if (frame.frameKey === initialKey && i !== 0) {
          console.log(`Waiting for 60 seconds at frameKey: ${frame.frameKey}`);
          await new Promise((resolve) => setTimeout(resolve, 60000));
        }

        // `frameKey`가 1~4번인 경우만 업데이트
        if (frame.frameKey >= 1 && frame.frameKey <= 4) {
          updateFramesMiddle(frame.frameKey, {
            key: frame.frameKey,
            Image: frame.data.Image,
            Description: frame.data.Description,
            timestamp: (frame.data as any).ReportId || makeUniqueID(), // ReportId를 단언
          });
        }
      }

      // 처리된 프레임만 서버에서 제거
      const relevantFrames = frameQueue.filter(
        (frame) => frame.frameKey >= 1 && frame.frameKey <= 4
      );
      removeFromQueue(relevantFrames.length);
    };

    processFrames();
  }, [frameQueue, updateFramesMiddle, removeFromQueue]);
  return (
    <main
      className="relative flex items-center justify-center h-screen bg-contain bg-center"
      style={{
        backgroundImage: "url('/images/background.png')",
        backgroundSize: "calc(100% + 180px)", // 너비 2790 기준으로 배경 크기를 2970에 맞춤
      }}
    >
      <div
        className="relative grid grid-cols-4 items-center"
        style={{
          height: "100%",
          aspectRatio: "2790 / 1080", // 2790 x 1080 비율 고정
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
                style={{
                  background:
                    frame.key === 1 ? "rgba(0, 0, 0, 0.2)" : "transparent",
                }}
              />

              {/* 설명 텍스트 */}
              <div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[85%] h-[88%] flex items-center justify-center text-white text-center"
                style={{
                  display: "flex", // Flexbox 활성화
                  flexDirection: "column", // 텍스트를 세로 정렬
                  justifyContent: "center", // 수직 중앙 정렬
                  alignItems: "center", // 수평 중앙 정렬
                  overflowWrap: "break-word",
                }}
              >
                <p
                  className="w-full break-keep leading-tight"
                  style={{
                    overflow: "hidden", // 텍스트가 컨테이너를 넘지 않도록 설정
                    textOverflow: "ellipsis", // 넘어가는 텍스트를 ...으로 표시
                    display: "-webkit-box", // 줄바꿈을 위한 플렉스박스 설정
                    WebkitBoxOrient: "vertical", // 플렉스박스 축을 수직으로 설정
                    WebkitLineClamp: 5,
                    fontWeight: 300,
                    fontSize: "clamp(10px, 2vw, 20px)", // 반응형 폰트 크기
                  }}
                >
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
