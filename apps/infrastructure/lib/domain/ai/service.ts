import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { v4 } from "uuid";
import z from "zod";
import { FigmaConversation } from "../figma";
import { InsertTaskDbRecord } from "../task";
import { makeFigmaTaskPrompt, makeTaskTaggingPrompt } from "./prompt";
import { FigmaTask, TaskTaggingInput, TaskTaggingOutput } from "./type";

export async function getFigmaCommentTasks({
  figmaUsername,
  figmaConversations,
}: {
  figmaUsername: string;
  figmaConversations: FigmaConversation[];
}) {
  const prompt = makeFigmaTaskPrompt({
    figmaUsername,
    figmaConversations,
  });
  return await generateObject({
    model: anthropic("claude-4-sonnet-20250514"),
    schema: z.object({
      tasks: z.array(FigmaTask),
    }),
    prompt,
  });
}

export async function getTagsForTasks({
  tasks,
}: {
  tasks: InsertTaskDbRecord[];
}) {
  const tasksWithId = tasks.map((task) => ({
    ...task,
    id: v4(),
  }));

  const taskInputs = tasksWithId.map(
    (taskWithId) =>
      ({
        id: taskWithId.id,
        name: taskWithId.name,
        sourceType: taskWithId.sourceType,
        description: taskWithId.description,
      } satisfies TaskTaggingInput)
  );

  const prompt = makeTaskTaggingPrompt({
    tasks: taskInputs,
  });

  const result = await generateObject({
    model: anthropic("claude-4-sonnet-20250514"),
    schema: TaskTaggingOutput,
    prompt,
  });

  const tasksWithTags = result.object.tasks;

  console.log("ai result", JSON.stringify(tasksWithTags, null, 2));

  return tasksWithId.map((taskWithId) => {
    const existingTags = new Set(taskWithId.tags);

    const taskWithTags = tasksWithTags.find(
      (item) => item.taskId === taskWithId.id
    );

    if (taskWithTags) {
      const tags = taskWithTags.tags.filter((tag) => !existingTags.has(tag));

      return {
        ...taskWithId,
        tags: [...taskWithId.tags, ...tags],
      };
    }

    return taskWithId;
  });
}
