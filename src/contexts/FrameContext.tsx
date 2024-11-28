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
  pendingImages: number;
}

export const FrameContext = createContext<FrameContextProps | undefined>(
  undefined
);

export const FrameProvider = ({ children }: { children: ReactNode }) => {
  const [pendingImages, setPendingImages] = useState<number>(0); // 서버의 pendingImages 상태 관리

  const [frameQueue, setFrameQueue] = useState<Frame[]>([]);
  // const [pendingImages, setPendingImages] = useState<number>(0); // 초기 대기 이미지 수
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const currentFrameNumber = useRef<number>(0); // Ref로 변경

  // pendingImages 상태를 가져오는 함수
  const fetchPendingImages = async () => {
    try {
      const res = await axios.get("/api/pendingImages");
      if (res?.data > 0) {
        // 받아올 데이터가 존재하는 경우만 pendingImages 업데이트
        setPendingImages(res.data.pendingImages);
      }
      console.log("현재 pendingImages 값 : ", res.data.pendingImages);
    } catch (error) {
      console.error("Error fetching pending images:", error);
    }
  };

  // 서버에 pendingImages 값을 줄이는 함수
  const updatePendingImages = async (change: number) => {
    try {
      const res = await axios.post("/api/pendingImages", {
        change,
      });
      setPendingImages(res.data.pendingImages); // 서버의 상태를 클라이언트로 동기화
    } catch (error) {
      console.error("Error updating pending images:", error);
    }
  };

  // 주기적으로 서버에서 pendingImages 상태를 가져옴
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchPendingImages();
    }, 5000); // 5초마다 서버 데이터를 가져옴

    return () => clearInterval(intervalId); // 컴포넌트 언마운트 시 인터벌 제거
  }, []);

  // // 서버에서 변경된 pendingImages 값에 따라 context 상태를 업데이트
  // useEffect(() => {
  //   // 상태가 변경되면 context 업데이트
  //   console.log("pendingImages updated: ", pendingImages);
  // }, [pendingImages]);

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

          const updatedData = response.data.map((item: any, index: number) => {
            // map을 돌 때마다, currentFrameNumber를 1 증가시키고 증가된 number를 frameKey에 담아 줌.
            //  1~7 순환

            increaseCurrentFrameNumber();

            console.log(
              "current changing frame number : " + currentFrameNumber.current
            );
            console.log(item);

            return {
              frameKey: currentFrameNumber.current,
              data: item,
            };
          });
          addToQueue(updatedData);

          // 서버의 pendingImages 값을 줄임
          await updatePendingImages(-response.data.length);
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
    if (pendingImages > 0 && !isLoading) {
      fetchImages();
    }
  }, [pendingImages]);

  return (
    <FrameContext.Provider
      value={{
        frameQueue,
        getNextKey,
        isLoading,
        currentFrameNumber,
        increaseCurrentFrameNumber,
        pendingImages,
      }}
    >
      {children}
    </FrameContext.Provider>
  );
};
