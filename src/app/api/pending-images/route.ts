import { NextResponse } from "next/server";
import {
  pendingImages,
  incrementPendingImages,
  decrementPendingImages,
} from "@/utils/state";

// GET 요청: 현재 서버의 pendingImages 값을 클라이언트에 반환
export async function GET() {
  return NextResponse.json({ pendingImages });
}

// POST 요청: 클라이언트의 요청에 따라 pendingImages 값을 업데이트
export async function POST(request: Request) {
  const { change } = await request.json();

  try {
    if (change > 0) {
      await incrementPendingImages(change); // 증가
    } else {
      await decrementPendingImages(Math.abs(change)); // 감소
    }
    return NextResponse.json({ pendingImages });
  } catch (error: unknown) {
    // pendingImages 값보다 감소시키는 값이 더 큰 에러에 대한 처리
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    } else {
      // 예상치 못한 에러에 대한 처리
      return NextResponse.json(
        { error: "An unexpected error occurred" },
        { status: 500 }
      );
    }
  }
}
