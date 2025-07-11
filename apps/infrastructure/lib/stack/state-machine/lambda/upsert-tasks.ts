import { Handler } from "aws-lambda";
import { makeNotionClient } from "../../../domain/notion/client";
import {
  InsertTaskDbRecord,
  mapJiraStatusToTaskStatus,
  upsertTask,
} from "../../../domain/task";
import {
  AppEnvironmentVariable,
  getEnvironmentVariable,
} from "../../../util/env";

async function upsertJiraTask({
  task,
  notionClient,
}: {
  task: InsertTaskDbRecord;
  notionClient: any;
}) {
  return upsertTask({
    task,
    notionClient,
    databaseId: getEnvironmentVariable(AppEnvironmentVariable.NOTION_DB_ID),
    performUpdate: async ({ notionClient, pageId }) => {
      return await notionClient.pages.update({
        page_id: pageId,
        properties: {
          Status: {
            type: "select",
            select: {
              name: mapJiraStatusToTaskStatus({
                jiraStatus: task.status,
              }),
            },
          },
          "Synced At": {
            type: "date",
            date: {
              start: new Date().toISOString(),
            },
          },
        },
      });
    },
  });
}

async function upsertFigmaTask({
  task,
  notionClient,
}: {
  task: InsertTaskDbRecord;
  notionClient: any;
}) {
  return upsertTask({
    task,
    notionClient,
    databaseId: getEnvironmentVariable(AppEnvironmentVariable.NOTION_DB_ID),
    performUpdate: async ({ notionClient, pageId }) => {
      return await notionClient.pages.update({
        page_id: pageId,
        properties: {
          "Synced At": {
            type: "date",
            date: {
              start: new Date().toISOString(),
            },
          },
        },
      });
    },
  });
}

export const handler: Handler = async (event: {
  tasksWithTags: InsertTaskDbRecord[];
}) => {
  console.log(JSON.stringify(event, null, 2));

  const notionClient = makeNotionClient();

  const { tasksWithTags } = event;

  for (const task of tasksWithTags) {
    if (task.sourceType === "JIRA") {
      await upsertJiraTask({ task, notionClient });
    } else if (task.sourceType === "FIGMA") {
      await upsertFigmaTask({ task, notionClient });
    } else {
      throw new Error("Unsupported task source type");
    }
  }
};
