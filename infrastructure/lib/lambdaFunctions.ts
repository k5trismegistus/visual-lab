import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class LambdaFunctions {
  generateSignedUrlForUploadFn: lambda.Function;

  constructor(
    stack: cdk.Stack,
    s3Bucket: s3.Bucket,
    dynamoTable: dynamodb.Table
  ) {
    this.generateSignedUrlForUploadFn = new lambda.Function(
      stack,
      "generateSignedUrlForUploadFn",
      {
        runtime: lambda.Runtime.PYTHON_3_12,
        handler: "handlers.generate_signed_url_for_upload.lambda_handler",
        code: lambda.Code.fromAsset("./lib/lambda_dist"),
        environment: {
          MY_BUCKET_NAME: s3Bucket.bucketName,
        },
      }
    );
    s3Bucket.grantReadWrite(this.generateSignedUrlForUploadFn);
  }
}
