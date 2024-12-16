import { Mutex } from "async-mutex";

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
  const release = await mutex.acquire(); // 자원 잠금
  try {
    if (pendingImages < count) {
      throw new Error(
        `Cannot decrement by ${count}. Current pendingImages: ${pendingImages}`
      );
    }
    pendingImages -= count;
    console.log(`Pending images decremented: ${pendingImages}`);
  } finally {
    release(); // 자원 잠금 해제
  }
}
