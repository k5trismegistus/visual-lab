import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { LambdaFunctions } from "./lambdaFunctions";

export class ApiGateway {
  api: apigateway.RestApi;

  constructor(stack: cdk.Stack, functions: LambdaFunctions) {
    this.api = new apigateway.RestApi(stack, "VisualLabApi", {
      restApiName: "VisualLabApi",
      description: "API for visual-lab.",
    });

    const usagePlan = this.api.addUsagePlan("DevPlan", {
      name: "EasyThrottlePlan",
      throttle: {
        rateLimit: 1,
        burstLimit: 2,
      },
      quota: {
        limit: 10,
        period: apigateway.Period.DAY,
      },
    });

    const apiKey = this.api.addApiKey("ApiKey");
    usagePlan.addApiKey(apiKey);
    usagePlan.addApiStage({
      stage: this.api.deploymentStage,
    });

    const lambdaIntegration = new apigateway.LambdaIntegration(
      functions.generateSignedUrlForUploadFn,
      {
        requestTemplates: { "application/json": '{ "statusCode": 200 }' },
      }
    );

    const signedUrlResource = this.api.root.addResource("signed-url");
    signedUrlResource.addMethod("GET", lambdaIntegration, {
      requestParameters: {
        "method.request.querystring.file_extension": true,
      },
    });
  }
}
