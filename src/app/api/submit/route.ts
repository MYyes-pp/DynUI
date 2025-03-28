import { NextResponse,NextRequest } from "next/server";
import { getTask,createSubmission } from "@/lib/db";

export async function POST(req:NextRequest) {
  const { taskId,submittedData } = await req.json();
  const {code,data} = await createSubmission({
    taskId,
    submittedData
  });
  if (code !== 200) {
    return NextResponse.json({
      taskId: data?.id,
      status: "FAILED",
    });
  }
  const taskResp = await getTask(taskId);
  if (taskResp.code !== 200) {
    return NextResponse.json({
      taskId: taskResp.data?.id,
      status: "FAILED",
    });
  }

  fetch(taskResp.data?.callbackURL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      taskId: taskResp.data?.id,
      status: taskResp.data?.status,
      data: taskResp.data?.submissions?.submittedData,
    }),
  });

  return NextResponse.json({
    taskId: data?.id,
    status: "SUCCESS",
  });
}
