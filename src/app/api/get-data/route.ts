import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  const jsonPath = path.join(process.cwd(), 'src/app/data/results.json');
  console.log(jsonPath);
  const jsonData = await fs.readFile(jsonPath, 'utf8');
  const sibal = JSON.parse(jsonData);
  console.log(sibal);
  return NextResponse.json(sibal);
}