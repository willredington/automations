import { Handler } from "aws-lambda";
import { z } from "zod";
import {
  FigmaConversation,
  groupCommentsIntoConversations,
} from "../../../domain/figma";

const ExpectedEvent = z.object({
  fileKeys: z.array(z.string()),
  figmaApiToken: z.string(),
  figmaUsername: z.string(),
});

export const handler: Handler = async (
  incomingEvent
): Promise<FigmaConversation[]> => {
  console.log(JSON.stringify(incomingEvent, null, 2));

  const event = ExpectedEvent.parse(incomingEvent);

  const allConversations: FigmaConversation[] = [];

  for (const fileKey of event.fileKeys) {
    const conversations = await groupCommentsIntoConversations({
      fileKey,
      figmaApiToken: event.figmaApiToken,
      figmaUsername: event.figmaUsername,
    });

    console.log(JSON.stringify(conversations, null, 2));

    allConversations.push(...conversations);
  }

  return allConversations;
};
