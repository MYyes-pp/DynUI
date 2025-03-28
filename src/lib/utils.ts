import { v4 as uuidv4}  from 'uuid'


export function extract(reg: any, inputString: string) {
  const ret = [];
  let match;

  while ((match = reg.exec(inputString)) !== null) {
    ret.push(match[1]);
  }

  return ret;
}

export function extractTsx(inputString: string): string {
  const regex = /```(?:tsx|typescript)?\n([\s\S]*?)\n```/g;
  const matches = extract(regex, inputString);

  // 直接返回第一个匹配的代码块内容
  if (matches.length > 0) {
    return matches[0];
  }

  // 兜底处理：如果没有代码块标记，尝试直接清理字符串
  return inputString
    .replace(/^['"`]+|['"`]+$/g, "") // 去除首尾引号
    .replace(/\\n/g, "\n") // 转换换行符
    .trim();
}

export function extractJson(inputString: string): string {
  const regex = /```(?:json|typescript)?\n([\s\S]*?)\n```/g;
  const matches = extract(regex, inputString);

  // 直接返回第一个匹配的代码块内容
  if (matches.length > 0) {
    return matches[0];
  }

  // 兜底处理：如果没有代码块标记，尝试直接清理字符串
  return inputString
    .replace(/^['"`]+|['"`]+$/g, "") // 去除首尾引号
    .replace(/\\n/g, "\n") // 转换换行符
    .trim();
}

export function generateTaskId(){
  return uuidv4()
}