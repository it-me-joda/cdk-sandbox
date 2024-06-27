#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CdkSandboxStack } from "../lib/cdk-sandbox-stack";
import { config } from "dotenv";

config();

const app = new cdk.App();
new CdkSandboxStack(app, "CdkSandboxStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
