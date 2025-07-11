import { InsertTaskDbRecord } from "../task";
import { mapJiraStatusToTaskStatus } from "../task/util";
import { JiraIssue } from "./type";

function extractLinks({
  jiraDescription,
}: {
  jiraDescription: string;
}): string[] {
  const links = new Set<string>();

  for (const match of jiraDescription.matchAll(/https?:\/\/[^\s<>"']+/g)) {
    if (match) {
      links.add(match[0]);
    }
  }

  return Array.from(links);
}

function extractJiraUserLink({ jiraIssue }: { jiraIssue: JiraIssue }) {
  const selfUrl = jiraIssue.self;
  const issueKey = jiraIssue.key;

  const url = new URL(selfUrl);
  const baseUrl = `${url.protocol}//${url.hostname}`;

  return `${baseUrl}/browse/${issueKey}`;
}

export function mapJiraIssueToTask({
  jiraIssue,
}: {
  jiraIssue: JiraIssue;
}): InsertTaskDbRecord {
  const createdAt = new Date(jiraIssue.fields.created);

  const description = JSON.stringify(jiraIssue.fields.description);

  const selfLink = extractJiraUserLink({ jiraIssue });

  const additionalLinks = extractLinks({
    jiraDescription: description,
  });

  const links = additionalLinks
    .map((link) => ({
      name: link,
      url: link,
    }))
    .filter((link) => link.url !== selfLink);

  const tags = [];

  if (additionalLinks.some((link) => link.includes("figma"))) {
    tags.push("figma");
  }

  if (additionalLinks.some((link) => link.includes("slack"))) {
    tags.push("slack");
  }

  return {
    links,
    createdAt,
    name: `${jiraIssue.key} - ${jiraIssue.fields.summary}`,
    description,
    sourceId: jiraIssue.key,
    sourceType: "JIRA",
    status: mapJiraStatusToTaskStatus({
      jiraStatus: jiraIssue.fields.status.name,
    }),
    self: selfLink,
    tags,
  };
}
