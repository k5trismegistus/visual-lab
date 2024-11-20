# Invoked by: API Gateway

import json
from utils.boto3_session import boto3_session
import os
import uuid

s3 = boto3_session.client('s3')

def lambda_handler(event, context):
    bucket_name = os.getenv("MY_BUCKET_NAME")

    object_key_body = uuid.uuid4()
    file_extension = event.get("queryStringParameters", {}).get("file_extension")
    object_key = f'input/user0/{object_key_body}.{file_extension}'

    signed_url = s3.generate_presigned_url(
        'put_object',
        Params={'Bucket': bucket_name, 'Key': object_key},
        ExpiresIn=3600
    )

    return {
      'statusCode': 200,
      "headers": {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
          "Content-Type": "application/json"
        },
      'body': json.dumps({
          'signed_url': signed_url,
          'object_key': object_key}
      )
    }
