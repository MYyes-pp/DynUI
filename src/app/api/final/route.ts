import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { taskId, status, data } = await req.json();

  console.log("======================>",JSON.stringify(data))
  return NextResponse.json({
    success:"ok"
  });
}