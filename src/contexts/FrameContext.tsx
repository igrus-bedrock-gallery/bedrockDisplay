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
  isLoading: boolean;
  currentFrameNumber: React.MutableRefObject<number>;
  increaseCurrentFrameNumber: () => void;
  pendingImages: number;
  lastFrameNumber: React.MutableRefObject<number>;
  removeFromQueue: (count: number) => void;
}

export const FrameContext = createContext<FrameContextProps | undefined>(
  undefined
);

export const FrameProvider = ({ children }: { children: ReactNode }) => {
  const [pendingImages, setPendingImages] = useState<any>(0); // 서버의 pendingImages 상태 관리
  const [frameQueue, setFrameQueue] = useState<Frame[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const currentFrameNumber = useRef<number>(0);
  const lastFrameNumber = useRef<number>(0);

  // pendingImages를 서버에서 가져옴
  const fetchPendingImages = async () => {
    try {
      const res = await axios.get("/api/pending-images");
      if (res?.data.pendingImages > 0) {
        setPendingImages(res.data.pendingImages);
      }
    } catch (error) {
      console.error("Error fetching pending images:", error);
    }
  };

  // pendingImages 상태를 서버에 업데이트
  const updatePendingImages = async (change: number) => {
    try {
      const res = await axios.post("/api/pending-images", {
        change,
      });
      setPendingImages(res.data.pendingImages); // 서버의 상태를 클라이언트로 동기화
    } catch (error) {
      console.error("Error updating pending images:", error);
    }
  };

  // 데이터와 결합되는 프레임 번호 증가 (1~4 순환)
  const increaseCurrentFrameNumber = () => {
    if (currentFrameNumber.current === 4) {
      currentFrameNumber.current = 1;
    } else {
      currentFrameNumber.current += 1;
    }
  };

  // 프레임 큐에 데이터 추가
  const addToQueue = (data: Frame[]) => {
    setFrameQueue((prev) => [...prev, ...data]);
  };

  // 프레임 큐의 앞에서부터 count 만큼 제거
  const removeFromQueue = (count: number) => {
    setFrameQueue((prev) => prev.slice(count));
  };

  // 이미지 데이터를 pendingImages만큼 받아오도록 하는 반복 함수
  const processPendingImages = async (value: number) => {
    let localPendingImages = pendingImages; // 로컬 변수로 복사

    while (localPendingImages > 0) {
      try {
        const response = await axios.get("/api/get-images");

        if (response?.data.length > 0) {
          const updatedData = response.data.map((item: any) => {
            // map을 돌 때마다, currentFrameNumber를 1 증가시키고 증가된 number를 frameKey에 담아 줌.
            // 1~4 순환
            increaseCurrentFrameNumber();

            return {
              frameKey: currentFrameNumber.current,
              data: item,
            };
          });

          addToQueue(updatedData);
          lastFrameNumber.current = currentFrameNumber.current; //현재 마지막 프레임 번호

          localPendingImages -= response.data.length;

          // while문 시작시의 pendingImages에 추가적으로 값이 더해진 경우
          if (pendingImages > value) {
            //현재 가장 최신으로 서버와 동기화되어 업데이트된, 처리해야하는 이미지 개수가 localPendingImages보다 크다면..그 사이 추가적인 이미지 업로드가 이루어졌고 그게 클라이언트에도 업데이트가 되었다는것임.
            localPendingImages += pendingImages - value; // while문이 돌아가는 동안, pendingImages에 업데이트가 발생했는데 이미 loading 중이라 추가된 값에 대한 get-images가 이루어지지 않게되는경우 방지
            value = pendingImages;
          }
        } else {
          console.log("No data received. Retrying in 30 seconds...");
          await new Promise((resolve) => setTimeout(resolve, 30000));
        }
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    }
    await updatePendingImages(-value); //남아있는 사진 개수
  };

  const fetchImages = async () => {
    setIsLoading(true);

    let startedPendingImages: PendingImages = { value: pendingImages };
    await processPendingImages(startedPendingImages.value);

    setIsLoading(false);
  };

  // pendingImages 상태 변경 감지
  useEffect(() => {
    if (pendingImages > 0 && !isLoading) {
      fetchImages();
    }
  }, [pendingImages, isLoading]);

  // 주기적으로 서버에서 pendingImages 상태를 가져옴
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchPendingImages();
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <FrameContext.Provider
      value={{
        frameQueue,
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
