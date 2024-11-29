import { NextResponse } from "next/server";
import { pendingImages, incrementPendingImages } from "../frameQueue/route"; // pendingImages를 직접 가져오기

// POST 요청 처리
export async function POST(request: Request) {
  const now = new Date();

  try {
    // pendingImages 값을 증가
    incrementPendingImages(1);

    console.log("현재 시간 (서버): ", now.toLocaleString());
    console.log("pendingImages 증가 완료");
    console.log("현재 pendingImages 상태: ", pendingImages);

    const body = await request.json();
    console.log("POST request received with body:", body);

    return NextResponse.json(
      { message: "Signal received", pendingImages },
      {
        headers: {
          "Access-Control-Allow-Origin": "*", // 모든 도메인 허용
        },
      }
    );
  } catch (error) {
    console.error("Error handling POST request:", error);
    return NextResponse.json(
      { message: "Failed to increment pendingImages", error },
      { status: 500 }
    );
  }

  // try {
  //   // frameQueue의 POST 요청으로 pendingImages 값을 +1로 증가
  //   const response = await updateFrameQueue(
  //     new Request("POST", { body: JSON.stringify({ change: 1 }) })
  //   );

  //   console.log("현재 시간 (서버) : ", now.toLocaleString());
  //   console.log("pendingImages 증가 완료");
  //   console.log("pendingImages 상태: ", await response.json());

  //   const body = await request.json();
  //   console.log("POST request received with body:", body);

  //   return NextResponse.json(
  //     { message: "Signal received" },
  //     {
  //       headers: {
  //         "Access-Control-Allow-Origin": "*", // 모든 도메인 허용
  //       },
  //     }
  //   );
  // } catch (error) {
  //   console.error("Error handling POST request:", error);
  //   return NextResponse.json(
  //     { message: "Failed to increment pendingImages", error },
  //     { status: 500 }
  //   );
  // }
}

// OPTIONS 요청 처리 (CORS 문제 해결)
export async function OPTIONS() {
  return NextResponse.json(null, {
    headers: {
      "Access-Control-Allow-Origin": "*", // 모든 도메인 허용
      "Access-Control-Allow-Methods": "POST, OPTIONS", // 허용 메서드
      "Access-Control-Allow-Headers": "Content-Type", // 허용 헤더
    },
  });
}
