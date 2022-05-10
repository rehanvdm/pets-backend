const chai = require('chai');
const expect = chai.expect;

const esbuild = require("esbuild");
const fs = require('fs');
const path = require('path');
const {esBuildLambda} = require('../gulpfile');

function getProxyEventV1(path, method, queryStringObject, requestBody)
{
  let event = {
    resource: '/{proxy+}',
    path: path,
    httpMethod: method,
    headers:
      {  'Accept': 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.8',
        'cache-control': 'no-cache',
        'CloudFront-Forwarded-Proto': 'https',
        'CloudFront-Is-Desktop-Viewer': 'false',
        'CloudFront-Is-Mobile-Viewer': 'true',
        'CloudFront-Is-SmartTV-Viewer': 'false',
        'CloudFront-Is-Tablet-Viewer': 'false',
        'CloudFront-Viewer-Country': 'ZA',
        'content-type': 'text/plain',
        dnt: '1',
        Host: '1aqbqyfxoc.execute-api.eu-west-1.amazonaws.com',
        origin: 'http://localhost:8100',
        pragma: 'no-cache',
        Referer: 'http://localhost:8100/',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1',
        Via: '2.0 a88d0f17b53465837786e5dd493752fa.cloudfront.net (CloudFront)',
        'X-Amz-Cf-Id': 'y32w_2gdr6SKRVWCtdKWt59M6zTGZJoAH-N9_um08tBbxOIk7Bx_Cw==',
        'X-Amzn-Trace-Id': 'Root=1-5947c7e4-2d6ee52921a1d56116df7272',
        'X-Forwarded-For': '41.160.157.211, 54.182.244.70',
        'X-Forwarded-Port': '443',
        'X-Forwarded-Proto': 'https',
        // ...headers
      },
    queryStringParameters: queryStringObject,
    pathParameters: { proxy: path },
    stageVariables: { function: 'lambda_function_XXX' },
    requestContext:
      {
        authorizer: {},
        protocol: "",
        path: path,
        accountId: '441047573934',
        resourceId: 'zmstjf',
        stage: 'dev',
        requestId: "test",
        identity: {
            cognitoIdentityPoolId: null,
            accountId: null,
            cognitoIdentityId: null,
            caller: null,
            apiKey: '',
            sourceIp: '41.160.157.211',
            accessKey: null,
            cognitoAuthenticationType: null,
            cognitoAuthenticationProvider: null,
            userArn: null,
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1',
            user: null,
            clientCert: null,
            apiKeyId: null,
            principalOrgId: null,
        },
        resourcePath: '/{proxy+}',
        httpMethod: method,
        apiId: '1aqbqyfxoc'
      },
    body: requestBody ? JSON.stringify(requestBody) : undefined,
    isBase64Encoded: false
  };

  return event;
}
function getProxyEventV2(path, method, queryStringObject, requestBody)
{
  // https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html

  let event = {
    "version": "2.0",
    "routeKey": "$default",
    "rawPath": path,
    "rawQueryString": queryStringObject ? Object.entries(queryStringObject).map((val, index) => index+"="+val).join("&") : undefined,
    "headers": {
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "none",
      "accept-language": "en-US,en;q=0.5",
      "x-forwarded-proto": "https",
      "x-forwarded-port": "443",
      "x-forwarded-for": "41.114.107.129",
      "sec-fetch-user": "?1",
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "x-amzn-trace-id": "Root=1-62718a73-5c27fc6c1690286a219ec7d6",
      "host": "pieogpsws2jntrue7xwj6xn4oi0ekilg.lambda-url.us-east-1.on.aws",
      "upgrade-insecure-requests": "1",
      "accept-encoding": "gzip, deflate, br",
      "sec-fetch-dest": "document",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:99.0) Gecko/20100101 Firefox/99.0"
    },
    "queryStringParameters": queryStringObject,
    "body": requestBody ? JSON.stringify(requestBody) : undefined,
    "requestContext": {
      "accountId": "anonymous",
      "apiId": "pieogpsws2jntrue7xwj6xn4oi0ekilg",
      "domainName": "pieogpsws2jntrue7xwj6xn4oi0ekilg.lambda-url.us-east-1.on.aws",
      "domainPrefix": "pieogpsws2jntrue7xwj6xn4oi0ekilg",
      "http": {
        "method": method,
        "path": path,
        "protocol": "HTTP/1.1",
        "sourceIp": "41.114.107.129",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:99.0) Gecko/20100101 Firefox/99.0"
      },
      "requestId": "e11f2102-d011-4b25-a709-838584b51bd9",
      "routeKey": "$default",
      "stage": "$default",
      "time": "03/May/2022:20:02:59 +0000",
      "timeEpoch": 1651608179639
    },
    "isBase64Encoded": false
  };

  return event;
}
function getContext()
{
  return {
    awsRequestId: "test"
  };
}

/* Transpiled and required after `before` */
let apiLambda = null;

describe('Pets', function ()
{
  before(async function ()
  {
    try
    {
      this.timeout(5 * 1000);
      await esBuildLambda("src/lambda/api", "dist/lambda/api", "index");
      apiLambda = require("../dist/lambda/api/index.js");
    }
    catch (e)
    {
      console.error(e);
      throw e;
    }
  });

  it('Find All Pets', async function ()
  {
    this.timeout(5 * 1000);

    let event = getProxyEventV1("/pets", "GET", undefined, undefined);
    // let event = getProxyEventV2("/pets", "GET", undefined, undefined);
    let context = getContext();
    let result = await apiLambda.handler(event, context);

    try
    {
      expect(result).to.be.an('object');
      expect(result.statusCode).to.equal(200);
      expect(result.body).to.be.an('string');

      let body = JSON.parse(result.body);
      console.log(JSON.stringify(body, null, 2));

      expect(body).to.be.an('array');
      expect(body[0].id).to.be.an("number");
    }
    catch (err)
    {
      console.error("Result", result);
      throw err;
    }
  });

  it('Find Pet', async function ()
  {
    this.timeout(5 * 1000);

    let event = getProxyEventV2("/pets/1", "GET", undefined, undefined);
    let context = getContext();
    let result = await apiLambda.handler(event, context);

    try
    {
      expect(result).to.be.an('object');
      expect(result.statusCode).to.equal(200);
      expect(result.body).to.be.an('string');

      let body = JSON.parse(result.body);
      console.log(JSON.stringify(body, null, 2));

      expect(body).to.be.an('object');
      expect(body.id).to.be.equal(1);
    }
    catch (err)
    {
      console.error("Result", result);
      throw err;
    }
  });

});
