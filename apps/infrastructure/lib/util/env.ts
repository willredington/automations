import { z } from "zod";

export enum AppEnvironmentVariable {
  NOTION_DB_ID = "NOTION_DB_ID",
  NOTION_API_TOKEN = "NOTION_API_TOKEN",
  RVO_JIRA_API_URL = "RVO_JIRA_API_URL",
  RVO_JIRA_EMAIL = "RVO_JIRA_EMAIL",
  RVO_JIRA_API_TOKEN = "RVO_JIRA_API_TOKEN",
  FIGMA_API_TOKEN = "FIGMA_API_TOKEN",
  FIGMA_USERNAME = "FIGMA_USERNAME",
  ANTHROPIC_API_KEY = "ANTHROPIC_API_KEY",
}

export function getEnvironmentVariable(envVar: AppEnvironmentVariable) {
  try {
    return z.string().parse(process.env[envVar]);
  } catch {
    throw new Error(`Missing environment variable: ${envVar}`);
  }
}
