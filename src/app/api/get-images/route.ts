import { NextResponse } from "next/server";
import { promises as fs } from 'fs';
import path from 'path';
import { FrameQueueManager } from "@/utils/FrameQueueManager";
import axios from "axios";

const LAMBDA_FUNCTION_URL = "https://isgdpnwgdggswjirn4jzwtzgda0fdxmf.lambda-url.ap-northeast-1.on.aws/";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  let pendingImages = { count: Number(searchParams.get("pendingImages")) };
  const frameManager = FrameQueueManager.getInstance();

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

  try {
    while (pendingImages.count > 0) {
      console.log("Fetching data from AWS API Gateway...");
      const response = await axios.get(apiUrl, { timeout: 200000 });

      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log("Data fetched from AWS:", response.data);

        for (const obj of response.data) {
          const frameKey = frameManager.getNextKey();
          
          const payload = {
            key: frameKey.toString(),
            ImageURL: obj.imgUrl,
            Description: obj.description
          };
        
          try {
            const lambdaResponse = await axios.post(LAMBDA_FUNCTION_URL, payload);
            console.log("Lambda response:", lambdaResponse.data);
            console.log("Updated data for frame:", frameKey);
          } catch (error) {
            if (axios.isAxiosError(error))
              console.error("Error invoking Lambda function:", error.response ? error.response.data : error.message);
          }
          pendingImages.count--;
        }
      } else {
        console.warn("No data received or data format invalid.");
        if (pendingImages.count > 0) {
          console.log("No data received, retrying in 30 seconds...");
          await new Promise((resolve) => setTimeout(resolve, 30000));
        }
      }
    }

    return new NextResponse(JSON.stringify({ message: "Data processing completed" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error processing data:", error);
    return new NextResponse(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}