import { NextResponse } from "next/server";

type Frame = {
  frameKey: number;
  data: {
    Image: string;
    Description: string;
  };
};

// 서버에서 상태 관리
let frameQueue: Frame[] = []; // FrameQueue 상태
export let pendingImages = 0; // 처리 대기 중인 이미지 수
let lastFrameNumber = 0; // 마지막 프레임 번호

export const incrementPendingImages = (value: number) => {
  pendingImages = Math.max(0, pendingImages + value); // 음수 방지
  console.log(`Pending images updated: ${pendingImages}`);
};

export const getPendingImages = () => pendingImages;

// GET: 전체 상태 조회 (frameQueue, pendingImages, lastFrameNumber)
export async function GET() {
  return NextResponse.json({
    frameQueue,
    pendingImages,
    lastFrameNumber,
  });
}

// POST: frameQueue와 pendingImages 상태 업데이트
export async function POST(request: Request) {
  try {
    const {
      frames,
      pendingChange,
      lastFrame,
      change,
    }: {
      frames?: Frame[];
      pendingChange?: number;
      lastFrame?: number;
      change?: number;
    } = await request.json();

    // frameQueue에 데이터 추가
    if (frames && Array.isArray(frames)) {
      frameQueue = [...frameQueue, ...frames];
    }

    // pendingImages 변경 (pendingChange 또는 change를 사용)
    const effectiveChange = pendingChange ?? change;
    if (typeof effectiveChange === "number") {
      pendingImages = Math.max(0, pendingImages + effectiveChange); // 음수 방지
    }

    // lastFrameNumber 업데이트
    if (typeof lastFrame === "number") {
      lastFrameNumber = lastFrame;
    }

    return NextResponse.json({
      message: "State updated successfully",
      frameQueue,
      pendingImages,
      lastFrameNumber,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { message: "Error processing request", error },
      { status: 500 }
    );
  }
}

// DELETE: frameQueue에서 데이터 제거
export async function DELETE(request: Request) {
  try {
    const { count }: { count: number } = await request.json();

    if (typeof count !== "number" || count <= 0) {
      return NextResponse.json(
        { message: "Invalid count value" },
        { status: 400 }
      );
    }

    // frameQueue에서 count만큼 제거
    frameQueue = frameQueue.slice(count);

    return NextResponse.json({
      message: "Frames removed successfully",
      frameQueue,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error processing request", error },
      { status: 500 }
    );
  }
}

// PATCH: 특정 상태 업데이트 (예: pendingImages, lastFrameNumber만 변경)
export async function PATCH(request: Request) {
  try {
    const {
      pendingChange,
      lastFrame,
    }: { pendingChange?: number; lastFrame?: number } = await request.json();

    // pendingImages 변경
    if (typeof pendingChange === "number") {
      pendingImages = Math.max(0, pendingImages + pendingChange); // 음수 방지
    }

    // lastFrameNumber 업데이트
    if (typeof lastFrame === "number") {
      lastFrameNumber = lastFrame;
    }

    return NextResponse.json({
      message: "State updated successfully",
      pendingImages,
      lastFrameNumber,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error processing request", error },
      { status: 500 }
    );
  }
}
