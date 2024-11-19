# Invoked by: API Gateway

import json
from api.models.generate_request import GenerateRequest


def lambda_handler(event, context):
    body = json.loads(event["body"])

    object_key = body.get('object_key')
    instruction = body.get('instruction')
    aspect_ratio = body.get('aspect_ratio')

    if not object_key or not instruction or not aspect_ratio:
        return {
            'statusCode': 400,
            'body': json.dumps({
                'message': 'Missing required fields'
            })
        }

    GenerateRequest.create('user0', object_key, instruction, aspect_ratio)

    return {
        'statusCode': 201,
    }
