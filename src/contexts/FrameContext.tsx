"use client";

import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from "react";
import axios from "axios";
import { Frame } from "@/types/frames";

interface FrameContextProps {
  frameQueue: Frame[];
  getNextKey: () => Frame | null;
  isLoading: boolean;
  currentFrameNumber: React.MutableRefObject<number>; // Ref의 타입 정의 수정
  increaseCurrentFrameNumber: () => void;
  pendingImages: number;
  lastFrameNumber: React.MutableRefObject<number>;
}

export const FrameContext = createContext<FrameContextProps | undefined>(
  undefined
);

export const FrameProvider = ({ children }: { children: ReactNode }) => {
  const [pendingImages, setPendingImages] = useState<number>(0); // 서버의 pendingImages 상태 관리
  const [frameQueue, setFrameQueue] = useState<Frame[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const currentFrameNumber = useRef<number>(0); // Ref로 변경
  const lastFrameNumber = useRef<number>(0);
  // const [lastFrameNumber, setLastFrameNumber] = useState<number>(0); //서버에서 관리해주기 때문에 useState로 변경
  // const [activePage, setActivePage] = useState<string>("middle");

  // pendingImages 상태를 가져오는 함수
  const fetchPendingImages = async () => {
    try {
      const res = await axios.get("/api/pendingImages");
      if (
        res?.data.pendingImages > 0 &&
        res?.data.pendingImages !== pendingImages //데이터 받아오기 전까지 계속 같은 pendingImages값에 의한 state업데이트 방지
      ) {
        setPendingImages(res.data.pendingImages);
      }
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
    }, 30000); // 30초마다 서버 데이터를 가져옴

    return () => clearInterval(intervalId); // 컴포넌트 언마운트 시 인터벌 제거
  }, []);

  const increaseCurrentFrameNumber = () => {
    // if (currentFrameNumber.current === 7) {
    if (currentFrameNumber.current === 4) {
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
    console.log("fetchImages called with pendingImages:", pendingImages);

    setIsLoading(true);
    // let isDone = false;

    let localPendingImages = pendingImages; // 로컬 변수로 복사

    while (localPendingImages > 0) {
      //pendingImages
      try {
        console.log("Fetching images...");
        const response = await axios.get("/api/get-images");
        console.log("AWS Response:", response);

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

          // 서버의 상태와 동기화
          await updatePendingImages(-response.data.length); //남아있는 사진 개수

          lastFrameNumber.current = currentFrameNumber.current; //현재 마지막 프레임 번호

          // 로컬 변수 업데이트
          localPendingImages -= response.data.length;

          // isDone = true;
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
    console.log(
      "pendingImages 변화에 의한 useEffect 실행. 현재 pendingImages : ",
      pendingImages
    );
    console.log("isLoading 값 : ", isLoading);
    if (pendingImages > 0 && !isLoading) {
      fetchImages();
    }
  }, [pendingImages, isLoading]);

  return (
    <FrameContext.Provider
      value={{
        frameQueue,
        getNextKey,
        isLoading,
        currentFrameNumber,
        increaseCurrentFrameNumber,
        pendingImages,
        lastFrameNumber,
      }}
    >
      {children}
    </FrameContext.Provider>
  );
};
