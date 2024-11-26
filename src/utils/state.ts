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

export function incrementPendingImages(count: number = 1) {
  pendingImages += count;
  console.log(`Pending images incremented by ${count}: ${pendingImages}`);
}

export function decrementPendingImages(count: number = 1) {
  if (pendingImages >= count) {
    pendingImages -= count;
    console.log(`Pending images decremented by ${count}: ${pendingImages}`);
  } else {
    console.warn(
      `Cannot decrement by ${count}. Current pendingImages: ${pendingImages}`
    );
    pendingImages = 0; // 0보다 작아지지 않도록함
  }
}

export function resetPendingImages(value: number = 0) {
  pendingImages = value;
  console.log(`Pending images reset to ${value}`);
}
