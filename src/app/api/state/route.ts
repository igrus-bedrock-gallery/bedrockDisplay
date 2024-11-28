import { NextResponse } from "next/server";

// 서버 상태 변수
let serverState = {
  lastFrameNumber: 0,
  pendingImages: 0,
  activePage: "middle", // 현재 활성화된 페이지 ("left" 또는 "middle")
};

// GET 요청: 상태 반환
export async function GET() {
  return NextResponse.json(serverState);
}

// POST 요청: 상태 업데이트
export async function POST(request: Request) {
  const updates = await request.json();
  serverState = { ...serverState, ...updates }; // 상태 병합
  return NextResponse.json(serverState);
}
