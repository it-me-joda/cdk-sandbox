import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyHandler } from "aws-lambda";
import { log } from "/opt/logging";

const dynamo = new DynamoDB({});

export const handler: APIGatewayProxyHandler = async (event) => {
  log("read event", event.queryStringParameters);
  
  if (!event.queryStringParameters || !event.queryStringParameters.id) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "id is required",
      }),
    };
  }

  const id = event.queryStringParameters.id;
  const result = await dynamo.getItem({
    TableName: "SANDBOX_ITEMS",
    Key: {
      id: { S: id },
    },
  });

  if (!result.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: "item not found",
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      item: {
        id,
        name: result.Item.name.S,
      },
    }),
  };
};
