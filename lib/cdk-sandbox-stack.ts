import * as cdk from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

export class CdkSandboxStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new cdk.aws_dynamodb.Table(this, "CDKSandboxDynamo", {
      partitionKey: { name: "id", type: cdk.aws_dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      billingMode: cdk.aws_dynamodb.BillingMode.PAY_PER_REQUEST,
      tableName: "SANDBOX_ITEMS",
      tableClass: cdk.aws_dynamodb.TableClass.STANDARD,
    });

    const loggingLayer = new cdk.aws_lambda.LayerVersion(
      this,
      "LambdaLoggingLayer",
      {
        code: cdk.aws_lambda.Code.fromAsset("src/layers/logging"),
        compatibleRuntimes: [cdk.aws_lambda.Runtime.NODEJS_20_X],
      },
    );

    const createLambda = new NodejsFunction(this, "CreateFunction", {
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      architecture: cdk.aws_lambda.Architecture.ARM_64,
      handler: "handler",
      entry: "src/lambdas/create/index.ts",
      bundling: {
        minify: false,
        externalModules: ["logging"],
        forceDockerBundling: false,
        sourceMap: true,
      },
    });
    table.grantReadWriteData(createLambda);

    const readLambda = new NodejsFunction(this, "ReadFunction", {
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      architecture: cdk.aws_lambda.Architecture.ARM_64,
      layers: [loggingLayer],
      handler: "handler",
      entry: "src/lambdas/read/index.ts",
      bundling: {
        minify: false,
        externalModules: ["logging"],
        forceDockerBundling: false,
        sourceMap: true,
      },
    });
    table.grantReadData(readLambda);

    const updateLambda = new NodejsFunction(this, "UpdateFunction", {
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      architecture: cdk.aws_lambda.Architecture.ARM_64,
      layers: [loggingLayer],
      handler: "handler",
      entry: "src/lambdas/update/index.ts",
      bundling: {
        minify: false,
        externalModules: ["logging"],
        forceDockerBundling: false,
        sourceMap: true, 
      },
    });
    table.grantReadWriteData(updateLambda);

    const deleteLambda = new NodejsFunction(this, "DeleteFunction", {
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      architecture: cdk.aws_lambda.Architecture.ARM_64,
      layers: [loggingLayer],
      handler: "handler",
      entry: "src/lambdas/delete/index.ts",
      bundling: {
        minify: false,
        externalModules: ["logging"],
        forceDockerBundling: false,
        sourceMap: true,
      },
    });
    table.grantReadWriteData(deleteLambda);

    const readAllLambda = new NodejsFunction(this, "ReadAllFunction", {
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      architecture: cdk.aws_lambda.Architecture.ARM_64,
      layers: [loggingLayer],
      handler: "handler",
      entry: "src/lambdas/read-all/index.ts",
      bundling: {
        minify: false,
        externalModules: ["logging"],
        forceDockerBundling: false,
        sourceMap: true,
      },
    });
    table.grantReadData(readAllLambda);

    const api = new cdk.aws_apigateway.RestApi(this, "CRUDApi", {
      restApiName: "CRUD API",
      description: "API for CRUD operations",
      deployOptions: {
        stageName: "dev",
      },
    });
    const item = api.root.addResource("item");

    const createIntegration = new cdk.aws_apigateway.LambdaIntegration(
      createLambda,
    );
    item.addMethod("POST", createIntegration);

    const readIntegration = new cdk.aws_apigateway.LambdaIntegration(
      readLambda,
    );
    item.addMethod("GET", readIntegration);

    const updateIntegration = new cdk.aws_apigateway.LambdaIntegration(
      updateLambda,
    );
    item.addMethod("PUT", updateIntegration);

    const deleteIntegration = new cdk.aws_apigateway.LambdaIntegration(
      deleteLambda,
    );
    item.addMethod("DELETE", deleteIntegration);

    const readAllIntegration = new cdk.aws_apigateway.LambdaIntegration(
      readAllLambda,
    );
    api.root.addResource("items").addMethod("GET", readAllIntegration);
  }
}
