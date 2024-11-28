import { NextResponse } from "next/server";
import {
  pendingImages,
  incrementPendingImages,
  decrementPendingImages,
} from "@/utils/state";
export async function GET() {
  // 서버에서 pendingImages 값을 반환
  return NextResponse.json({ pendingImages });
}

// POST 요청을 통해 pendingImages 값을 변경
export async function POST(request: Request) {
  const { change } = await request.json();

  // 서버에서 pendingImages 값을 업데이트
  if (change > 0) {
    incrementPendingImages(change); // 증가
  } else {
    decrementPendingImages(Math.abs(change)); // 감소
  }

  return NextResponse.json({ pendingImages });
}
