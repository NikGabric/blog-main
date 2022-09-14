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

// app.get(path + hashKeyPath, function(req, res) {
//   const condition = {}
//   condition[partitionKeyName] = {
//     ComparisonOperator: 'EQ'
//   }

//   if (userIdPresent && req.apiGateway) {
//     condition[partitionKeyName]['AttributeValueList'] = [req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH ];
//   } else {
//     try {
//       condition[partitionKeyName]['AttributeValueList'] = [ convertUrlType(req.params[partitionKeyName], partitionKeyType) ];
//     } catch(err) {
//       res.statusCode = 500;
//       res.json({error: 'Wrong column type ' + err});
//     }
//   }

//   let queryParams = {
//     TableName: tableName,
//     KeyConditions: condition
//   }

//   dynamodb.query(queryParams, (err, data) => {
//     if (err) {
//       res.statusCode = 500;
//       res.json({error: 'Could not load items: ' + err});
//     } else {
//       res.json(data.Items);
//     }
//   });
// });

app.get(path, function (request, response) {
  let params = {
    TableName: tableName,
    limit: 100,
  };
  dynamodb.scan(params, (error, result) => {
    if (error) {
      response.json({ statusCode: 500, error: error.message });
    } else {
      for (var i = 0; i < result.Items.length; i++) {
        if (result.Items[i].title.startsWith("COMMENT#"))
          result.Items.splice(i, 1);
      }
      response.json({
        statusCode: 200,
        url: request.url,
        body: JSON.stringify(result.Items),
      });
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
      response.json({ statusCode: 500, error: error.message });
    } else {
      response.json({
        statusCode: 200,
        url: request.url,
        body: JSON.stringify(result.Items),
      });
    }
  });
});

/*****************************************
 * HTTP Get method for get single object *
 *****************************************/

app.get("/posts/:postTitle/:postId", function (request, response) {
  let params = {
    TableName: tableName,
    Key: {
      id: request.params.postId,
      title: "POST#" + request.params.postTitle,
    },
  };
  dynamodb.get(params, (error, result) => {
    if (error) {
      response.json({ statusCode: 500, error: error.message });
    } else {
      response.json({
        statusCode: 200,
        url: request.url,
        body: JSON.stringify(result.Item),
      });
    }
  });
});

// app.get(path + "/object" + hashKeyPath + sortKeyPath, function (req, res) {
//   const params = {};
//   if (userIdPresent && req.apiGateway) {
//     params[partitionKeyName] =
//       req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
//   } else {
//     params[partitionKeyName] = req.params[partitionKeyName];
//     try {
//       params[partitionKeyName] = convertUrlType(
//         req.params[partitionKeyName],
//         partitionKeyType
//       );
//     } catch (err) {
//       res.statusCode = 500;
//       res.json({ error: "Wrong column type " + err });
//     }
//   }
//   if (hasSortKey) {
//     try {
//       params[sortKeyName] = convertUrlType(
//         req.params[sortKeyName],
//         sortKeyType
//       );
//     } catch (err) {
//       res.statusCode = 500;
//       res.json({ error: "Wrong column type " + err });
//     }
//   }

//   let getItemParams = {
//     TableName: tableName,
//     Key: params,
//   };

//   dynamodb.get(getItemParams, (err, data) => {
//     if (err) {
//       res.statusCode = 500;
//       res.json({ error: "Could not load items: " + err.message });
//     } else {
//       if (data.Item) {
//         res.json(data.Item);
//       } else {
//         res.json(data);
//       }
//     }
//   });
// });

/************************************
 * HTTP put method for insert object *
 *************************************/

app.put(path, function (req, res) {
  if (userIdPresent) {
    req.body["userId"] =
      req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
  }

  let putItemParams = {
    TableName: tableName,
    Item: req.body,
  };
  dynamodb.put(putItemParams, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: err, url: req.url, body: req.body });
    } else {
      res.json({ success: "put call succeed!", url: req.url, data: data });
    }
  });
});

/************************************
 * HTTP post method for insert object *
 *************************************/

// app.post(path, function (req, res) {
//   if (userIdPresent) {
//     req.body["userId"] =
//       req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
//   }

//   let putItemParams = {
//     TableName: tableName,
//     Item: req.body,
//   };
//   dynamodb.put(putItemParams, (err, data) => {
//     if (err) {
//       res.statusCode = 500;
//       res.json({ error: err, url: req.url, body: req.body });
//     } else {
//       res.json({ success: "post call succeed!", url: req.url, data: data });
//     }
//   });
// });

app.post("/posts", function (request, response) {
  const timestamp = new Date().toISOString();
  let params = {
    TableName: tableName,
    Item: {
      ...request.body,
      id: uuidv4(), // auto-generate id
      complete: false,
      createdAt: timestamp,
      updatedAt: timestamp,
      userId: getUserId(request), // userId from request
    },
  };
  dynamodb.put(params, (error, result) => {
    if (error) {
      response.json({
        statusCode: 500,
        error: error.message,
        url: request.url,
      });
    } else {
      response.json({
        statusCode: 200,
        url: request.url,
        body: JSON.stringify(params.Item),
      });
    }
  });
});

app.post("/posts/comment/:postId", function (request, response) {
  const timestamp = new Date().toISOString();
  let params = {
    TableName: tableName,
    Item: {
      ...request.body,
      id: request.params.postId,
      title: "COMMENT#" + uuidv4(),
      complete: false,
      createdAt: timestamp,
      updatedAt: timestamp,
      userId: getUserId(request), // userId from request
    },
  };
  dynamodb.put(params, (error, result) => {
    if (error) {
      response.json({
        statusCode: 500,
        error: error.message,
        url: request.url,
      });
    } else {
      response.json({
        statusCode: 200,
        url: request.url,
        body: JSON.stringify(params.Item),
      });
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

app.delete(path + "/object" + hashKeyPath + sortKeyPath, function (req, res) {
  const params = {};
  if (userIdPresent && req.apiGateway) {
    params[partitionKeyName] =
      req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
  } else {
    params[partitionKeyName] = req.params[partitionKeyName];
    try {
      params[partitionKeyName] = convertUrlType(
        req.params[partitionKeyName],
        partitionKeyType
      );
    } catch (err) {
      res.statusCode = 500;
      res.json({ error: "Wrong column type " + err });
    }
  }
  if (hasSortKey) {
    try {
      params[sortKeyName] = convertUrlType(
        req.params[sortKeyName],
        sortKeyType
      );
    } catch (err) {
      res.statusCode = 500;
      res.json({ error: "Wrong column type " + err });
    }
  }

  let removeItemParams = {
    TableName: tableName,
    Key: params,
  };
  dynamodb.delete(removeItemParams, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: err, url: req.url });
    } else {
      res.json({ url: req.url, data: data });
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
