import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyHandler } from "aws-lambda";
import { log } from "/opt/logging";

const dynamo = new DynamoDB({});

export const handler: APIGatewayProxyHandler = async (event) => {
  log("update event");
  if (!event.queryStringParameters || !event.queryStringParameters.id) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "id is required",
      }),
    };
  }

  const id = event.queryStringParameters.id;
  if (event.body === null) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "body is required",
      }),
    };
  }

  const body = JSON.parse(event.body) as { name: string };
  if (!body.name) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "name is required",
      }),
    };
  }

  await dynamo.updateItem({
    TableName: "SANDBOX_ITEMS",
    Key: {
      id: { S: id },
    },
    UpdateExpression: "SET #name = :name",
    ExpressionAttributeNames: {
      "#name": "name",
    },
    ExpressionAttributeValues: {
      ":name": { S: body.name },
    },
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      item: {
        id,
        name: body.name,
      },
    }),
  };
};
