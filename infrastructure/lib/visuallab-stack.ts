import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as s3 from "aws-cdk-lib/aws-s3";

export class VisualLabStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const app_env = props?.tags?.env || "dev";

    const dynamoTable = new dynamodb.Table(this, `VisualLabDb-${app_env}`, {
      tableName: `VisualLabDbTable_${app_env}`,
      partitionKey: {
        name: "userId",
        type: dynamodb.AttributeType.STRING, // typeはあとNumberとbinary
      },
      sortKey: {
        name: "entityTimestamp",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const s3Bucket = new s3.Bucket(this, `VisualLabBucket_${app_env}`, {
      bucketName: `visual-lab-bucket-${app_env}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}
