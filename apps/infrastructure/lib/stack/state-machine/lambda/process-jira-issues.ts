import { Handler } from "aws-lambda";
import { z } from "zod";
import { JiraIssue, mapJiraIssueToTask } from "../../../domain/jira";

const ExpectedEvent = z.object({
  jiraIssues: z.array(JiraIssue),
});

export const handler: Handler = async (incomingEvent) => {
  console.log(JSON.stringify(incomingEvent, null, 2));

  const { jiraIssues } = ExpectedEvent.parse(incomingEvent);

  return jiraIssues.map((jiraIssue) =>
    mapJiraIssueToTask({
      jiraIssue,
    })
  );
};
