"use client";

import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from "react";
import axios from "axios";

interface Frame {
  frameKey: number;
  data: any;
}

interface FrameContextProps {
  frameQueue: Frame[];
  getNextKey: () => Frame | null;
  isLoading: boolean;
  currentFrameNumber: React.MutableRefObject<number>; // Ref의 타입 정의 수정
  increaseCurrentFrameNumber: () => void;
}

export const FrameContext = createContext<FrameContextProps | undefined>(
  undefined
);

export const FrameProvider = ({ children }: { children: ReactNode }) => {
  const [frameQueue, setFrameQueue] = useState<Frame[]>([]);
  const [pendingImages, setPendingImages] = useState<number>(10); // 초기 대기 이미지 수
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const currentFrameNumber = useRef<number>(1); // Ref로 변경

  const increaseCurrentFrameNumber = () => {
    if (currentFrameNumber.current === 7) {
      currentFrameNumber.current = 1;
    } else {
      currentFrameNumber.current += 1;
    }
  };

  const addToQueue = (data: Frame[]) => {
    setFrameQueue((prev) => [...prev, ...data]);
  };

  const getNextKey = (): Frame | null => {
    if (frameQueue.length > 0) {
      const nextKey = frameQueue[0];
      setFrameQueue((prev) => prev.slice(1));
      return nextKey;
    }
    return null;
  };

  const fetchImages = async () => {
    setIsLoading(true);
    while (pendingImages > 0) {
      try {
        console.log("Fetching images...");
        const response = await axios.get("/api/get-images");

        if (
          // response.data &&
          // Array.isArray(response.data) &&
          response?.data.length > 0
        ) {
          console.log("Images fetched:", response.data);

          // FrameKey 1~7 매칭
          // const updatedData = response.data.map((item: any, index: number) => ({
          //   frameKey: (index % 7) + 1, // 1~7 순환
          //   data: item,
          // }));
          const updatedData = response.data.map((item: any, index: number) => {
            // map을 돌 때마다, currentFrameNumber를 1 증가시키고 증가된 number를 frameKey에 담아 줌.
            //  1~7 순환
            const frameNumberToShow = currentFrameNumber.current;

            increaseCurrentFrameNumber();

            console.log("frame number : " + frameNumberToShow);
            console.log(item);

            return {
              frameKey: frameNumberToShow,
              data: item,
            };
          });
          addToQueue(updatedData);
          setPendingImages((prev) => Math.max(prev - response.data.length, 0));
        } else {
          console.log("No data received. Retrying in 30 seconds...");
          await new Promise((resolve) => setTimeout(resolve, 30000));
        }
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <FrameContext.Provider
      value={{
        frameQueue,
        getNextKey,
        isLoading,
        currentFrameNumber,
        increaseCurrentFrameNumber,
      }}
    >
      {children}
    </FrameContext.Provider>
  );
};
