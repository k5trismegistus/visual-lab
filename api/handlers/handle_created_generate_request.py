# Invoked by: Dynamodb stream on new item of GenerateRequest
# This function is invoked by a DynamoDB stream on new items of GenerateRequest.
# It is responsible for generating the prompt to be used for the image generation.

from api.models.generate_request import GenerateRequest


def lambda_handler(event, context):
  for record in event['Records']:
    if record['eventName'] != 'INSERT' or not record['dynamodb']['NewImage']['sortKey']['S'].startswith('GENREQUEST#') or not record['dynamodb']['NewImage']['status']['S'] == 'requested':
      continue

  generate_request = GenerateRequest(
    user_id=record['dynamodb']['NewImage']['partitionKey']['S'],
    sort_key=record['dynamodb']['NewImage']['sortKey']['S'],
    request_id=record['dynamodb']['NewImage']['requestId']['S'],
    object_key=record['dynamodb']['NewImage']['objectKey']['S'],
    instruction=record['dynamodb']['NewImage']['instruction']['M'],
    aspect_ratio=record['dynamodb']['NewImage']['aspectRatio']['S'],
    status=record['dynamodb']['NewImage']['status']['S']
  )

  generate_request.generate_prompt()

  return {
    'statusCode': 201,
  }
