import { Handler } from "aws-lambda";
import { z } from "zod";
import { FigmaTask } from "../../../domain/ai/type";
import {
  FigmaConversation,
  mapFigmaConversationWithTaskToTask,
} from "../../../domain/figma";
import { InsertTaskDbRecord } from "../../../domain/task";

const ExpectedEvent = z.object({
  figmaTasks: z.array(FigmaTask),
  figmaConversations: z.array(FigmaConversation),
});

export const handler: Handler = async (incomingEvent) => {
  console.log(JSON.stringify(incomingEvent, null, 2));

  const { figmaTasks, figmaConversations } = ExpectedEvent.parse(incomingEvent);

  const tasksToInsert: InsertTaskDbRecord[] = [];

  for (const figmaTask of figmaTasks) {
    const conversation = figmaConversations.find(
      (conversation) =>
        conversation.rootComment.id === figmaTask.figmaCommentId ||
        conversation.replies.some(
          (reply) => reply.id === figmaTask.figmaCommentId
        )
    );

    if (conversation) {
      const task = mapFigmaConversationWithTaskToTask({
        conversationWithTask: {
          conversation,
          task: figmaTask,
        },
      });

      tasksToInsert.push(task);
    } else {
      console.warn(
        `could not find conversation for comment ID ${figmaTask.figmaCommentId}`
      );
    }
  }

  return tasksToInsert;
};
