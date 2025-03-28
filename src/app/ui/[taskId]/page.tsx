import CodeRenderer from "@/app/components/CodeRenderer";

export default async function UIPage({
  params,
}:any) {
  const { taskId } = await params;

  // 将数据传递给客户端组件
  return (
    <div className="mx-auto p-4"> 
      <CodeRenderer taskId={taskId} />
    </div>
  );
}
