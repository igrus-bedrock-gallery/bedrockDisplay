import { useEffect, useCallback } from "react";
import { ImageData } from "@/types/frames";

export function useDataHandler(
  pendingImages: number,
  updateFrames: (frameKey: number, data: ImageData) => void
) {
  const setupEventSource = useCallback(() => {
    console.log("useDataHandler 실행. pendingImages :", pendingImages);

    if (pendingImages <= 0) {
      console.log("No pending images to process");
      return null;
    }

    const eventSource = new EventSource(
      `/api/get-images?pendingImages=${pendingImages}`
    );

    eventSource.onopen = () => {
      console.log("EventSource connection opened");
    };

    eventSource.onmessage = (event) => {
      if (event.data === '"keep-alive"') {
        console.log("Received keep-alive message. Ignoring.");
        return;
      }

      console.log("Received SSE message:", event.data);

      try {
        const { frameKey, data } = JSON.parse(event.data);
        console.log("Updating frames with:", { frameKey, data });
        updateFrames(frameKey, data);
      } catch (error) {
        console.error("Error processing SSE message:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource error:", error);
      eventSource.close();
    };

    return eventSource;
  }, [pendingImages, updateFrames]);

  useEffect(() => {
    const eventSource = setupEventSource();

    return () => {
      if (eventSource) {
        console.log("Cleaning up EventSource connection");
        eventSource.close();
      }
    };
  }, [setupEventSource]);
}
