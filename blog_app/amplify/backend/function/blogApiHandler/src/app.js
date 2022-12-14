/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_DYNAMOBLOGDB_ARN
	STORAGE_DYNAMOBLOGDB_NAME
	STORAGE_DYNAMOBLOGDB_STREAMARN
	STORAGE_DYNAMOBLOG_ARN
	STORAGE_DYNAMOBLOG_NAME
	STORAGE_DYNAMOBLOG_STREAMARN
Amplify Params - DO NOT EDIT */ /*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

const AWS = require("aws-sdk");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
const bodyParser = require("body-parser");
const express = require("express");
const { v4: uuidv4 } = require("uuid");

AWS.config.update({ region: process.env.TABLE_REGION });

const dynamodb = new AWS.DynamoDB.DocumentClient();

let tableName = "dynamoBlog";
if (process.env.ENV && process.env.ENV !== "NONE") {
  tableName = tableName + "-" + process.env.ENV;
}

const userIdPresent = false; // TODO: update in case is required to use that definition
const partitionKeyName = "author";
const partitionKeyType = "S";
const sortKeyName = "title";
const sortKeyType = "S";
const hasSortKey = sortKeyName !== "";
const path = "/posts";
const UNAUTH = "UNAUTH";
const hashKeyPath = "/:" + partitionKeyName;
const sortKeyPath = hasSortKey ? "/:" + sortKeyName : "";

// declare a new express app
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

// convert url string param to expected Type
const convertUrlType = (param, type) => {
  switch (type) {
    case "N":
      return Number.parseInt(param);
    default:
      return param;
  }
};

/********************************
 * HTTP Get method for list objects *
 ********************************/

app.get(path, function (request, response) {
  let params = {
    TableName: tableName,
    limit: 100,
  };
  dynamodb.scan(params, (error, result) => {
    if (error) {
      response.statusCode = 500;
      response.json({ error: error.message });
      return;
    } else {
      for (var i = 0; i < result.Items.length; i++) {
        if (result.Items[i].title.startsWith("COMMENT#")) {
          result.Items.splice(i, 1);
          i--;
        }
      }
      response.statusCode = 200;
      response.json({
        url: request.url,
        body: JSON.stringify(result.Items),
      });
      return;
    }
  });
});

app.get("/posts/comments/:postId", function (request, response) {
  let params = {
    TableName: tableName,
    KeyConditionExpression: "#pk= :pk And begins_with(#sk, :sk)",
    ExpressionAttributeValues: {
      ":pk": request.params.postId,
      ":sk": "COMMENT#",
    },
    ExpressionAttributeNames: {
      "#pk": "id",
      "#sk": "title",
    },
    limit: 100,
  };
  dynamodb.query(params, (error, result) => {
    if (error) {
      response.statusCode = 500;
      response.json({ error: error.message });
      return;
    } else {
      response.statusCode = 200;
      response.json({
        url: request.url,
        body: JSON.stringify(result.Items),
      });
      return;
    }
  });
});

/*****************************************
 * HTTP Get method for get single object *
 *****************************************/

app.get("/posts/post/:postTitle/:postId", function (request, response) {
  let params = {
    TableName: tableName,
    Key: {
      id: request.params.postId,
      title: "POST#" + request.params.postTitle,
    },
  };
  dynamodb.get(params, (error, result) => {
    if (error) {
      response.statusCode = 500;
      response.json({ error: error.message });
      return;
    } else {
      response.statusCode = 200;
      response.json({
        url: request.url,
        body: JSON.stringify(result.Item),
      });
      return;
    }
  });
});

app.get("/posts/comment/:postId/:commentId", function (request, response) {
  let params = {
    TableName: tableName,
    KeyConditionExpression: "#pk = :pk And #sk = :sk",
    ExpressionAttributeValues: {
      ":pk": request.params.postId,
      ":sk": "COMMENT#" + request.params.commentId,
    },
    ExpressionAttributeNames: {
      "#pk": "id",
      "#sk": "title",
    },
  };
  dynamodb.query(params, (error, result) => {
    if (error) {
      response.statusCode = 500;
      response.json({ error: error.message });
      return;
    } else {
      response.statusCode = 200;
      response.json({
        url: request.url,
        body: JSON.stringify(result.Items),
      });
      return;
    }
  });
});

app.get("/posts/commentVotes/:postId/:commentId", function (request, response) {
  let params = {
    TableName: tableName,
    Key: {
      id: request.params.postId,
      title: "POST#" + request.params.commentId,
    },
  };
  dynamodb.get(params, (error, result) => {
    if (error) {
      response.statusCode = 500;
      response.json({ error: error.message });
      return;
    } else {
      response.statusCode = 200;
      response.json({
        url: request.url,
        body: JSON.stringify(result.Item),
      });
      return;
    }
  });
});

