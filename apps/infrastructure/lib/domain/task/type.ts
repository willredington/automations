import { BlockObjectRequest } from "@notionhq/client";

export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  IN_REVIEW = "IN_REVIEW",
  BLOCKED = "BLOCKED",
  DONE = "DONE",
  WONT_DO = "WONT_DO",
  UP_NEXT = "UP_NEXT",
}

export type InsertTaskDbRecord = {
  name: string;
  description?: string;
  contentBlocks?: BlockObjectRequest[];
  createdAt: Date;
  status: TaskStatus;
  tags: string[];
  links: Array<{ name: string; url: string }>;
  sourceType: string;
  sourceId: string;
  self: string;
};
