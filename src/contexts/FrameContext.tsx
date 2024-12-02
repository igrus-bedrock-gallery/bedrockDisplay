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

interface PendingImages {
  value: number;
}

interface FrameContextProps {
  frameQueue: Frame[];
  getNextKey: () => Frame | null;
  isLoading: boolean;
  currentFrameNumber: React.MutableRefObject<number>; // Ref의 타입 정의 수정
  increaseCurrentFrameNumber: () => void;
  pendingImages: number;
  lastFrameNumber: React.MutableRefObject<number>;
  removeFromQueue: (count: number) => void; // 수정
}

export const FrameContext = createContext<FrameContextProps | undefined>(
  undefined
);

export const FrameProvider = ({ children }: { children: ReactNode }) => {
  const [pendingImages, setPendingImages] = useState<any>(0); // 서버의 pendingImages 상태 관리
  const [frameQueue, setFrameQueue] = useState<Frame[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const currentFrameNumber = useRef<number>(0); // Ref로 변경
  const lastFrameNumber = useRef<number>(0);

  // pendingImages 상태를 가져오는 함수
  const fetchPendingImages = async () => {
    try {
      const res = await axios.get("/api/pendingImages");
      if (
        res?.data.pendingImages > 0
        // &&
        // res?.data.pendingImages !== pendingImages //데이터 받아오기 전까지 계속 같은 pendingImages값에 의한 state업데이트 방지
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
    }, 1000); // 1초마다 서버 데이터를 가져옴

    return () => clearInterval(intervalId); // 컴포넌트 언마운트 시 인터벌 제거
  }, []);

  const increaseCurrentFrameNumber = () => {
    if (currentFrameNumber.current === 4) {
      currentFrameNumber.current = 1;
    } else {
      currentFrameNumber.current += 1;
    }
  };

  const addToQueue = (data: Frame[]) => {
    setFrameQueue((prev) => [...prev, ...data]);
  };

  const removeFromQueue = (count: number) => {
    setFrameQueue((prev) => prev.slice(count)); // 앞에서 `count`만큼 제거
  };

  const getNextKey = (): Frame | null => {
    if (frameQueue.length > 0) {
      const nextKey = frameQueue[0];
      setFrameQueue((prev) => prev.slice(1));
      return nextKey;
    }
    return null;
  };

  const doRepeatFunc = async (value: number) => {
    let localPendingImages = pendingImages; // 로컬 변수로 복사
    while (localPendingImages > 0) {
      try {
        console.log("Fetching images...");
        const response = await axios.get("/api/get-images");
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

          addToQueue(updatedData);
          lastFrameNumber.current = currentFrameNumber.current; //현재 마지막 프레임 번호

          const completedImages = response.data.length;

          // if 이걸 안했다면... 서버의 상태를 동기화
          // await updatePendingImages(-completedImages); //남아있는 사진 개수

          localPendingImages -= completedImages;

          // 로컬 변수 업데이트
          if (pendingImages > value) {
            //현재 가장 최신으로 서버와 동기화되어 업데이트된, 처리해야하는 이미지 개수가 localPendingImages보다 크다면..그 사이 추가적인 이미지 업로드가 이루어졌고 그게 클라이언트에도 업데이트가 되었다는것임.
            //작을 수는 없음. 그러면 안됨
            localPendingImages += pendingImages - value; // while문이 돌아가는 동안, pendingImages에 업데이트가 발생했는데 이미 loading 중이라 추가된 값에 대한 get-images가 이루어지지 않게되는경우 방지
            value += pendingImages - value;
            console.log(
              "Context | 로컬 변수 업데이트 : pendingImages에 추가적 업데이트가 발생한 경우에 대한 처리. 현재의 pendingImages와 localPendingImages값 : ",
              localPendingImages
            );
          }
        } else {
          console.log("No data received. Retrying in 30 seconds...");
          await new Promise((resolve) => setTimeout(resolve, 30000));
        }
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    }
  };
  const fetchImages = async () => {
    console.log("fetchImages called with pendingImages:", pendingImages);

    setIsLoading(true);
    // let isDone = false;
    let startedPendingImages: PendingImages = { value: pendingImages };

    doRepeatFunc(startedPendingImages.value);

    await updatePendingImages(-startedPendingImages.value); //남아있는 사진 개수

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
        removeFromQueue,
      }}
    >
      {children}
    </FrameContext.Provider>
  );
};
