import axios from "axios";
import { JiraIssue, JiraSearchResponse } from "./type";

export async function getJiraIssues({
  jiraApiUrl,
  jiraEmail,
  jiraApiToken,
  maxResults,
}: {
  jiraApiUrl: string;
  jiraEmail: string;
  jiraApiToken: string;
  maxResults?: number;
}): Promise<JiraIssue[]> {
  const response = await axios.post<JiraSearchResponse>(
    `${jiraApiUrl}/search`,
    {
      jql: "assignee = currentUser() AND issuetype != 'Epic' AND status not in (Done, Cancelled, Release)",
      fields: ["summary", "description", "status", "created"],
      maxResults: maxResults ?? 100,
    },
    {
      auth: {
        username: jiraEmail,
        password: jiraApiToken,
      },
    }
  );

  return JiraSearchResponse.parse(response.data).issues;
}
