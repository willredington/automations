import { z } from "zod";

export const JiraIssue = z
  .object({
    id: z.string(),
    self: z.string(),
    key: z.string(),
    fields: z
      .object({
        summary: z.string(),
        created: z.string(),
        description: z.unknown(),
        status: z
          .object({
            name: z.string(),
          })
          .passthrough(),
      })
      .passthrough(),
  })
  .passthrough();

export const JiraSearchResponse = z
  .object({
    startAt: z.number(),
    maxResults: z.number(),
    total: z.number(),
    issues: z.array(JiraIssue),
  })
  .passthrough();

export type JiraIssue = z.infer<typeof JiraIssue>;

export type JiraSearchResponse = z.infer<typeof JiraSearchResponse>;
