"use client";

import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { FrameContext } from "../contexts/FrameContext";

const Main = () => {
  const { frameQueue, getNextKey, isLoading } = useContext(FrameContext)!;
  const [middleData, setMiddleData] = useState<any[]>([]);
  const [lastData, setLastData] = useState<any[]>([]);

  useEffect(() => {
    if (frameQueue.length > 0) {
      const nextItem = getNextKey();
      if (nextItem) {
        if (nextItem.frameKey >= 1 && nextItem.frameKey <= 4) {
          setMiddleData((prev) => [...prev, nextItem]);
        } else if (nextItem.frameKey >= 5 && nextItem.frameKey <= 7) {
          setLastData((prev) => [...prev, nextItem]);
        }
      }
    }
  }, [frameQueue]);

  return (
    <div>
      <pre>{JSON.stringify(middleData, null, 2)}</pre>
      <pre>{JSON.stringify(lastData, null, 2)}</pre>
    </div>
  );
};

export default Main;
