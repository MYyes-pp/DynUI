import {
  PrismaClient,
  Task,
  TaskStatus,
  TaskType,
  DataSubmission,
} from "@prisma/client";

const prisma = new PrismaClient();

type ApiResponse<T> = {
  code: number;
  data?: T;
  msg: string;
};

type CreateTaskInput = {
  taskId: string;
  taskDesc: string;
  taskType: TaskType;
  taskData: object;
  callbackURL: string;
  uiUrl: string;
  status: TaskStatus;
};


type UpdateTaskInput = Partial<{
  taskId: string;
  status: TaskStatus;
  generatedCode?: string;
  taskData?: object;
}>;

type createSubmissionInput = {
  taskId: string;
  submittedData: any;
};



// 创建任务
export async function createTask({
  taskId,
  taskDesc,
  taskType,
  taskData,
  callbackURL,
  uiUrl,
  status,
}: CreateTaskInput): Promise<ApiResponse<Task | null>> {
  try {
    const res = await prisma.task.create({
      data: {
        id:taskId,
        taskDesc,
        taskType,
        taskData,
        callbackURL,
        uiUrl,
        status,
      },
    });
    await prisma.$disconnect();
    return {
      code: 200,
      data: res,
      msg: "新增成功",
    };
  } catch (error) {
    console.error(error);
    await prisma.$disconnect();
    return {
      code: 400,
      data: null,
      msg: "新增失败",
    };
  }
}

export async function updateTask(data: UpdateTaskInput): Promise<ApiResponse<Task | null>> {
  try {
    const { taskId, ...rest } = data;
    const res = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: rest,
    });

    await prisma.$disconnect();
    return {
      code: 200,
      data: res,
      msg: "更新成功",
    };
  } catch (error) {
    console.error(error);
    await prisma.$disconnect();
    return {
      code: 400,
      data: null,
      msg: "更新失败",
    };
  }
}


export async function getTask(taskId: string): Promise<ApiResponse<any| null>> {
  try {
    const res = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
      include: {
        submissions: true,
      },
    });
    await prisma.$disconnect();
    return {
      code: 200,
      data: res,
      msg: "查询成功",
    };
  }catch (error) {
    console.error(error);
    await prisma.$disconnect();
    return {
      code: 400,
      data: null,
      msg: "查询失败",
    };
  }
}

export async function createSubmission(data: createSubmissionInput): Promise<ApiResponse<DataSubmission | null>> {
  try {
    console.log(data);
    const res = await prisma.dataSubmission.create({
      data: {...data},
    });
    await prisma.$disconnect();
    return {
      code: 200,
      data: res,
      msg: "新增成功",
    };
  }catch (error) {
    console.error(error);
    await prisma.$disconnect();
    return {
      code: 400,
      data: null,
      msg: "新增失败",
    };
  }
}