/************************************
 * HTTP put method for insert object *
 *************************************/

app.put("/posts/editPost", async function (request, response) {
  if (
    request.body.oldPostTitle === undefined ||
    request.body.content === undefined ||
    request.body.postTitle === undefined ||
    request.body.oldPostTitle === "" ||
    request.body.content === "" ||
    request.body.postTitle === "" ||
    request.body.postTitle.includes("/") ||
    request.body.postTitle.includes("#") ||
    request.body.postTitle.includes("%") ||
    request.body.title.includes("!")
  ) {
    response.statusCode = 403;
    response.json({
      text: "Nope!",
      error: "Forbidden",
      url: request.url,
    });
    return;
  }

  let checkIdParams = {
    TableName: tableName,
    Key: {
      id: request.body.id,
      title: "POST#" + request.body.oldPostTitle,
    },
  };
  await dynamodb.get(checkIdParams, async (error, res) => {
    if (error) {
      console.log(error);
    } else {
      console.log("res: ", res);
      let posterId = res.Item.userId;
      if (getUserId(request) === posterId) {
        const timestamp = new Date().toISOString();
        const params = {
          TableName: tableName,
          Key: {
            id: request.body.id,
            title: "POST#" + request.body.oldPostTitle,
          },
          ExpressionAttributeNames: {
            "#postTitle": "postTitle",
            "#content": "content",
          },
          ExpressionAttributeValues: {},
          ReturnValues: "UPDATED_NEW",
        };
        params.UpdateExpression = "SET ";
        if (request.body.postTitle) {
          params.ExpressionAttributeValues[":postTitle"] =
            request.body.postTitle;
          params.UpdateExpression += "#postTitle = :postTitle, ";
        }
        if (request.body.content) {
          params.ExpressionAttributeValues[":content"] = request.body.content;
          params.UpdateExpression += "#content = :content, ";
        }
        if (request.body.postTitle || request.body.content) {
          params.ExpressionAttributeValues[":updatedAt"] = timestamp;
          params.UpdateExpression += "updatedAt = :updatedAt";
        }
        dynamodb.update(params, (error, result) => {
          if (error) {
            response.statusCode = 500;
            response.json({
              error: error.message,
              url: request.url,
            });
            return;
          } else {
            response.statusCode = 200;
            response.json({
              url: request.url,
              body: JSON.stringify(result.Attributes),
            });
            return;
          }
        });
      } else {
        response.statusCode = 403;
        response.json({
          url: request.url,
          error: "Forbidden",
        });
        return;
      }
    }
  });
});

app.put("/posts/editComment", async function (request, response) {
  if (request.body.content === undefined || request.body.content === "") {
    response.statusCode = 403;
    response.json({
      text: "Nope!",
      error: "Forbidden",
      url: request.url,
    });
    return;
  }

  let checkIdParams = {
    TableName: tableName,
    Key: {
      id: request.body.id,
      title: request.body.title,
    },
  };
  await dynamodb.get(checkIdParams, async (error, res) => {
    if (error) {
      console.log(error);
    } else {
      console.log("res: ", res);
      let commenterId = res.Item.userId;
      if (getUserId(request) === commenterId) {
        const timestamp = new Date().toISOString();
        const params = {
          TableName: tableName,
          Key: {
            id: request.body.id,
            title: request.body.title,
          },
          ExpressionAttributeNames: {
            "#content": "content",
          },
          ExpressionAttributeValues: {},
          ReturnValues: "UPDATED_NEW",
        };
        params.UpdateExpression = "SET ";
        if (request.body.content) {
          params.ExpressionAttributeValues[":content"] = request.body.content;
          params.UpdateExpression += "#content = :content, ";
        }
        if (request.body.content) {
          params.ExpressionAttributeValues[":updatedAt"] = timestamp;
          params.UpdateExpression += "updatedAt = :updatedAt";
        }
        dynamodb.update(params, (error, result) => {
          if (error) {
            response.statusCode = 500;
            response.json({
              error: error.message,
              url: request.url,
            });
            return;
          } else {
            response.statusCode = 200;
            response.json({
              url: request.url,
              body: JSON.stringify(result.Attributes),
            });
            return;
          }
        });
      } else {
        response.statusCode = 403;
        response.json({
          url: request.url,
          error: "Forbidden",
        });
        return;
      }
    }
  });
});

