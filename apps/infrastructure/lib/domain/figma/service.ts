import axios from "axios";
import {
  FigmaComment,
  FigmaConversation,
  GetFigmaCommentResponse,
} from "./type";

async function fetchFigmaCommentsForFileKey({
  fileKey,
  figmaApiToken,
}: {
  fileKey: string;
  figmaApiToken: string;
}): Promise<FigmaComment[]> {
  const response = await axios.get<GetFigmaCommentResponse>(
    `https://api.figma.com/v1/files/${fileKey}/comments`,
    {
      headers: {
        "X-Figma-Token": figmaApiToken,
        "Content-Type": "application/json",
      },
    }
  );

  return GetFigmaCommentResponse.parse(response.data).comments;
}

export async function groupCommentsIntoConversations({
  fileKey,
  figmaApiToken,
  figmaUsername,
}: {
  fileKey: string;
  figmaApiToken: string;
  figmaUsername: string;
}): Promise<FigmaConversation[]> {
  const comments = await fetchFigmaCommentsForFileKey({
    fileKey,
    figmaApiToken,
  });

  console.log(`found ${comments.length} comments for file ${fileKey}`);
  console.log(JSON.stringify(comments, null, 2));

  const conversationMap = new Map<string, FigmaComment[]>();

  comments.forEach((comment) => {
    const rootId = comment.parent_id || comment.id;

    if (!conversationMap.has(rootId)) {
      conversationMap.set(rootId, []);
    }
    conversationMap.get(rootId)!.push(comment);
  });

  const conversations = Array.from(conversationMap.values())
    .map((thread) => {
      const sortedComments = thread.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      const rootComment =
        sortedComments.find((c) => !c.parent_id) || sortedComments[0];

      return {
        id: rootComment.id,
        rootComment,
        replies: sortedComments.filter((c) => c.id !== rootComment.id),
        isResolved: sortedComments.some((c) => c.resolved_at !== null),
        nodeId: rootComment.client_meta?.node_id ?? null,
        fileKey: rootComment.file_key,
      } satisfies FigmaConversation;
    })
    .sort(
      (a, b) =>
        new Date(b.rootComment.created_at).getTime() -
        new Date(a.rootComment.created_at).getTime()
    );

  return conversations.filter((conversation) => {
    const isUsernameMentioned =
      conversation.rootComment.message.includes(figmaUsername) ||
      conversation.replies.some((reply) =>
        reply.message.includes(figmaUsername)
      );

    return !conversation.isResolved && isUsernameMentioned;
  });
}
