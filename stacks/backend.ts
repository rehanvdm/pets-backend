import cdk = require('aws-cdk-lib');
import {Construct} from "constructs";
import * as lambda from 'aws-cdk-lib/aws-lambda';
import {HttpMethod} from 'aws-cdk-lib/aws-lambda';
import {Duration} from "aws-cdk-lib";

export class Backend extends cdk.Stack {
  constructor(scope: Construct, id: string, stackProps: cdk.StackProps) {
    super(scope, id, stackProps);

    function name(name: string): string {
      return id + "-" + name;
    }

    const apiLambda = new lambda.Function(this, name("lambda-api"), {
      functionName: name("api"),
      code: new lambda.AssetCode('dist/lambda/api/'),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      timeout: Duration.seconds(5),
      memorySize: 1024,
      environment: {
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
        NODE_OPTIONS: "--enable-source-maps",
      },
    });
    const apiLambdaUrl = apiLambda.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ["*"],
        allowedHeaders: ["*"],
        allowedMethods:  [HttpMethod.ALL]
      }
    });

    new cdk.CfnOutput(this, 'API URL', {
      value: apiLambdaUrl.url,
    });
  }
}

export default Backend;
