import { BlockObjectRequest } from "@notionhq/client";
import { NotionClient } from "../notion";
import { InsertTaskDbRecord } from "./type";
import { mapJiraStatusToTaskStatus } from "./util";

async function createTask({
  databaseId,
  task,
  notionClient,
}: {
  databaseId: string;
  task: InsertTaskDbRecord;
  notionClient: NotionClient;
}) {
  const linkHeader: BlockObjectRequest = {
    type: "heading_1",
    heading_1: {
      rich_text: [
        {
          type: "text",
          text: {
            content: "Important Links",
          },
        },
      ],
    },
  };

  const additionalInfoHeader: BlockObjectRequest = {
    type: "heading_1",
    heading_1: {
      rich_text: [
        {
          type: "text",
          text: {
            content: "Additional Information",
          },
        },
      ],
    },
  };

  const linkBulletPoints: BlockObjectRequest[] = task.links.map(
    ({ name, url }) => ({
      type: "bulleted_list_item",
      bulleted_list_item: {
        rich_text: [
          {
            type: "text",
            text: {
              content: name,
              link: {
                url: url,
              },
            },
          },
        ],
      },
    })
  );

  const linkBlocks =
    task.links.length > 0 ? [linkHeader, ...linkBulletPoints] : [];

  const additionalInfoBlocks =
    task.contentBlocks && task.contentBlocks.length > 0
      ? [additionalInfoHeader, ...task.contentBlocks]
      : [];

  return await notionClient.pages.create({
    parent: {
      type: "database_id",
      database_id: databaseId,
    },
    children: linkBlocks.concat(additionalInfoBlocks),
    properties: {
      Name: {
        type: "title",
        title: [
          {
            text: {
              content: task.name,
            },
          },
        ],
      },
      "Created At": {
        type: "date",
        date: {
          start:
            typeof task.createdAt === "string"
              ? new Date(task.createdAt).toISOString()
              : task.createdAt.toISOString(),
        },
      },
      "Synced At": {
        type: "date",
        date: {
          start: new Date().toISOString(),
        },
      },
      Status: {
        type: "select",
        select: {
          name: mapJiraStatusToTaskStatus({
            jiraStatus: task.status,
          }),
        },
      },
      Tags: {
        type: "multi_select",
        multi_select: task.tags.map((tag) => ({
          name: tag,
        })),
      },
      Self: {
        type: "url",
        url: task.self,
      },
      "Source Type": {
        type: "select",
        select: {
          name: task.sourceType,
        },
      },
      "Source ID": {
        type: "rich_text",
        rich_text: [
          {
            text: {
              content: task.sourceId,
            },
          },
        ],
      },
    },
  });
}

export async function upsertTask({
  databaseId,
  task,
  notionClient,
  performUpdate,
}: {
  databaseId: string;
  task: InsertTaskDbRecord;
  notionClient: NotionClient;
  performUpdate: (props: {
    notionClient: NotionClient;
    pageId: string;
  }) => Promise<unknown>;
}) {
  const getDatabasePageResponse = await notionClient.databases.query({
    database_id: databaseId,
    filter: {
      property: "Self",
      url: {
        equals: task.self,
      },
    },
  });

  if (!getDatabasePageResponse.results.length) {
    return await createTask({
      databaseId,
      notionClient,
      task,
    });
  }

  const page = getDatabasePageResponse.results[0];
  const pageId = page.id;

  return await performUpdate({
    notionClient,
    pageId,
  });
}
