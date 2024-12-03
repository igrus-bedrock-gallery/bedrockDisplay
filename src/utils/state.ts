//이미지 큐
import { Mutex } from "async-mutex";

export let imageQueue: { Image: string; Description: string }[] = [];

export function enqueueImage(data: { Image: string; Description: string }) {
  imageQueue.push(data);
}

export function dequeueImage() {
  return imageQueue.shift();
}

export function getImageQueue() {
  return [...imageQueue]; // 현재 상태를 복사하여 반환
}

export function clearImageQueue() {
  imageQueue = [];
}

export let availableKeys: number[] = [];

export let pendingImages = 0;
const mutex = new Mutex();

export async function incrementPendingImages(count: number = 1) {
  const release = await mutex.acquire(); // 자원 잠금

  try {
    pendingImages += count;
    console.log(`Pending images incremented: ${pendingImages}`);
  } finally {
    release(); // 자원 잠금 해제
  }
}

export async function decrementPendingImages(count: number = 1) {
  const release = await mutex.acquire();
  try {
    if (pendingImages >= count) {
      pendingImages -= count;
    } else {
      pendingImages = 0;
    }
    console.log(`Pending images decremented: ${pendingImages}`);
  } finally {
    release();
  }
}

export function resetPendingImages(value: number = 0) {
  pendingImages = value;
  console.log(`Pending images reset to ${value}`);
}

//stream 큐
export let streamPendingImagesQueue: number[] = []; // 스트림 쿼리용 pendingImages 큐
export let activeStreamPendingImages: number | null = null; // 현재 활성 스트림의 pendingImages

// 스트림 큐에 추가
export function enqueuePendingImages(count: number) {
  streamPendingImagesQueue.push(count);
  console.log(`Enqueued pendingImages: ${count}`);
}

// 스트림 큐에서 제거 및 반환
export function dequeuePendingImages(): number | null {
  if (streamPendingImagesQueue.length > 0) {
    const value = streamPendingImagesQueue.shift()!;
    console.log(`Dequeued pendingImages: ${value}`);
    return value;
  }
  console.log("No pendingImages in the queue.");
  return null;
}

// 스트림 큐 상태 확인
export function getStreamPendingImagesQueue() {
  return [...streamPendingImagesQueue];
}

// 활성 스트림 설정
export function setActiveStreamPendingImages(value: number | null) {
  activeStreamPendingImages = value;
  console.log(`Active stream pendingImages set to: ${value}`);
}

// 활성 스트림 확인
export function getActiveStreamPendingImages() {
  return activeStreamPendingImages;
}
