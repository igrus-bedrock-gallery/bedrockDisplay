"use client";

import React, { useContext, useEffect, useState } from "react";
import { FrameContext } from "../contexts/FrameContext";
import MiddleScreen from "./middle/page";
import LastScreen from "./last/page";

const Main = () => {
  // const { frameQueue, getNextKey } = useContext(FrameContext)!;
  // const [middleData, setMiddleData] = useState<any[]>([]);
  // const [lastData, setLastData] = useState<any[]>([]);

  // useEffect(() => {
  //   if (frameQueue.length > 0) {
  //     const nextItem = getNextKey();
  //     if (nextItem) {
  //       if (nextItem.frameKey >= 1 && nextItem.frameKey <= 4) {
  //         setMiddleData((prev) => [...prev, nextItem]);
  //       } else if (nextItem.frameKey >= 5 && nextItem.frameKey <= 7) {
  //         setLastData((prev) => [...prev, nextItem]);
  //       }
  //     }
  //   }
  // }, [frameQueue]);

  return (
    <div>
      <MiddleScreen />
      <LastScreen />
    </div>
  );
};

export default Main;
