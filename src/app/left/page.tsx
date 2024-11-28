"use client";

import { useContext } from "react";
import { FrameContext } from "../../contexts/FrameContext";

export default function LeftScreen() {
  const { pendingImages, currentFrameNumber } = useContext(FrameContext)!;

  const explainBox = "/images/textbox2.png";

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
          style={{ marginTop: "2%", width: "83%" }}
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
              <p>{`${currentFrameNumber.current}번 액자로 가주세요`}</p>
              <p>{`대기번호 : ${pendingImages}번`}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
