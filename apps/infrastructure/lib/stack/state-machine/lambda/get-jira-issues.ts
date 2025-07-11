import { Handler } from "aws-lambda";
import { z } from "zod";
import { getJiraIssues } from "../../../domain/jira";

const ExpectedEvent = z.object({
  jiraApiUrl: z.string(),
  jiraEmail: z.string(),
  jiraApiToken: z.string(),
  maxResults: z.number().optional(),
});

export const handler: Handler = async (incomingEvent) => {
  console.log(JSON.stringify(incomingEvent, null, 2));

  const event = ExpectedEvent.parse(incomingEvent);

  return await getJiraIssues({
    jiraApiUrl: event.jiraApiUrl,
    jiraEmail: event.jiraEmail,
    jiraApiToken: event.jiraApiToken,
    maxResults: event.maxResults,
  });
};
