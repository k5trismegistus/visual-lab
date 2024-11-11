# Entry point of lambda function: create_generate_request.lambda_handler

from api.models.generate_request import GenerateRequest


def lambda_handler(event, context):
    object_key = event['object_key']
    instruction = event['instruction']
    aspect_ratio = event['aspect_ratio']

    GenerateRequest.create('user0', object_key, instruction, aspect_ratio)

    return {
        'statusCode': 201,
    }
