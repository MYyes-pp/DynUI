import { message } from 'antd';
import { NextResponse } from "next/server";
import { createTask, updateTask } from "@/lib/db";
import { extractTsx, generateTaskId } from "@/lib/utils";
import { ai_gen } from "@/lib/ai";

export async function POST(req: Request) {
  const { taskDesc, taskData, taskType, callbackURL } = await req.json();

  // 创建初始任务记录
  const taskId = generateTaskId();
  const uiUrl = `${process.env.BASE_URL}/ui/${taskId}`;

  await createTask({
    taskId,
    taskDesc,
    taskData,
    taskType,
    callbackURL,
    uiUrl,
    status: "PENDING",
  });

  // 触发后台生成任务
  generateComponentsInBackground(taskId, taskDesc, taskData, taskType);
  return NextResponse.json({
    taskId,
    ui_url: uiUrl,
    status_url: `${process.env.BASE_URL}/api/status?taskId=${taskId}`,
  });
}

async function generateComponentsInBackground(
  taskId: string,
  taskDesc: string,
  taskData: any,
  taskType: string
) {
  try {
    console.log("开始生成组件...")
    const sys_prompt = `你是一个优秀的前端工程师，你将仔细的思考需求并毫无保留的回答提出的问题。`;

    const commonPrompt = `
    ## 组件开发规范
  1. 技术栈：
    - 使用 TypeScript 和 React 18+ 语法。
    - 必须从 react 和 antd 包中导入必要的模块。
  2. 组件规范：
    - 命名：默认导出为 export default function GeneratedComponent()。
    - 样式：使用内联样式（style 属性）进行样式定义。
    - Hooks：仅使用 React 内置 Hooks（如 useState、useEffect、useCallback 等）。
    - UI 库：仅使用 antd 组件库，禁止引入其他第三方库。
    - 表单控件：
      - 所有控件需添加中文标签和占位文本。
      - 时间相关字段必须使用时间控件（如 DatePicker 或 TimePicker），而非普通输入框。
      - 表单项必须包含验证规则（如必填、格式校验等）。
  3. 数据提交：
    - 必须实现以下提交方法将表单数据发送到父窗口：
    \`\`\`tsx
      const handleSubmit = (values: any) => {
        window.parent.postMessage({
          type: 'FORM_SUBMIT',
          payload: values
        }, '*');
      };
    \`\`\`
    - 所有表单项都应该有适当的验证规则
    - 提交后应显示成功提示或加载状态

  ## 用户体验要求
  1. 布局整洁，间距合理
  2. 添加适当的说明文本和错误提示
  3. 所有控件有明确的中文标签和占位文本
  4. 实现必要的表单验证（如必填、格式校验等）
  5. 提供清晰的提交按钮

  # 输出格式
  严格按照以下代码块结构生成代码（仅包含一个文件）：
  \`\`\`tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Button, /* 其他用到的antd组件 */ } from 'antd';

export default function GeneratedComponent() {
  // 组件实现
}
  \`\`\`

  ** 注意事项 **
  1. 确保代码语法完全正确，无错误和警告
  2. 不要添加任何说明性注释或文档
  3. 所有UI文本必须使用中文
  4. 确保表单数据在提交前经过验证
  5. 表单必须包含所有<taskData>中要求的字段,且字段名和值完全一致，不得篡改或遗漏。
  6. 不要篡改数据,不要漏数据！！！
  7. 不要篡改数据,不要漏数据！！！
  8. 不要篡改数据,不要漏数据！！！
    `

    //类型为确认信息的prompt
    const confirmPrompt = `
      根据任务内容严格遵循以下要求生成React组件代码：

      ## 输入
      1. 任务描述（taskDesc）为：${taskDesc}
      2. 任务数据（taskData）为：${JSON.stringify(taskData)}

      ## 要求
      - 根据任务数据，自动规划合适的前端组件用于展示这些信息，并将任务数据作为初始值。
      - 禁止添加不存在任务数据中的字段和值
      - 禁止篡改任务数据中的字段和值

      ${commonPrompt}
      
    `

    //类型为信息补全信息的prompt
    const lackPrompt = `
      根据任务内容严格遵循以下要求生成React组件代码：

      ## 输入
      1. 任务描述（taskDesc）为：${taskDesc}
      2. 任务数据（taskData）为：${taskData}

      ## 要求
      - 根据任务描述和任务数据提供的缺失的字段名，自动规划合适的前端组件用于收集缺失的信息。
      - 禁止添加不存在任务数据中的字段和值
      - 禁止篡改任务数据中的字段和值

      ${commonPrompt}
    `

    const message = (taskType=="CONFIRM_INFORMATION"?confirmPrompt:lackPrompt);


    await updateTask({
      taskId,
      status: "PROCESSING",
    });
    const code = await ai_gen(message, sys_prompt);
    const generatedCode = extractTsx(code);

    console.log(generatedCode)

    await updateTask({
      taskId, 
      status: "READY",
      generatedCode,
    });
  } catch (error) {
    await updateTask({
      taskId, 
      status: "FAILED",
    });
  }
}
