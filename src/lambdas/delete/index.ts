import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyHandler } from "aws-lambda";
import { log } from "/opt/logging";

const dynamo = new DynamoDB({});

export const handler: APIGatewayProxyHandler = async (event) => {
  log("delete event", event.queryStringParameters);
  
  if (!event.queryStringParameters || !event.queryStringParameters.id) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "id is required",
      }),
    };
  }

  const id = event.queryStringParameters.id;
  await dynamo.deleteItem({
    TableName: "SANDBOX_ITEMS",
    Key: {
      id: { S: id },
    },
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "item deleted",
    }),
  };
};
