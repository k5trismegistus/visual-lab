# Invoked by: Dynamodb stream on new item of GeneratedImage

from models.generated_image import GeneratedImage
from models.generate_request import GenerateRequest

def lambda_handler(event, context):
  for record in event['Records']:
    if record['eventName'] != 'INSERT':
      continue

  # Start generating image
  # Implement here

  return {
    'statusCode': 201,
  }
