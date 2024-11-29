"use client";

import { useContext, useEffect, useRef } from "react";
import { FrameContext } from "../../contexts/FrameContext";

export default function LeftScreen() {
  // const { pendingImages, lastFrameNumber, activePage, updateServerState } =
  //   useContext(FrameContext)!;
  const { pendingImages, lastFrameNumber } = useContext(FrameContext)!;
  const nextFrameNumber = useRef<number>(0);

  // useEffect(() => {
  //   // 현재 페이지가 활성화된 경우 작업 수행
  //   if (activePage === "left") {
  //     const remainingImages = Math.min(3, pendingImages); // 최대 3개 처리
  //     const newLastFrameNumber = lastFrameNumber.current + remainingImages;
  //     const newPendingImages = pendingImages - remainingImages;

  //     // 작업 완료 후 상태 업데이트
  //     updateServerState({
  //       lastFrameNumber: newLastFrameNumber,
  //       pendingImages: newPendingImages,
  //       activePage: "middle", // 다음 작업으로 middle 설정
  //     });
  //   }
  // }, [activePage, pendingImages, lastFrameNumber.current, updateServerState]);

  const explainBox = "/images/textbox2.png";

  const frameStatus = lastFrameNumber + pendingImages;

  useEffect(() => {
    if (frameStatus == 7) {
      nextFrameNumber.current = 1;
    } else {
      nextFrameNumber.current = frameStatus + 1;
    }
  }, [pendingImages, lastFrameNumber]);

  return (
    <div
      className="flex w-full h-full text-white justify-center items-center"
      style={{
        width: "1920px",
        height: "1080px",
        background: "#152431",
      }}
    >
      <div className="flex flex-col justify-start items-center w-full h-full gap-20">
        <div
          className="justify-center"
          style={{ marginTop: "1%", width: "83%" }}
        >
          <img
            src="/images/architecture.png"
            alt="Architecture diagram"
            className="object-contain "
          />
        </div>
        <div className="relative flex items-center justify-center gap-8 mb-1 ">
          <div className=" relative">
            <img
              src={explainBox}
              alt="Explain Box"
              className="w-full h-full object-contain"
            />
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] flex flex-col items-center justify-center text-white text-center"
              style={{
                overflow: "hidden",
                fontWeight: 300,
                fontSize: "clamp(10px, 2vw, 20px)",
              }}
            >
              <p>{`${nextFrameNumber}번 액자로 가주세요`}</p>
              <p>{`대기번호 : ${pendingImages}번`}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
