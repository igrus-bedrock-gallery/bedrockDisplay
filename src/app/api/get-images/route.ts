import axios from "axios";
import { NextResponse } from "next/server";

const apiUrl = process.env.NEXT_PUBLIC_IMAGE_GET_API_URL || "";

export async function GET() {
  try {
    const response = await axios.get(apiUrl, { timeout: 20000 });

    if (Array.isArray(response.data)) {
      return NextResponse.json(response.data, { status: 200 });
    }

    return NextResponse.json({ message: "No data available" }, { status: 204 });
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}
