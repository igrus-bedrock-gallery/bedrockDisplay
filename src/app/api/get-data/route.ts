import { NextRequest, NextResponse } from 'next/server';
import type { NextApiRequest, NextApiResponse } from 'next'
import { promises as fs } from 'fs';
import axios from 'axios';

type DataItem = {
  keyFrame: number
  imgUrl: string
  description: string
  qrImgUrl: string
}

type Data = {
  data: DataItem[]
}


export async function GET() {
  const lambdaUrl = "https://6ujpi6rqphjcqjj6gfrmfizlja0trtwv.lambda-url.ap-northeast-1.on.aws/";

  try {
    const response = await axios.get(lambdaUrl);
    const data: Data = response.data;

    return NextResponse.json({data});
  } catch (error) {
    console.error('Error fetching data from Lambda:', error)
    return NextResponse.error();
  }
}