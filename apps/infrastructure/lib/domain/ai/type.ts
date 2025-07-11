import z from "zod";
import { InsertTaskDbRecord } from "../task";

export const FigmaTask = z.object({
  figmaCommentId: z.string(),
  taskName: z.string(),
  taskDescription: z.string(),
  reasoning: z.string(),
});

export type FigmaTask = z.infer<typeof FigmaTask>;

export type TaskTaggingInput = Pick<
  InsertTaskDbRecord,
  "name" | "sourceType" | "description"
> & {
  id: string;
};

export const TaskTaggingOutput = z.object({
  tasks: z.array(
    z.object({
      taskId: z.string(),
      tags: z.array(z.string()),
    })
  ),
});

export type TaskTaggingOutput = z.infer<typeof TaskTaggingOutput>;
