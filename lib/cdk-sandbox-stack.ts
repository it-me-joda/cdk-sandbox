import * as cdk from 'aws-cdk-lib'
import { ParameterMapping } from 'aws-cdk-lib/aws-apigatewayv2'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { DefinitionBody } from 'aws-cdk-lib/aws-stepfunctions'
import { Construct } from 'constructs'

export class CdkSandboxStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props)

		const itemsTable = new cdk.aws_dynamodb.Table(
			this,
			'CDKSandboxDynamo',
			{
				partitionKey: {
					name: 'id',
					type: cdk.aws_dynamodb.AttributeType.STRING,
				},
				removalPolicy: cdk.RemovalPolicy.DESTROY,
				billingMode: cdk.aws_dynamodb.BillingMode.PAY_PER_REQUEST,
				tableName: 'SANDBOX_ITEMS',
				tableClass: cdk.aws_dynamodb.TableClass.STANDARD,
			}
		)

		const loggingLayer = new cdk.aws_lambda.LayerVersion(
			this,
			'LambdaLoggingLayer',
			{
				code: cdk.aws_lambda.Code.fromAsset('src/layers/logging'),
				compatibleRuntimes: [cdk.aws_lambda.Runtime.NODEJS_20_X],
			}
		)

		const createLambda = new NodejsFunction(this, 'CreateFunction', {
			runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
			architecture: cdk.aws_lambda.Architecture.ARM_64,
			handler: 'handler',
			entry: 'src/lambdas/create/index.ts',
			bundling: {
				minify: false,
				externalModules: ['logging'],
				forceDockerBundling: false,
				sourceMap: true,
			},
		})
		itemsTable.grantReadWriteData(createLambda)

		const readLambda = new NodejsFunction(this, 'ReadFunction', {
			runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
			architecture: cdk.aws_lambda.Architecture.ARM_64,
			layers: [loggingLayer],
			handler: 'handler',
			entry: 'src/lambdas/read/index.ts',
			bundling: {
				minify: false,
				externalModules: ['logging'],
				forceDockerBundling: false,
				sourceMap: true,
			},
		})
		itemsTable.grantReadData(readLambda)

		const updateLambda = new NodejsFunction(this, 'UpdateFunction', {
			runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
			architecture: cdk.aws_lambda.Architecture.ARM_64,
			layers: [loggingLayer],
			handler: 'handler',
			entry: 'src/lambdas/update/index.ts',
			bundling: {
				minify: false,
				externalModules: ['logging'],
				forceDockerBundling: false,
				sourceMap: true,
			},
		})
		itemsTable.grantReadWriteData(updateLambda)

		const deleteLambda = new NodejsFunction(this, 'DeleteFunction', {
			runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
			architecture: cdk.aws_lambda.Architecture.ARM_64,
			layers: [loggingLayer],
			handler: 'handler',
			entry: 'src/lambdas/delete/index.ts',
			bundling: {
				minify: false,
				externalModules: ['logging'],
				forceDockerBundling: false,
				sourceMap: true,
			},
		})
		itemsTable.grantReadWriteData(deleteLambda)

		const readAllLambda = new NodejsFunction(this, 'ReadAllFunction', {
			runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
			architecture: cdk.aws_lambda.Architecture.ARM_64,
			layers: [loggingLayer],
			handler: 'handler',
			entry: 'src/lambdas/read-all/index.ts',
			bundling: {
				minify: false,
				externalModules: ['logging'],
				forceDockerBundling: false,
				sourceMap: true,
			},
		})
		itemsTable.grantReadData(readAllLambda)

		const api = new cdk.aws_apigateway.RestApi(this, 'CRUDApi', {
			restApiName: 'CRUD API',
			description: 'API for CRUD operations',
			deployOptions: {
				stageName: 'dev',
			},
		})

		const item = api.root.addResource('item')

		const createIntegration = new cdk.aws_apigateway.LambdaIntegration(
			createLambda
		)
		item.addMethod('POST', createIntegration)

		const readIntegration = new cdk.aws_apigateway.LambdaIntegration(
			readLambda
		)
		item.addMethod('GET', readIntegration)

		const updateIntegration = new cdk.aws_apigateway.LambdaIntegration(
			updateLambda
		)
		item.addMethod('PUT', updateIntegration)

		const deleteIntegration = new cdk.aws_apigateway.LambdaIntegration(
			deleteLambda
		)
		item.addMethod('DELETE', deleteIntegration)

		const readAllIntegration = new cdk.aws_apigateway.LambdaIntegration(
			readAllLambda
		)
		api.root.addResource('items').addMethod('GET', readAllIntegration)

		const stepFunctionTable = new cdk.aws_dynamodb.Table(
			this,
			'StepFunctionTable',
			{
				partitionKey: {
					name: 'id',
					type: cdk.aws_dynamodb.AttributeType.STRING,
				},
				removalPolicy: cdk.RemovalPolicy.DESTROY,
				billingMode: cdk.aws_dynamodb.BillingMode.PAY_PER_REQUEST,
				tableName: 'STEPFUNCTION_ITEMS',
				tableClass: cdk.aws_dynamodb.TableClass.STANDARD,
			}
		)

		// start function will take a payload and create a record for it in the dynamo
		const startFunction = new NodejsFunction(this, 'StartFunction', {
			runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
			architecture: cdk.aws_lambda.Architecture.ARM_64,
			layers: [loggingLayer],
			handler: 'handler',
			entry: 'src/lambdas/step-function/start/index.ts',
			bundling: {
				minify: false,
				externalModules: ['logging'],
				forceDockerBundling: false,
				sourceMap: true,
			},
		})
		stepFunctionTable.grantReadWriteData(startFunction)

		// middle function will take a payload and update the record in the dynamo (doubling the value of the record)
		const middleFunction = new NodejsFunction(this, 'MiddleFunction', {
			runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
			architecture: cdk.aws_lambda.Architecture.ARM_64,
			layers: [loggingLayer],
			handler: 'handler',
			entry: 'src/lambdas/step-function/middle/index.ts',
			bundling: {
				minify: false,
				externalModules: ['logging'],
				forceDockerBundling: false,
				sourceMap: true,
			},
		})
		stepFunctionTable.grantReadWriteData(middleFunction)

		// end function will take a payload and soft delete the record in the dynamo
		const endFunction = new NodejsFunction(this, 'EndFunction', {
			runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
			architecture: cdk.aws_lambda.Architecture.ARM_64,
			layers: [loggingLayer],
			handler: 'handler',
			entry: 'src/lambdas/step-function/end/index.ts',
			bundling: {
				minify: false,
				externalModules: ['logging'],
				forceDockerBundling: false,
				sourceMap: true,
			},
		})
		stepFunctionTable.grantReadWriteData(endFunction)

		const startTask = new cdk.aws_stepfunctions_tasks.LambdaInvoke(
			this,
			'StartTask',
			{
				lambdaFunction: startFunction,
				inputPath: '$',
				outputPath: '$.Payload',
			}
		)

		const middleJob = new cdk.aws_stepfunctions_tasks.LambdaInvoke(
			this,
			'MiddleJob',
			{
				lambdaFunction: middleFunction,
				outputPath: '$.Payload',
			}
		)

		const endJob = new cdk.aws_stepfunctions_tasks.LambdaInvoke(
			this,
			'EndJob',
			{
				lambdaFunction: endFunction,
				outputPath: '$.Payload',
			}
		)

		const definition = startTask.next(middleJob).next(endJob)

		const stepFunction = new cdk.aws_stepfunctions.StateMachine(
			this,
			'StepFunction',
			{
				definitionBody: DefinitionBody.fromChainable(definition),
				stateMachineType:
					cdk.aws_stepfunctions.StateMachineType.STANDARD,
			}
		)

		const stepFunctionIntegration =
			new cdk.aws_apigatewayv2_integrations.HttpStepFunctionsIntegration(
				'StepFunctionIntegration',
				{
					parameterMapping: new ParameterMapping()
						.custom('Input', '$request.body')
						.custom(
							'StateMachineArn',
							stepFunction.stateMachineArn
						),
					stateMachine: stepFunction,
					subtype:
						cdk.aws_apigatewayv2.HttpIntegrationSubtype
							.STEPFUNCTIONS_START_EXECUTION,
				}
			)

		const stepFunctionApi = new cdk.aws_apigatewayv2.HttpApi(
			this,
			'StepFunctionApi',
			{
				apiName: 'StepFunctionApi',
			}
		)

		stepFunctionApi.addStage('dev', {
			stageName: 'dev',
			autoDeploy: true,
		})

		stepFunctionApi.addStage('prod', {
			stageName: 'prod',
		})

		stepFunctionApi.addRoutes({
			path: '/start',
			methods: [cdk.aws_apigatewayv2.HttpMethod.POST],
			integration: stepFunctionIntegration,
		})

		new cdk.CfnOutput(this, 'StepFunctionApiUrl', {
			value: stepFunctionApi.url ?? 'No URL',
		})

		new cdk.CfnOutput(this, 'CloudFormation URL', {
			value: `https://${this.region}.console.aws.amazon.com/cloudformation/home?region=${this.region}#/stacks/stackinfo?filteringText=&filteringStatus=active&viewNested=true&hideStacks=false&stackId=${this.stackId}`,
		})
	}
}
