import axios from "axios";
import { Frame } from "@/types/frames";

// 서버 상태 가져오기 (frameQueue,pendingImages,lastFrameNumber 데이터 서버에서 가져오기)
export const fetchServerState = async () => {
  const res = await axios.get("/api/frameQueue");
  return res.data;
};

// frameQueue에 데이터 추가
export const addToFrameQueue = async (frames: Frame[]) => {
  const res = await axios.post("/api/frameQueue", { frames });
  return res.data;
};

// frameQueue에서 데이터 제거
export const removeFromFrameQueue = async (count: number) => {
  const res = await axios.delete("/api/frameQueue", { data: { count } });
  return res.data;
};

// pendingImages와 lastFrameNumber 업데이트
export const updateServerState = async (
  pendingChange: number,
  lastFrame: number
) => {
  const res = await axios.patch("/api/frameQueue", {
    pendingChange,
    lastFrame,
  });
  return res.data;
};
