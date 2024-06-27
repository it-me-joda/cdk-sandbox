import { APIGatewayProxyHandler } from "aws-lambda";
import { randomUUID } from "crypto";
import { log } from "/opt/logging";
import { DynamoDB } from "@aws-sdk/client-dynamodb";

const dynamo = new DynamoDB({});

export const handler: APIGatewayProxyHandler = async (event) => {
  log("create event");
  if (event.body === null) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "body is required",
      }),
    };
  }

  const body = JSON.parse(event.body) as { name: string };
  log(`body: ${event.body}`);
  if (!body.name) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "name is required",
      }),
    };
  }

  const id = randomUUID();
  await dynamo.putItem({
    TableName: "SANDBOX_ITEMS",
    Item: {
      id: { S: id },
      name: { S: body.name },
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
