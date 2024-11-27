import { NextResponse } from "next/server";
import {
  imageQueue,
  resetPendingImages,
  dequeueImage,
  enqueueImage,
} from "@/utils/state";
import { ImageData } from "@/types/frames";
import { FrameQueueManager } from "@/utils/FrameQueueManager";
import axios from "axios";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  let pendingImages = { count: Number(searchParams.get("pendingImages")) };
  const frameManager = FrameQueueManager.getInstance(); // 싱글톤 인스턴스

  console.log("get-images 함수 실행됨. pendingImages : ", pendingImages);

  if (pendingImages.count <= 0) {
    console.log("No pending images. Returning 204 status.");
    return new NextResponse(null, { status: 204 });
  }

  const apiUrl = process.env.NEXT_PUBLIC_IMAGE_GET_API_URL;
  if (!apiUrl) {
    console.error("NEXT_PUBLIC_IMAGE_GET_API_URL is not defined");
    return new NextResponse("API URL is not defined", { status: 500 });
  }

  return new Response(
    new ReadableStream({
      async start(controller) {
        let intervalId: NodeJS.Timeout | null = null;
        let isStreamClosed = false; // 스트림 상태 관리
        let isProcessing = false; // 현재 비동기 작업 여부 확인

        const fetchAndProcessData = async () => {
          if (isStreamClosed) return; // 스트림이 닫힌 상태라면 작업 종료
          isProcessing = true;

          try {
            while (pendingImages.count > 0 && !isStreamClosed) {
              //&& !isStreamClosed
              //
              console.log("Fetching data from AWS API Gateway...");
              const response = await axios.get(apiUrl, { timeout: 200000 });

              if (Array.isArray(response.data) && response.data.length > 0) {
                console.log("Data fetched from AWS:", response.data);

                // response.data.forEach((obj: ImageData) =>
                for (const obj of response.data) {
                  if (isStreamClosed) break;
                  pendingImages.count--;

                  try {
                    const frameKey = frameManager.getNextKey(); // 1~7 순환 키
                    const eventData = JSON.stringify({
                      frameKey,
                      data: obj,
                    });

                    if (!isStreamClosed) {
                      controller.enqueue(`data: ${eventData}\n\n`);
                      console.log("Sent data to client:", eventData);
                    }
                  } catch (error) {
                    console.error("Error sending data:", error);
                  }
                }
                // );
              } else {
                console.warn("No data received or data format invalid.");
              }

              // 데이터를 받지 못했다면 30초 후에 재시도
              if (pendingImages.count > 0) {
                console.log("No data received, retrying in 30 seconds...");
                await new Promise((resolve) => setTimeout(resolve, 30000));
                // continue;
              }
            }

            if (pendingImages.count <= 0 && !isStreamClosed) {
              resetPendingImages();
              isStreamClosed = true; // 스트림 상태 업데이트

              console.log("No more pending images. Closing stream.");
              clearInterval(intervalId!); // Keep-alive 중지
              // controller.close();
            }
          } catch (error) {
            console.error("Error fetching data:", error);
          } finally {
            if (!isStreamClosed) {
              console.log("Closing stream due to fetch process termination.");
              isStreamClosed = true;
              isProcessing = false; // 비동기 작업 완료

              // controller.close();
            }
          }
        };

        const sendKeepAlive = () => {
          if (!isStreamClosed) {
            controller.enqueue(`data: "keep-alive"\n\n`);
            console.log("Sent keep-alive message to client.");
          } else {
            console.warn("Attempted to send keep-alive on closed stream.");
          }
        };

        // // 3초마다 keep-alive 메시지 전송 시작
        intervalId = setInterval(sendKeepAlive, 3000); // 3초마다 Keep-alive 메시지 전송

        // 데이터 처리 시작
        await fetchAndProcessData();

        // 모든 작업이 완료되면 스트림 닫기
        if (!isProcessing && isStreamClosed) {
          console.log("Finalizing stream closure.");
          controller.close();
        }
      },
    }),
    {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": "true",
      },
    }
  );
}
