import sys, os

from api.models.generated_image import GeneratedImage
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
import uuid
import datetime
import json

from utils.boto3_session import boto3_session
from utils.get_file_from_s3 import get_file_from_s3

dynamo = boto3_session.resource('dynamodb')
table = dynamo.Table(os.environ['DYNAMO_TABLE'])

bedrock_runtime = boto3_session.client("bedrock-runtime")
MODEL_ID = "us.meta.llama3-2-90b-instruct-v1:0"

# partitionKey: userId
# sortKey: GENREQUEST#{timestamp}#{request_id(uuid)}
# status: requested | promted | generated
class GenerateRequest():
  @classmethod
  def index(cls, user_id: str):
    # Get record newest first by sort key
    # Limit to 20 records and use pagination for more
    response = table.query(
      KeyConditionExpression=Key('partitionKey').eq(user_id),
      ScanIndexForward=False,
      Limit=20
    )
    return [cls(
      user_id=item['partitionKey'],
      sort_key=item['sortKey'],
      object_key=item['objectKey'],
      instruction=json.loads(item['instruction']),
      aspect_ratio=item['aspectRatio'],
      status=item['status']
    ) for item in response['Items']]


  @classmethod
  def create(cls, user_id: str, object_key: str, instruction: dict, aspect_ratio: str):
    timestamp = datetime.datetime.now().isoformat()
    request_id = uuid.uuid4()
    sort_key = f"GENREQUEST#{timestamp}#{request_id}"


    response = table.put_item(
      Item={
        'partitionKey': user_id,
        'sortKey': sort_key,
        'objectKey': object_key,
        'instruction': json.dumps(instruction),
        'status': 'requested'
      }
    )
    return cls(
      user_id=user_id,
      sort_key=sort_key,
      request_id=request_id,
      object_key=object_key,
      instruction=instruction,
      aspect_ratio=aspect_ratio,
      status='requested'
    )

  def __init__(self, user_id: str, sort_key: str, request_id:str, object_key: str, instruction: dict, aspect_ratio: str, status: str):
    self.user_id = user_id
    self.sort_key = sort_key
    self.object_key = object_key
    self.instruction = instruction
    self.aspect_ratio = aspect_ratio
    self.status = status

  def generated_images(self):
    return GeneratedImage.index_by_request(self.key)

  def key(self):
    return f'{self.user_id}#{self.sort_key}'

  def update_prompt(self, prompt: str):
    response = table.update_item(
      Key={
        'partitionKey': self.user_id,
        'sortKey': self.sort_key
      },
      UpdateExpression="set prompt = :o, status = :s",
      ExpressionAttributeValues={
        ':o': prompt,
        ':s': 'generated'
      },
      ReturnValues="UPDATED_NEW"
    )
    self.object_key = prompt
    self.status = 'prompted'
    return self

  def update_status(self):
    response = table.update_item(
      Key={
        'partitionKey': self.user_id,
        'sortKey': self.sort_key
      },
      UpdateExpression="set status = :s",
      ExpressionAttributeValues={
        ':s': self.status
      },
      ReturnValues="UPDATED_NEW"
    )
    return self

  def generate_prompt(self):
    user_message = f"""
      Stable diffusionのプロンプトエンジニアとして考えてください。
      画像を生成してもらうための、手書きのイラストとその中の注釈で指示書を作成しました。
      与えられたイラストをもとに高クオリティの画像をStable diffusionに出力させるプロンプトを考えてください。

      出力形式はjson形式で
      `prompt: `の後にプロンプトを
      `negative: `の後にネガティブプロンプトを
      出力してください。
      プロンプト、ネガティブプロンプト以外は絶対に出力しないでください。

      そのほか、
      - 指示書の中のオブジェクトを推定してください。
      - 指示書の中のオブジェクトの画像内位置や向きを再現するようにしてください。
      - 手書きの日本語または英語で与えられている指示の内容をプロンプトに含めてください。
      - 手書きの日本語または英語で与えられている指示は画像としては無視してください。
      - 画像の種類は「{self.instruction['aesthetic']}」でお願いします。
      - 色合いは「{self.instruction['color_scheme']}」でお願いします。
      - 以下のような補足説明があります。
        {self.instruction['note']}
    """

    bucket = os.environ['S3_BUCKET']
    image = get_file_from_s3(bucket, self.object_key)['Body'].read()

    messages = [
        {
            "role": "user",
            "content": [
                {"image": {"format": "png", "source": {"bytes": image}}},
                {"text": user_message},
            ],
        }
    ]

    response = bedrock_runtime.converse(
      modelId=MODEL_ID,
      messages=messages,
    )
    response_text = response["output"]["message"]["content"][0]["text"]

    table.update_item(
      Key={
        'partitionKey': self.user_id,
        'sortKey': self.sort_key
      },
      UpdateExpression="set prompt = :o, status = :s",
      ExpressionAttributeValues={
        ':o': response_text,
        ':s': 'prompted'
      },
      ReturnValues="UPDATED_NEW"
    )

    def start_generate(self):
      for i in range(3):
        GeneratedImage.create(self.key, i)


if __name__ == '__main__':
  instruction = {
    'aesthetic': 'abstract',
    'color_scheme': 'monochrome',
    'note': 'この画像は、複数のオブジェクトが配置されています。'
  }

  generate_request = GenerateRequest.create('user0', 'input/user0/testinput.png', instruction, '1:1')

  generate_request.generate_prompt('input/user0/testinput.png', instruction)

  print(generate_request.prompt)
