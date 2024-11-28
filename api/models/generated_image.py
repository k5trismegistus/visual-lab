import base64
import sys, os

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
import uuid
import datetime
import json

from utils.boto3_session import boto3_session

s3_client = boto3_session.client('s3')

dynamo = boto3_session.resource('dynamodb')
table = dynamo.Table(os.environ['DYNAMO_TABLE'])

bedrock_runtime = boto3_session.client("bedrock-runtime")
model_id = 'stability.sd3-large-v1:0'

# partitionKey: requestId
# sortKey: RESULT#{requestId}#{resultNumber}
# status: generating, generated
class GeneratedImage():
  @classmethod
  def index_by_request(cls, request_id: str):
    response = table.query(
      KeyConditionExpression=Key('partitionKey').eq(request_id)
    )
    return [cls(
      request_key=item['partitionKey'],
      sort_key=item['sortKey'],
      object_key=item['objectKey'],
      status=item['status']
    ) for item in response['Items']]

  @classmethod
  def create(cls, request_id: str, result_number: int):
    timestamp = datetime.datetime.now().isoformat()
    sort_key = f"RESULT#{request_id}#{result_number}"

    response = table.put_item(
      Item={
        'partitionKey': request_id,
        'sortKey': sort_key,
        'status': 'generating'
      }
    )

    object_key = f"output/{request_id}/{result_number}.jpg"

    return cls(
      request_id=request_id,
      sort_key=sort_key,
      object_key=object_key,
      status='generating'
    )

  def __init__(self, request_key: str, sort_key: str, object_key: str, status: str):
    split_key = request_key.split('#')
    self.request_pk = split_key[0]
    self.request_sk = '#'.join(split_key[1:])
    self.request_id = self.split_key[3]

    self.sort_key = sort_key
    self.object_key = object_key
    self.status = status

  def dynamo_keys(self):
    return {
      'partitionKey': self.request_id,
      'sortKey': self.sort_key
    }

  def request(self):
    from models.generate_request import GenerateRequest
    if self.request is None:
      self.request = GenerateRequest.get(self.request_pk, self.request_sk)

    return self.request

  def start_generation(self):
    if self.status != 'prompted':
      raise Exception('Request is not prompted yet')

    table.update_item(
      Key=self.dynamo_keys,
      UpdateExpression='SET #status = :status',
      ExpressionAttributeNames={
        '#status': 'status'
      },
      ExpressionAttributeValues={
        ':status': 'generating'
      }
    )

    body = {
      "output_format": "jpeg",
      "prompt": self.request.instruction['negative_prompt'],
      "negative_prompt": self.request.instruction['negative_prompt'],
      "aspect_ratio": self.request.aspect_ratio,
    }

    response = bedrock_runtime.invoke_model(
      modelId=model_id,
      body=json.dumps(body),
      contentType='application/json'
    )

    response = json.loads(response["body"].read().decode("utf-8"))
    base64_images = response['images'][0]

    # Upload the generated jpg image to S3
    s3_client.put_object(
      Bucket=os.environ['S3_BUCKET'],
      Key=self.object_key,
      Body=base64_images,
      ContentType='image/jpeg'
    )

    table.update_item(
      Key=self.dynamo_keys,
      UpdateExpression='SET #status = :status',
      ExpressionAttributeNames={
        '#status': 'status'
      },
      ExpressionAttributeValues={
        ':status': 'generated'
      }
    )


if __name__ == '__main__':
  request = GenerateRequest(
    user_id='test_user',
    entity_timestamp='REQUEST#2021-10-01T00:00:00.000Z#1234',
    object_key='input/1234.jpg',
    instruction={
      'prompt': 'A monochrome abstract image of two people holding a star in their hands, with a person in the background. The person on the left is holding the star with their right hand, and the person on the right is holding the star with their left hand. The person in the background is standing behind the star, with their arms outstretched. The star is glowing with a soft, white light. The background is a subtle gradient of gray and white, with a few faint stars scattered throughout. The overall atmosphere is one of wonder and magic.',
      'negative_prompt': 'A realistic image of two people holding a star in their hands, with a person in the background. The person on the left is holding the star with their left hand, and the person on the right is holding the star with their right hand. The person in the background is standing in front of the star, with their arms crossed. The star is not glowing, and the background is a plain white or gray color. The overall atmosphere is one of boredom and mundanity.',
    },
    status='prompted'
  )
  generate_image = GeneratedImage.create(request.key, 0)
  generate_image.start_generation()

  # Download the generated image from S3
  object_key = generate_image.object_key
  response = s3_client.get_object(Bucket=os.environ['S3_BUCKET'], Key=object_key)
  base64_image = response['Body'].read()

  image_data = base64.b64decode(base64_image)
  with open('output.jpg', 'wb') as f:
    f.write(image_data)
