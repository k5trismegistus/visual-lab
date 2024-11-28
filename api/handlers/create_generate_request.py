# Invoked by: API Gateway

import json
from models.generate_request import GenerateRequest

def lambda_handler(event, context):
    body = json.loads(event["body"])

    object_key = body.get('object_key')
    instruction = body.get('instruction')
    aspect_ratio = body.get('aspect_ratio')

    if not object_key or not instruction or not aspect_ratio:
        return {
            'statusCode': 400,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                "Content-Type": "application/json"
            },
            'body': json.dumps({
                'message': 'Missing required fields'
            })
        }

    GenerateRequest.create('user0', object_key, instruction, aspect_ratio)

    return {
        'statusCode': 201,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            "Content-Type": "application/json"
        },
    }
