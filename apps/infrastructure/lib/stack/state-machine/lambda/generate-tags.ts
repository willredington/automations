import { Handler } from "aws-lambda";
import { getTagsForTasks } from "../../../domain/ai";
import { InsertTaskDbRecord } from "../../../domain/task";

export const handler: Handler = async (event: {
  jiraTasks: InsertTaskDbRecord[];
  figmaTasks: InsertTaskDbRecord[];
}) => {
  console.log(JSON.stringify(event, null, 2));

  const { jiraTasks, figmaTasks } = event;

  return await getTagsForTasks({
    tasks: [...jiraTasks, ...figmaTasks],
  });
};
