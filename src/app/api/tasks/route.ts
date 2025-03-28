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
    const sys_prompt = `你是一个优秀的前端工程师，你将仔细的思考需求并毫无保留的回答提出的问题。`;
    const message = `严格遵循以下要求生成React组件代码：
  # React 组件代码生成要求
  
  ## 输入参数规范
  
  1. 任务描述 (taskDesc)：
    - 类型：string (自然语言)
    - 示例："预定一个今晚飞往成都的机票"
  2. 任务类型 (taskType)：
    - 类型：枚举值 ：
      1. CONFIRM_INFORMATION //信息确认模式
      2. LACK_INFORMATION //信息补全模式
    - 约束：必须严格匹配上述枚举值。
  3. 任务数据 (taskData)：
    - 类型： 
      1. Object : {field: value}  // 确认模式
      2. Array  : [field1, ...]   // 补全模式
    - 格式规则：
      - 对象模式：字段需符合JSON Schema规范
      - 数组模式：元素应为字符串类型字段名
    - 示例：
      - CONFIRM_INFORMATION 模式：
        - taskData = { "name": "张三", "age": 18 }
      - LACK_INFORMATION 模式：
        - taskData = [ "name", "age" ]


  ## 任务类型
  
  任务类型分为以下两类：
  - CONFIRM_INFORMATION (确认信息):
    - <taskData>包含已有数据，用户需在界面上确认其有效性。
    - 生成的组件默认填充<taskData>，并以可编辑的形式展示。
  - LACK_INFORMATION (补充信息):
    - <taskData> 为缺失字段，用户需通过输入并提交完整信息。
    - 如果 <taskDesc> 中包含隐含信息，则相关字段应预填默认值。例如：
      - <taskDesc>："帮我预定一张飞往成都的机票"
      - 默认值：destination 预填为 "成都"。
  
  ## 处理流程
  1. 根据任务类型确定是否默认填充<taskData>。
  2. 根据任务描述和任务数据生成符合要求的React组件代码。

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

  ## 注意事项

  1. 确保代码语法完全正确，无错误和警告
  2. 不要添加任何说明性注释或文档
  3. 所有UI文本必须使用中文
  4. 确保表单数据在提交前经过验证
  5. 表单必须包含所有<taskData>中要求的字段

  # 任务内容

  以下为此次任务的具体内容：

  1. 任务描述：${taskDesc}
  2. 任务类型：${taskType}
  3. 任务数据：${taskData}

`;
    await updateTask({
      taskId,
      status: "PROCESSING",
    });
    const code = await ai_gen(message, sys_prompt);
    const generatedCode = extractTsx(code);

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
