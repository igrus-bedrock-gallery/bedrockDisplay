import { useEffect, useCallback, useRef } from "react";
import { ImageData } from "@/types/frames";
import {
  setActiveStreamPendingImages,
  getActiveStreamPendingImages,
  dequeuePendingImages,
} from "@/utils/state";

export function useDataHandler(
  pendingImages: number,
  updateFramesMiddle: (frameKey: number, data: ImageData) => void,
  updateFramesLast: (frameKey: number, data: ImageData) => void
) {
  const eventSourceRef = useRef<EventSource | null>(null); // 현재 스트림 추적

  const setupEventSource = useCallback(() => {
    const activePendingImages = getActiveStreamPendingImages(); //활성화된 스트림 확인
    // let pendingImages = dequeuePendingImages(); //스트림 큐에서 제거 및 반환

    console.log("useDataHandler 실행. pendingImages :", pendingImages);

    if (pendingImages === null || pendingImages <= 0) {
      console.log("No valid pendingImages available for stream.");
      return null;
    }

    // // 기존 스트림이 활성 상태라면 새 스트림 생성 방지
    // if (eventSourceRef.current) {
    //   console.log("Existing EventSource connection already active. Reusing.");
    //   return eventSourceRef.current;
    // }
    // 기존 스트림이 활성 상태라면 새 스트림 생성 방지
    if (eventSourceRef.current && activePendingImages === pendingImages) {
      console.log("Existing EventSource connection already active. Reusing.");
      return eventSourceRef.current;
    }

    if (pendingImages === null) {
      console.log("No pendingImages available for stream.");
      return null;
    }

    if (pendingImages <= 0) {
      console.log("No pending images to process");
      return null;
    }

    // 스트림 생성
    const eventSource = new EventSource(
      `/api/get-images?pendingImages=${pendingImages}`
    );

    //스트림생성
    setActiveStreamPendingImages(pendingImages); //현재 스트림 큐 first꺼낸 값으로 스트림 생성하겠다

    eventSource.onopen = () => {
      console.log("EventSource connection opened");
    };

    eventSource.onmessage = (event) => {
      console.log("EventSource message received:", event.data); // 메시지 확인

      if (event.data === '"keep-alive"') {
        console.log("Received keep-alive message. Ignoring.");
        return;
      }

      console.log("Received SSE message:", event.data);

      try {
        const { frameKey, data } = JSON.parse(event.data);
        console.log("Updating frames with:", { frameKey, data });
        // updateFrames(frameKey, data);
        // frameKey에 따라 다른 업데이트 처리
        if (frameKey >= 1 && frameKey <= 4) {
          updateFramesMiddle(frameKey, data); // /middle로 업데이트
        } else if (frameKey >= 5 && frameKey <= 7) {
          updateFramesLast(frameKey, data); // /last로 업데이트
        }
      } catch (error) {
        console.error("Error processing SSE message:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource error:", error);
      // eventSource.close();
      eventSourceRef.current?.close();

      eventSourceRef.current = null; // 스트림 종료 시 참조 해제
      setActiveStreamPendingImages(null);
    };

    eventSourceRef.current = eventSource;

    return eventSource;
  }, [pendingImages, updateFramesMiddle, updateFramesLast]);

  useEffect(() => {
    const eventSource = setupEventSource();

    return () => {
      if (eventSourceRef.current) {
        // eventSource
        console.log("Cleaning up EventSource connection");
        // eventSource.close();
        eventSourceRef.current.close();

        // 스트림 정리
        eventSourceRef.current = null;
        setActiveStreamPendingImages(null);
      }
    };
  }, [setupEventSource]);
}
