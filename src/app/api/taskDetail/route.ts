import { NextResponse,NextRequest } from "next/server";
import { getTask } from "@/lib/db";

export async function GET(req:NextRequest) {
  const { searchParams } = new URL(req.url)
  const taskId = searchParams.get("taskId")
  if (!taskId) {
    return NextResponse.json({
      taskId: null,
      status: "FAILED",
      data:null
    });
  }
  const { data, code } = await getTask(taskId);
  if (code !== 200) {
    return NextResponse.json({
      taskId: data?.id,
      status: "FAILED",
      data:null
    });
  }

  return NextResponse.json({
    taskId: data?.id,
    status: data?.status,
    data:data
  });
}
