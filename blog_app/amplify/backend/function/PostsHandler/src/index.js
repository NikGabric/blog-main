/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();

const tableName = "dynamoBlogDB-dev";

exports.handler = async (event) => {
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
  };

  try {
    switch (event.httpMethod + " " + event.path) {
      //   case "DELETE /items/{id}":
      //     await dynamo
      //       .delete({
      //         TableName: "http-crud-tutorial-items",
      //         Key: {
      //           id: event.pathParameters.id,
      //         },
      //       })
      //       .promise();
      //     body = `Deleted item ${event.pathParameters.id}`;
      //     break;
      case "GET /posts/{postId}":
        body = await dynamo
          .get({
            TableName: tableName,
            Key: {
              id: event.pathParameters.postId,
            },
          })
          .promise();
        break;
      case "GET /posts":
        body = await dynamo.scan({ TableName: tableName }).promise();
        break;
      //   case "PUT /items":
      //     let requestJSON = JSON.parse(event.body);
      //     await dynamo
      //       .put({
      //         TableName: "http-crud-tutorial-items",
      //         Item: {
      //           id: requestJSON.id,
      //           price: requestJSON.price,
      //           name: requestJSON.name,
      //         },
      //       })
      //       .promise();
      //     body = `Put item ${requestJSON.id}`;
      //     break;
      default:
        throw new Error(
          `Unsupported route: ` + event.httpMethod + " " + event.path
        );
    }
  } catch (err) {
    statusCode = 400;
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers,
  };
};