// upvoting a comment
app.put("/posts/upvoteComment", function (request, response) {
  let params = {
    TableName: tableName,
    KeyConditionExpression: "#pk = :pk And #sk = :sk",
    ExpressionAttributeValues: {
      ":pk": request.body.id,
      ":sk": request.body.title,
    },
    ExpressionAttributeNames: {
      "#pk": "id",
      "#sk": "title",
    },
  };
  dynamodb.query(params, (error, result) => {
    if (error) {
      response.statusCode = 500;
      response.json({ error: error.message });
      return;
    } else {
      const upvoterIds = result.Items[0].upvoterIds;
      const downvoterIds = result.Items[0].downvoterIds;
      const reqUserId = getUserId(request);
      const downvoterIndex = downvoterIds.indexOf(reqUserId);
      const upvoterIndex = upvoterIds.indexOf(reqUserId);
      if (upvoterIndex < 0) {
        params = {
          TableName: tableName,
          Key: {
            id: request.body.id,
            title: request.body.title,
          },
          ExpressionAttributeNames: {
            "#upvoterIds": "upvoterIds",
          },
          ExpressionAttributeValues: {
            ":upvoterId": [reqUserId],
          },
          UpdateExpression:
            "set #upvoterIds = list_append(#upvoterIds, :upvoterId)",
          ReturnValues: "UPDATED_NEW",
        };

        if (downvoterIndex >= 0) {
          params.UpdateExpression +=
            " REMOVE downvoterIds[" + downvoterIndex + "]";
        }

        dynamodb.update(params, (error, result) => {
          if (error) {
            response.statusCode = 500;
            response.json({
              error: error.message,
              url: request.url,
            });
            return;
          } else {
            response.statusCode = 200;
            response.json({
              url: request.url,
              body: JSON.stringify(result.Attributes),
            });
            return;
          }
        });
      } else {
        const query = "REMOVE upvoterIds[" + upvoterIndex + "]";
        console.log(query);
        params = {
          TableName: tableName,
          Key: {
            id: request.body.id,
            title: request.body.title,
          },
          UpdateExpression: query,
          ReturnValues: "UPDATED_NEW",
        };
        dynamodb.update(params, (error, result) => {
          if (error) {
            response.statusCode = 500;
            response.json({
              error: error.message,
              url: request.url,
            });
            return;
          } else {
            response.statusCode = 200;
            response.json({
              url: request.url,
              body: JSON.stringify(result.Attributes),
            });
            return;
          }
        });
      }
    }
  });
});

// downvoting a comment
app.put("/posts/downvoteComment", function (request, response) {
  let params = {
    TableName: tableName,
    KeyConditionExpression: "#pk = :pk And #sk = :sk",
    ExpressionAttributeValues: {
      ":pk": request.body.id,
      ":sk": request.body.title,
    },
    ExpressionAttributeNames: {
      "#pk": "id",
      "#sk": "title",
    },
  };
  dynamodb.query(params, (error, result) => {
    if (error) {
      response.statusCode = 500;
      response.json({ error: error.message });
      return;
    } else {
      const downvoterIds = result.Items[0].downvoterIds;
      const upvoterIds = result.Items[0].upvoterIds;
      const reqUserId = getUserId(request);
      const upvoterIndex = upvoterIds.indexOf(reqUserId);
      const downvoterIndex = downvoterIds.indexOf(reqUserId);
      if (downvoterIndex < 0) {
        params = {
          TableName: tableName,
          Key: {
            id: request.body.id,
            title: request.body.title,
          },
          ExpressionAttributeNames: {
            "#downvoterIds": "downvoterIds",
          },
          ExpressionAttributeValues: {
            ":downvoterId": [reqUserId],
          },
          UpdateExpression:
            "set #downvoterIds = list_append(#downvoterIds, :downvoterId)",
          ReturnValues: "UPDATED_NEW",
        };

        if (upvoterIndex >= 0) {
          params.UpdateExpression += " REMOVE upvoterIds[" + upvoterIndex + "]";
        }

        dynamodb.update(params, (error, result) => {
          if (error) {
            response.statusCode = 500;
            response.json({
              error: error.message,
              url: request.url,
            });
            return;
          } else {
            response.statusCode = 200;
            response.json({
              url: request.url,
              body: JSON.stringify(result.Attributes),
            });
            return;
          }
        });
      } else {
        const query = "REMOVE downvoterIds[" + downvoterIndex + "]";
        console.log(query);
        params = {
          TableName: tableName,
          Key: {
            id: request.body.id,
            title: request.body.title,
          },
          UpdateExpression: query,
          ReturnValues: "UPDATED_NEW",
        };
        dynamodb.update(params, (error, result) => {
          if (error) {
            response.statusCode = 500;
            response.json({
              error: error.message,
              url: request.url,
            });
            return;
          } else {
            response.statusCode = 200;
            response.json({
              url: request.url,
              body: JSON.stringify(result.Attributes),
            });
            return;
          }
        });
      }
    }
  });
});
// app.put("/posts/downvoteComment", function (request, response) {
//   const params = {
//     TableName: tableName,
//     Key: {
//       id: request.body.id,
//       title: request.body.title,
//     },
//     ExpressionAttributeNames: {
//       "#downvotes": "downvotes",
//     },
//     ExpressionAttributeValues: { ":downvote": 1 },
//     UpdateExpression: "SET #downvotes = #downvotes + :downvote",
//     ReturnValues: "UPDATED_NEW",
//   };
//   dynamodb.update(params, (error, result) => {
//     if (error) {
//       response.statusCode = 500;
//       response.json({
//         error: error.message,
//         url: request.url,
//       });
//       return;
//     } else {
//       response.statusCode = 200;
//       response.json({
//         url: request.url,
//         body: JSON.stringify(result.Attributes),
//       });
//       return;
//     }
//   });
// });

