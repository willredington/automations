import { TaskStatus } from "./type";

export function mapJiraStatusToTaskStatus({
  jiraStatus,
}: {
  jiraStatus: string;
}): TaskStatus {
  // Normalize: lowercase, remove spaces, dashes, underscores
  const norm = (s: string) => s.replace(/\s|_|-/g, "").toLowerCase();
  const status = norm(jiraStatus);

  // TODO
  if (
    ["todo", "todolist", "backlog", "open", "ready", "tobeplanned"].some(
      (key) => status.includes(key)
    )
  ) {
    return TaskStatus.TODO;
  }
  // IN_PROGRESS
  if (
    [
      "inprogress",
      "started",
      "active",
      "working",
      "implementation",
      "developing",
      "doing",
    ].some((key) => status.includes(key))
  ) {
    return TaskStatus.IN_PROGRESS;
  }
  // IN_REVIEW
  if (
    ["inreview", "review", "qa", "code review", "testing", "verification"].some(
      (key) => status.includes(key)
    )
  ) {
    return TaskStatus.IN_REVIEW;
  }
  // BLOCKED
  if (
    ["blocked", "onhold", "waiting", "stalled", "impediment"].some((key) =>
      status.includes(key)
    )
  ) {
    return TaskStatus.BLOCKED;
  }
  // DONE
  if (
    [
      "done",
      "closed",
      "resolved",
      "complete",
      "finished",
      "released",
      "approved",
    ].some((key) => status.includes(key))
  ) {
    return TaskStatus.DONE;
  }

  // Default
  return TaskStatus.TODO;
}
