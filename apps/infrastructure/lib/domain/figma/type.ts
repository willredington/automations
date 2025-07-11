import { z } from "zod";
import { FigmaTask } from "../ai";

export const FigmaComment = z.object({
  id: z.string(),
  file_key: z.string(),
  parent_id: z.string().nullish(),
  user: z.object({
    handle: z.string(),
  }),
  created_at: z.string(),
  resolved_at: z.string().nullable(),
  message: z.string(),
  client_meta: z
    .object({
      node_id: z.string().nullish(),
    })
    .nullish(),
});

export const FigmaConversation = z.object({
  id: z.string(),
  rootComment: FigmaComment,
  replies: z.array(FigmaComment),
  isResolved: z.boolean(),
  nodeId: z.string().nullable(),
  fileKey: z.string(),
});

export const GetFigmaCommentResponse = z.object({
  comments: z.array(FigmaComment),
});

export const FigmaConversationWithTask = z.object({
  task: FigmaTask,
  conversation: FigmaConversation,
});

export type FigmaComment = z.infer<typeof FigmaComment>;

export type FigmaConversation = z.infer<typeof FigmaConversation>;

export type GetFigmaCommentResponse = z.infer<typeof GetFigmaCommentResponse>;

export type FigmaConversationWithTask = z.infer<
  typeof FigmaConversationWithTask
>;
