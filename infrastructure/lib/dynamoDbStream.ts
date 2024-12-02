import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { LambdaFunctions } from "./lambdaFunctions";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { DynamoEventSource } from "aws-cdk-lib/aws-lambda-event-sources";

export class DynamoDbStream {
  constructor(
    stack: cdk.Stack,
    functions: LambdaFunctions,
    dynamoTable: dynamodb.Table
  ) {
    functions.handleCreatedGenerateRequestFn.addEventSource(
      new DynamoEventSource(dynamoTable, {
        startingPosition: lambda.StartingPosition.LATEST,
      )
    );
  }
}
