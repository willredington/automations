import { BlockObjectRequest } from "@notionhq/client";
import { InsertTaskDbRecord, TaskStatus } from "../task";
import { FigmaConversation, FigmaConversationWithTask } from "./type";

// https://www.figma.com/board/Y3houA7xKVANITbRlqmpCa?#1274457600
function generateFigmaCommentLink({
  conversation,
}: {
  conversation: FigmaConversation;
}): string {
  const commentId = conversation.rootComment.id;
  const baseUrl = `https://www.figma.com/board/${conversation.fileKey}`;

  if (conversation.nodeId) {
    return `${baseUrl}?node-id=${encodeURIComponent(
      conversation.nodeId
    )}#${commentId}`;
  }

  return `${baseUrl}?#${commentId}`;
}

export function mapFigmaConversationWithTaskToTask({
  conversationWithTask,
}: {
  conversationWithTask: FigmaConversationWithTask;
}): InsertTaskDbRecord {
  const createdAt = new Date(
    conversationWithTask.conversation.rootComment.created_at
  );

  const commentLink = generateFigmaCommentLink({
    conversation: conversationWithTask.conversation,
  });

  const comments = [
    conversationWithTask.conversation.rootComment,
    ...conversationWithTask.conversation.replies,
  ];

  const headerBlock: BlockObjectRequest = {
    type: "heading_2",
    heading_2: {
      rich_text: [
        {
          text: {
            content: "Original Conversation",
          },
        },
      ],
    },
  };

  const commentMessageBlocks: BlockObjectRequest[] = comments.map(
    (comment) => ({
      type: "numbered_list_item",
      numbered_list_item: {
        rich_text: [
          {
            text: {
              content: `${comment.user.handle} - ${comment.message}`,
            },
          },
        ],
      },
    })
  );

  return {
    createdAt,
    contentBlocks: [headerBlock, ...commentMessageBlocks],
    links: [
      {
        name: "Original Comment",
        url: commentLink,
      },
    ],
    name: conversationWithTask.task.taskName,
    sourceId: conversationWithTask.conversation.rootComment.id,
    sourceType: "FIGMA",
    status: TaskStatus.TODO,
    self: commentLink,
    tags: ["figma", "needs-human"],
  };
}
