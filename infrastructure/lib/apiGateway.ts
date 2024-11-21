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

    const signedUrlResource = this.api.root.addResource("signed-url");
    signedUrlResource.addCorsPreflight({
      allowOrigins: apigateway.Cors.ALL_ORIGINS, // Allow all origins
      allowMethods: ["GET", "OPTIONS"], // Allow GET, POST and OPTIONS
      allowHeaders: [
        "Content-Type",
        "X-Amz-Date",
        "Authorization",
        "X-Api-Key",
        "X-Amz-Security-Token",
      ], // Allow only Content-Type header
    });
    signedUrlResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(functions.generateSignedUrlForUploadFn, {
        requestTemplates: { "application/json": '{ "statusCode": 200 }' },
      }),
      {
        requestParameters: {
          "method.request.querystring.file_extension": true,
        },
      }
    );

    const generateRequestResource =
      this.api.root.addResource("generate-request");
    generateRequestResource.addCorsPreflight({
      allowOrigins: apigateway.Cors.ALL_ORIGINS, // Allow all origins
      allowMethods: ["GET", "POST", "OPTIONS"], // Allow GET, POST and OPTIONS
      allowHeaders: [
        "Content-Type",
        "X-Amz-Date",
        "Authorization",
        "X-Api-Key",
        "X-Amz-Security-Token",
      ], // Allow only Content-Type header
    });
    generateRequestResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(functions.createGenerateRequestFn),
      {
        requestModels: {
          "application/json": new apigateway.Model(stack, "RequestModel", {
            restApi: this.api,
            schema: {
              type: apigateway.JsonSchemaType.OBJECT,
              properties: {
                object_key: { type: apigateway.JsonSchemaType.STRING },
                instruction: { type: apigateway.JsonSchemaType.OBJECT },
                aspect_ratio: { type: apigateway.JsonSchemaType.STRING },
                // 必要に応じて他のパラメータを追加
              },
              required: ["object_key", "instruction", "aspect_ratio"],
            },
          }),
        },
      }
    );
  }
}
