import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as s3 from "aws-cdk-lib/aws-s3";

import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Lambda } from "aws-cdk-lib/aws-ses-actions";
import { LambdaFunctions } from "./lambdaFunctions";
import { ApiGateway } from "./apiGateway";

export class VisualLabStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const app_env = props?.tags?.env || "dev";

    const dynamoTable = new dynamodb.Table(this, `VisualLabDb-${app_env}`, {
      tableName: `VisualLabDbTable_${app_env}`,
      partitionKey: {
        name: "partitionKey",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "sortKey",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const s3Bucket = new s3.Bucket(this, `VisualLabBucket_${app_env}`, {
      bucketName: `visual-lab-bucket-${app_env}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
          allowedOrigins: ["*"],
          allowedHeaders: ["*"],
        },
      ],
    });

    const lambdaFunctions = new LambdaFunctions(this, s3Bucket, dynamoTable);
    const api = new ApiGateway(this, lambdaFunctions);
  }
}
