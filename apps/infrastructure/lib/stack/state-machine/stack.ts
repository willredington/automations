import * as cdk from "aws-cdk-lib";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import * as sf from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";
import { join } from "path";
import { AppEnvironmentVariable, getEnvironmentVariable } from "../../util/env";

const getLambdaRelativeDirPath = (lambdaName: string) => {
  return join(__dirname, "lambda", lambdaName);
};

type StateMachineStackProps = cdk.NestedStackProps & {
  targetFigmaFileKeys: string[];
};

export class StateMachineStack extends cdk.NestedStack {
  constructor(scope: Construct, id: string, props: StateMachineStackProps) {
    super(scope, id, props);

    const getJiraIssuesLambda = new nodejs.NodejsFunction(
      this,
      "GetJiraIssuesLambda",
      {
        entry: getLambdaRelativeDirPath("get-jira-issues.ts"),
        timeout: cdk.Duration.seconds(30),
      }
    );

    const getRvoJiraIssuesTask = new tasks.LambdaInvoke(
      this,
      "GetRvoJiraIssuesTask",
      {
        lambdaFunction: getJiraIssuesLambda,
        payload: sf.TaskInput.fromObject({
          jiraApiUrl: getEnvironmentVariable(
            AppEnvironmentVariable.RVO_JIRA_API_URL
          ),
          jiraEmail: getEnvironmentVariable(
            AppEnvironmentVariable.RVO_JIRA_EMAIL
          ),
          jiraApiToken: getEnvironmentVariable(
            AppEnvironmentVariable.RVO_JIRA_API_TOKEN
          ),
        }),
        resultPath: "$.jiraIssues",
      }
    );

    const getFigmaConversationsLambda = new nodejs.NodejsFunction(
      this,
      "GetFigmaConversationsLambda",
      {
        entry: getLambdaRelativeDirPath("get-figma-conversations.ts"),
        timeout: cdk.Duration.seconds(30),
      }
    );

    const getFigmaConversationsTask = new tasks.LambdaInvoke(
      this,
      "GetFigmaConversationsTask",
      {
        lambdaFunction: getFigmaConversationsLambda,
        payload: sf.TaskInput.fromObject({
          fileKeys: props.targetFigmaFileKeys,
          figmaApiToken: getEnvironmentVariable(
            AppEnvironmentVariable.FIGMA_API_TOKEN
          ),
          figmaUsername: getEnvironmentVariable(
            AppEnvironmentVariable.FIGMA_USERNAME
          ),
        }),
        resultPath: "$.figmaConversations",
      }
    );

    const generateFigmaTasksLambda = new nodejs.NodejsFunction(
      this,
      "GenerateFigmaTasksLambda",
      {
        entry: getLambdaRelativeDirPath("generate-figma-tasks.ts"),
        timeout: cdk.Duration.minutes(5),
        environment: {
          ANTHROPIC_API_KEY: getEnvironmentVariable(
            AppEnvironmentVariable.ANTHROPIC_API_KEY
          ),
        },
      }
    );

    const generateFigmaTasks = new tasks.LambdaInvoke(
      this,
      "GenerateFigmaTasks",
      {
        lambdaFunction: generateFigmaTasksLambda,
        payload: sf.TaskInput.fromObject({
          "figmaConversations.$": "$.figmaConversations.Payload",
          figmaUsername: getEnvironmentVariable(
            AppEnvironmentVariable.FIGMA_USERNAME
          ),
        }),
        resultPath: "$.generatedFigmaTasks",
      }
    );

    const processFigmaConversationsLambda = new nodejs.NodejsFunction(
      this,
      "ProcessFigmaConversationsLambda",
      {
        entry: getLambdaRelativeDirPath("process-figma-conversations.ts"),
        timeout: cdk.Duration.minutes(5),
      }
    );

    const processFigmaConversationsTask = new tasks.LambdaInvoke(
      this,
      "ProcessFigmaConversationsTask",
      {
        lambdaFunction: processFigmaConversationsLambda,
        payload: sf.TaskInput.fromObject({
          "figmaTasks.$": "$.generatedFigmaTasks.Payload",
          "figmaConversations.$": "$.figmaConversations.Payload",
        }),
        resultPath: "$.figmaTasks",
      }
    );

    const processJiraIssuesLambda = new nodejs.NodejsFunction(
      this,
      "ProcessJiraIssuesLambda",
      {
        entry: getLambdaRelativeDirPath("process-jira-issues.ts"),
        timeout: cdk.Duration.minutes(5),
      }
    );

    const processJiraIssuesTask = new tasks.LambdaInvoke(
      this,
      "ProcessJiraIssuesTask",
      {
        lambdaFunction: processJiraIssuesLambda,
        payload: sf.TaskInput.fromObject({
          "jiraIssues.$": "$.jiraIssues.Payload",
        }),
        resultPath: "$.jiraTasks",
      }
    );

    const generateTagsLambda = new nodejs.NodejsFunction(
      this,
      "GenerateTagsLambda",
      {
        entry: getLambdaRelativeDirPath("generate-tags.ts"),
        timeout: cdk.Duration.minutes(15),
        environment: {
          ANTHROPIC_API_KEY: getEnvironmentVariable(
            AppEnvironmentVariable.ANTHROPIC_API_KEY
          ),
        },
      }
    );

    const generateTagsTask = new tasks.LambdaInvoke(this, "GenerateTagsTask", {
      lambdaFunction: generateTagsLambda,
      payload: sf.TaskInput.fromObject({
        "jiraTasks.$": "$.jiraTasks.Payload",
        "figmaTasks.$": "$.figmaTasks.Payload",
      }),
      resultPath: "$.tasksWithTags",
    });

    const upsertTasksLambda = new nodejs.NodejsFunction(
      this,
      "UpsertTasksLambda",
      {
        entry: getLambdaRelativeDirPath("upsert-tasks.ts"),
        timeout: cdk.Duration.minutes(15),
        environment: {
          NOTION_DB_ID: getEnvironmentVariable(
            AppEnvironmentVariable.NOTION_DB_ID
          ),
          NOTION_API_TOKEN: getEnvironmentVariable(
            AppEnvironmentVariable.NOTION_API_TOKEN
          ),
        },
      }
    );

    const upsertTasks = new tasks.LambdaInvoke(this, "UpsertTasks", {
      lambdaFunction: upsertTasksLambda,
      payload: sf.TaskInput.fromObject({
        "tasksWithTags.$": "$.tasksWithTags.Payload",
      }),
    });

    const parallelBranch = new sf.Parallel(this, "ParallelBranch")
      .branch(getRvoJiraIssuesTask.next(processJiraIssuesTask))
      .branch(
        getFigmaConversationsTask
          .next(generateFigmaTasks)
          .next(processFigmaConversationsTask)
      );

    // Merge the outputs of the parallel branches into a single object
    const mergeTasks = new sf.Pass(this, "MergeTasks", {
      parameters: {
        "jiraTasks.$": "$[0].jiraTasks",
        "figmaTasks.$": "$[1].figmaTasks",
      },
    });

    const stateMachineDefinition = parallelBranch
      .next(mergeTasks)
      .next(generateTagsTask)
      .next(upsertTasks);

    const stateMachine = new sf.StateMachine(this, "StateMachine", {
      definition: stateMachineDefinition,
    });

    const notificationTopic = new sns.Topic(
      this,
      "AutomationStateMachineNotifications"
    );

    notificationTopic.addSubscription(
      new subscriptions.EmailSubscription("will86325@gmail.com")
    );

    new events.Rule(this, "AutomationStateMachineExecutionFailedRule", {
      eventPattern: {
        source: ["aws.states"],
        detailType: ["Step Functions Execution Failed"],
        detail: {
          stateMachineArn: [stateMachine.stateMachineArn],
        },
      },
      targets: [new targets.SnsTopic(notificationTopic)],
    });

    new events.Rule(this, "AutomationStateMachineHourlySchedule", {
      schedule: events.Schedule.cron({
        minute: "0",
        hour: "12-23,0-3",
        weekDay: "MON-FRI",
      }),
      targets: [new targets.SfnStateMachine(stateMachine)],
    });

    new cdk.CfnOutput(this, "StateMachineArn", {
      value: stateMachine.stateMachineArn,
    });
  }
}
