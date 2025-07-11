import { Client } from "@notionhq/client";
import { AppEnvironmentVariable, getEnvironmentVariable } from "../../util/env";

export function makeNotionClient() {
  return new Client({
    auth: getEnvironmentVariable(AppEnvironmentVariable.NOTION_API_TOKEN),
  });
}

export type NotionClient = ReturnType<typeof makeNotionClient>;
