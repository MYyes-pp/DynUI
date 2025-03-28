"use client";

import { useEffect, useState } from "react";
import { Empty, message } from "antd";
import { customRequire } from "./ReactCodeRenderer/customRequire";
import DynamicComponentRenderer from "../components/ReactCodeRenderer/ReactCodeRenderer";


export default function CodeRenderer({
  taskId,
}: {
  taskId: string;
}) {
  const [task, setTask] = useState<any>({});
  const [code, setCode] = useState("");

  // 轮询状态更新
  useEffect(() => {
    let intervalId:any = null
    const pollStatus = async () => {
      try {
        // 获取任务状态
        const res = await fetch(`/api/status/?taskId=${taskId}`);
        if (!res.ok) throw new Error("Failed to fetch task status");
        const updatedTask = await res.json();

        // 更新任务状态
        setTask(updatedTask.status);

        // 如果任务状态是 "READY"，获取任务详情
        if (updatedTask.status === "READY") {
          const detailRes = await fetch(`/api/taskDetail/?taskId=${taskId}`);
          const {data} = await detailRes.json();
          setCode(data.generatedCode || null);
          if (intervalId) clearInterval(intervalId)
          return 
        }
      } catch (error) {
        console.error("Error during polling:", error);
      }
    };

    // 启动轮询
    intervalId = setInterval(pollStatus, 3000);

    // 清理定时器
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [taskId,task.status]);

  const handleMessage = async (e: MessageEvent) => {
    if (e.data.type === "FORM_SUBMIT") {
      console.log("FORM_SUBMIT", e);
      //保存数据且通知服务端回调
      console.log("FORM_SUBMIT", e.data);
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId,
          submittedData: e.data.payload,
        }),
      });

      const {status} = await res.json();
      if(status === "SUCCESS"){
        message.success("提交成功")
      }
      setCode("")

    }
  };

  const handleError = (errorMessage: string) => {
    window.parent.postMessage(
      {
        type: "artifacts-error",
        errorMessage,
      },
      "*"
    );
  };

  const handleSuccess = () => {
    window.parent.postMessage(
      {
        type: "artifacts-success",
      },
      "*"
    );
  };

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  return (
    <div className="w-full h-full">
      {code? (
        <DynamicComponentRenderer
          customRequire={customRequire}
          entryFile={"App.tsx"}
          files={{ "App.tsx": code }}
          onError={handleError}
          onSuccess={handleSuccess}
        />
      ) : (
        <Empty />
      )}
    </div>
  );
}
