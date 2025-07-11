import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { StateMachineStack } from "./stack/state-machine";

const FigmaFileKeyMap = {
  AsyncPerks: "Y3houA7xKVANITbRlqmpCa",
  RxSwap: "ldCn5soaKBx1jQJvRdVOIx",
};

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new StateMachineStack(this, "StateMachineStack", {
      targetFigmaFileKeys: [FigmaFileKeyMap.AsyncPerks, FigmaFileKeyMap.RxSwap],
    });
  }
}
