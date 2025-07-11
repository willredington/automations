figma

- upsert should be smarter (shouldn't really do anything)
- should mention the original author of the comment

jira

- needs minor refinement

linking

- link together disparate tasks (jira and figma, as well as linked jira issues (or issues that should be linked and are not))

general

- upsert should always update existing items in notion for the sync date

- spec and mapping alignment
- spec and mapping ticket
  - track changes from figma comments
  - any change to either will require a change to both

batch workflow

1. get jira issues
2. get figma comments, extract tasks

jira issue workflow

1. mapping issue to notion tasks
2. is this issue a spec or mapping ticket?
   - yes: add a tag indicating we need to make the linkage
     - mapping ticket: link to api spec (1 item)
     - spec ticket: link to mapping and backend ticket (2 items)
   - no: NOOP
3. does the task exist in notion? use formula for days open
   yes:
   - update the task (status, comments, description, title)
     no:
   - create the task

figma workflow (TODO)