/************************************
 * HTTP post method for insert object *
 *************************************/

app.post("/posts/post", function (request, response) {
  if (
    request.body.title === undefined ||
    request.body.content === undefined ||
    request.body.title === "" ||
    request.body.content === "" ||
    request.body.title.includes("/") ||
    request.body.title.includes("#") ||
    request.body.title.includes("%") ||
    request.body.title.includes("!")
  ) {
    response.statusCode = 403;
    response.json({
      text: "Nope!",
      error: "Forbidden",
      url: request.url,
    });
    return;
  }

  const timestamp = new Date().toISOString();
  request.body.title = "POST#" + request.body.title;
  let params = {
    TableName: tableName,
    Item: {
      ...request.body,
      id: uuidv4(), // auto-generate id
      createdAt: timestamp,
      updatedAt: timestamp,
      userId: getUserId(request), // userId from request
    },
  };
  dynamodb.put(params, (error, result) => {
    if (error) {
      response.statusCode = 500;
      response.json({
        error: error.message,
        url: request.url,
      });
      return;
    } else {
      response.statusCode = 200;
      response.json({
        url: request.url,
        body: JSON.stringify(params.Item),
      });
      return;
    }
  });
});

app.post("/posts/comment/:postId", function (request, response) {
  if (request.body.content === undefined || request.body.content === "") {
    response.statusCode = 403;
    response.json({
      text: "Nope!",
      error: "Forbidden",
      url: request.url,
    });
    return;
  }

  const timestamp = new Date().toISOString();
  const commentId = uuidv4();
  let params = {
    TableName: tableName,
    Item: {
      ...request.body,
      id: request.params.postId,
      title: "COMMENT#" + commentId,
      createdAt: timestamp,
      updatedAt: timestamp,
      userId: getUserId(request), // userId from request
    },
  };
  dynamodb.put(params, (error, result) => {
    if (error) {
      response.statusCode = 500;
      response.json({
        error: error.message,
        url: request.url,
      });
      return;
    } else {
      response.statusCode = 200;
      response.json({
        url: request.url,
        body: JSON.stringify(params.Item),
      });
      return;
    }
  });
});

const getUserId = (request) => {
  try {
    const reqContext = request.apiGateway.event.requestContext;
    const authProvider = reqContext.identity.cognitoAuthenticationProvider;
    return authProvider
      ? authProvider.split(":CognitoSignIn:").pop()
      : "UNAUTH";
  } catch (error) {
    return "UNAUTH";
  }
};

/**************************************
 * HTTP remove method to delete object *
 ***************************************/

