import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
import uuid
import datetime
import json

from utils.boto3_session import boto3_session

dynamo = boto3_session.resource('dynamodb')
table = dynamo.Table(os.environ['DYNAMO_TABLE'])

# partitionKey: requestId
# sortKey: RESULT#{requestId}#{resultNumber}
# status: generating, generated
class GeneratedImage():
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
    return cls(
      user_id=user_id,
      sort_key=sort_key,
      object_key=None,
      status='generating'
    )

  def __init__(self, request_id: str, sort_key: str, object_key: str, status: str):
    self.request_id = request_id
    self.sort_key = sort_key
    self.object_key = object_key
    self.status = status


  def update_prompt(self, prompt: str):
    response = table.update_item(
      Key={
        'userId': self.user_id,
        'entityTimestamp': self.entity_timestamp
      },
      UpdateExpression="set prompt = :p, status = :s",
      ExpressionAttributeValues={
        ':p': prompt,
        ':s': 'prompted'
      },
      ReturnValues="UPDATED_NEW"
    )
    self.prompt = prompt
    self.status = 'prompted'
    return self
