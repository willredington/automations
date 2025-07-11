#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import "dotenv/config";
import { InfrastructureStack } from "../lib/infrastructure-stack";

const app = new cdk.App();

new InfrastructureStack(app, "DevAutomationInfrastructureStack", {
  env: {
    account: "202533531668",
    region: "us-east-2",
  },
});