app.delete(
  "/posts/deletePost/:postId/:postTitle",
  async function (request, response) {
    // const requestUserId = getUserId(request);
    let checkIdParams = {
      TableName: tableName,
      Key: {
        id: request.params.postId,
        title: "POST#" + request.params.postTitle,
      },
    };
    await dynamodb.get(checkIdParams, async (error, res) => {
      if (error) {
        console.log(error);
        return "error";
      } else {
        let posterId = res.Item.userId;
        if (getUserId(request) === posterId) {
          let params = {
            TableName: tableName,
            KeyConditionExpression: "id = :id",
            ExpressionAttributeValues: {
              ":id": request.params.postId,
            },
          };

          await dynamodb.query(params, (error, result) => {
            if (error) {
              response.statusCode = 500;
              response.json({ error: error.message });
              return;
            } else {
              console.log(result.Items);

              let paramsDelete = {
                RequestItems: {},
              };
              paramsDelete.RequestItems[tableName] = result.Items.map(
                (value) => {
                  let a = {
                    DeleteRequest: {
                      Key: {
                        id: request.params.postId,
                        title: value.title,
                      },
                    },
                  };
                  return a;
                }
              );
              paramsDelete.RequestItems[tableName].forEach((element) => {
                console.log(element.DeleteRequest.Key.id);
                console.log(element.DeleteRequest.Key.title);
              });

              dynamodb.batchWrite(paramsDelete, (error, result) => {
                if (error) {
                  response.statusCode = 500;
                  response.json({
                    error: error.message,
                    url: request.url,
                  });
                  return;
                } else {
                  response.statusCode = 200;
                  response.json({
                    url: request.url,
                    body: JSON.stringify(result),
                  });
                  return;
                }
              });
            }
          });
        } else {
          response.statusCode = 403;
          response.json({
            url: request.url,
            error: "Forbidden",
          });
          return;
        }
      }
    });
  }
);

// app.delete(
//   "/posts/deleteComment",
//   async function (request, response) {
//     // const requestUserId = getUserId(request);
//     let checkIdParams = {
//       TableName: tableName,
//       Key: {
//         id: request.params.postId,
//         title: "POST#" + request.params.postTitle,
//       },
//     };
//     await dynamodb.get(checkIdParams, async (error, res) => {
//       if (error) {
//         console.log(error);
//         return "error";
//       } else {
//         let posterId = res.Item.userId;
//         if (getUserId(request) === posterId) {
//         } else {
//           response.json({
//             statusCode: 403,
//             url: request.url,
//             error: "Forbidden",
//           });
//         }
//       }
//     });
//   }
// );

// app.delete("/posts/deleteComment", async function (request, response) {
//   if (
//     getUserId(request) === request.body.userId ||
//     getUserId(request) === request.body.postUserId
//   ) {
//     let params = {
//       TableName: tableName,
//       Key: {
//         id: request.body.postId,
//         title: request.body.commentId,
//       },
//     };
//     dynamodb.delete(params, (error, result) => {
//       if (error) {
//         response.json({
//           statusCode: 500,
//           error: error.message,
//           url: request.url,
//         });
//       } else {
//         response.json({
//           statusCode: 200,
//           url: request.url,
//           body: JSON.stringify(result),
//         });
//       }
//     });
//   } else {
//     response.json({
//       statusCode: 403,
//       url: request.url,
//       error: "Forbidden",
//     });
//   }
// });

app.delete("/posts/deleteComment", async function (request, response) {
  // const requestUserId = getUserId(request);
  let checkIdParams = {
    TableName: tableName,
    Key: {
      id: request.body.postId,
      title: "POST#" + request.body.postTitle,
    },
  };
  await dynamodb.get(checkIdParams, async (error, res) => {
    if (error) {
      console.log(error);
    } else {
      console.log("res: ", res);
      let posterId = res.Item.userId;
      if (getUserId(request) === posterId) {
        let params = {
          TableName: tableName,
          Key: {
            id: request.body.postId,
            title: "COMMENT#" + request.body.commentId,
          },
        };
        dynamodb.delete(params, (error, result) => {
          if (error) {
            response.statusCode = 500;
            response.json({
              error: error.message,
              url: request.url,
            });
            return;
          } else {
            response.statusCode = 200;
            response.json({
              url: request.url,
              body: JSON.stringify(result),
            });
            return;
          }
        });
      } else {
        checkIdParams.Key.title = "COMMENT#" + request.body.commentId;
        console.log(checkIdParams.Key.title);
        await dynamodb.get(checkIdParams, async (error, resComment) => {
          let commenterId = resComment.Item.userId;
          console.log("resComment: ", resComment);
          if (getUserId(request) === commenterId) {
            let params = {
              TableName: tableName,
              Key: {
                id: request.body.postId,
                title: "COMMENT#" + request.body.commentId,
              },
            };
            dynamodb.delete(params, (error, result) => {
              if (error) {
                response.statusCode = 500;
                response.json({
                  error: error.message,
                  url: request.url,
                });
                return;
              } else {
                response.statusCode = 200;
                response.json({
                  url: request.url,
                  body: JSON.stringify(result),
                });
                return;
              }
            });
          } else {
            response.statusCode = 403;
            response.json({
              url: request.url,
              error: "Forbidden",
            });
            return;
          }
        });
      }
    }
  });
});

app.listen(3000, function () {
  console.log("App started");
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
