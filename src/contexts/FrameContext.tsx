"use client";

import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from "react";
import {
  fetchServerState,
  addToFrameQueue,
  removeFromFrameQueue,
  updateServerState,
} from "@/utils/api";
import { Frame } from "@/types/frames";
import axios from "axios";

interface FrameContextProps {
  frameQueue: Frame[];
  addToQueue: (frames: Frame[]) => void;
  removeFromQueue: (count: number) => void;
  pendingImages: number;
  lastFrameNumber: number;
  setLastFrameNumber: (frame: number) => void;
  getNextKey: () => Frame | null;
  currentFrameNumber: React.MutableRefObject<number>;
  increaseCurrentFrameNumber: () => void;
  updatePendingImages: (change: number, lastFrameNumber: number) => void; // 추가
}

export const FrameContext = createContext<FrameContextProps | undefined>(
  undefined
);

export const FrameProvider = ({ children }: { children: ReactNode }) => {
  const [frameQueue, setFrameQueue] = useState<Frame[]>([]);
  const [pendingImages, setPendingImages] = useState<number>(0);
  const [lastFrameNumber, setLastFrameNumber] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const currentFrameNumber = useRef<number>(0);

  // 초기 상태를 서버로부터 동기화
  useEffect(() => {
    const syncState = async () => {
      try {
        const state = await fetchServerState(); // 서버 상태 가져오기
        console.log("초기 서버 상태 동기화 중: ", state);
        setFrameQueue(state.frameQueue);
        setPendingImages(state.pendingImages);
        setLastFrameNumber(state.lastFrameNumber);
        currentFrameNumber.current = state.lastFrameNumber || 0;
      } catch (error) {
        console.error("Error syncing initial server state:", error);
      }
    };

    syncState();
  }, []);

  // 주기적으로 pendingImages 상태 가져오기
  useEffect(() => {
    const fetchPendingImages = async () => {
      try {
        const state = await fetchServerState(); ///api/frameQueue에게 get 요청
        console.log(
          "FrameContent에서의 state: ",
          JSON.stringify(state, null, 2)
        ); // 객체를 문자열로 변환하여 출력
        if (state.pendingImages > 0 && state.pendingImages !== pendingImages) {
          //달라진 데이터값 데이터 받아오기 전까지 계속 같은 pendingImages값에 의한 state업데이트 방지
          setPendingImages(state.pendingImages); //pending images개수 서버로 부터 받아오기(지역변수 pendingImages 업데이트)
          console.log("현재의 pendingImages : ", state.pendingImages);
        }
      } catch (error) {
        console.error("Error fetching pending images:", error);
      }
    };

    const intervalId = setInterval(fetchPendingImages, 30000); // 30초마다 동기화
    return () => clearInterval(intervalId);
  }, []);

  // 서버 값 pendingImages,lastFrame 업데이트
  const updatePendingImages = async (
    change: number,
    lastFrameNumber: number
  ) => {
    try {
      const updatedState = await updateServerState(change, lastFrameNumber); //서버에 있는 전역 값 업데이트
      setPendingImages(updatedState.pendingImages); // 서버의 상태를 클라이언트로 동기화
      setLastFrameNumber(updatedState.lastFrameNumber); // 서버의 상태를 클라이언트로 동기화
    } catch (error) {
      console.error("Error updating pending images:", error);
    }
  };

  // frameQueue에 데이터 추가
  const addToQueue = async (frames: Frame[]) => {
    try {
      const updatedState = await addToFrameQueue(frames); //서버에 데이터 추가
      setFrameQueue(updatedState.frameQueue); //지역변수 frameQueue업데이트
    } catch (error) {
      console.error("Error adding to frame queue:", error);
    }
  };

  // 프레임 번호 증가
  const increaseCurrentFrameNumber = () => {
    if (currentFrameNumber.current === 7) {
      currentFrameNumber.current = 1;
    } else {
      currentFrameNumber.current += 1;
    }
  };

  // frameQueue에서 데이터 제거
  const removeFromQueue = async (count: number) => {
    try {
      const updatedState = await removeFromFrameQueue(count);
      setFrameQueue(updatedState.frameQueue);
    } catch (error) {
      console.error("Error removing from frame queue:", error);
    }
  };

  // AWS에서 이미지 데이터 가져오기
  const fetchImages = async () => {
    console.log("fetchImages called with pendingImages:", pendingImages);
    setIsLoading(true);
    let localPendingImages = pendingImages; // 로컬 변수로 복사
    while (localPendingImages > 0) {
      try {
        console.log("Fetching images...");
        const response = await axios.get("/api/get-images", { timeout: 20000 });
        console.log("AWS Response:", response);

        if (response?.data.length > 0) {
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
          // 서버에 데이터 업데이트 & 그에 맞게 지역변수도 같이 업데이트
          await addToQueue(updatedData);
          await updatePendingImages(
            -response.data.length, // pendingImages 업데이트
            currentFrameNumber.current //마지막 프레임 번호 업데이트
          ); //남아있는 사진 개수

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

  // nextKey 가져오기
  const getNextKey = (): Frame | null => {
    if (frameQueue.length > 0) {
      const nextKey = frameQueue[0];
      setFrameQueue((prev) => prev.slice(1)); // 첫 번째 요소 제거
      return nextKey;
    }
    return null;
  };

  // pendingImages 변화에 따른 이미지 가져오기
  useEffect(() => {
    if (pendingImages > 0 && !isLoading) {
      fetchImages();
    }
  }, [pendingImages, isLoading]);

  return (
    <FrameContext.Provider
      value={{
        frameQueue,
        addToQueue,
        removeFromQueue,
        pendingImages,
        updatePendingImages,
        lastFrameNumber,
        setLastFrameNumber,
        getNextKey,
        currentFrameNumber,
        increaseCurrentFrameNumber,
      }}
    >
      {children}
    </FrameContext.Provider>
  );
};
