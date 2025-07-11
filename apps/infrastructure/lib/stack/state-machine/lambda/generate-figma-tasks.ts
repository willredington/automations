import { Handler } from "aws-lambda";
import { z } from "zod";
import { getFigmaCommentTasks } from "../../../domain/ai";
import { FigmaConversation } from "../../../domain/figma";

const ExpectedEvent = z.object({
  figmaUsername: z.string(),
  figmaConversations: z.array(FigmaConversation),
});

export const handler: Handler = async (incomingEvent) => {
  console.log(JSON.stringify(incomingEvent, null, 2));

  const { figmaUsername, figmaConversations } =
    ExpectedEvent.parse(incomingEvent);

  const figmaTasks = await getFigmaCommentTasks({
    figmaUsername,
    figmaConversations,
  });

  return figmaTasks.object.tasks;
};
