import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
import uuid
import datetime
import json

from utils.boto3_session import boto3_session

dynamo = boto3_session.resource('dynamodb')
table = dynamo.Table(os.environ['DYNAMO_TABLE'])

# partitionKey: userId
# sortKey: REQUEST#{timestamp}#{uuid}
class GenerateRequest():
  @classmethod
  def create(cls, user_id: str, input_object_key: str, instruction: dict):
    timestamp = datetime.datetime.now().isoformat()
    request_id = uuid.uuid4()
    sort_key = f"GENREQUEST#{timestamp}#{request_id}"

    response = table.put_item(
      Item={
        'partitionKey': user_id,
        'entityTimestamp': sort_key,
        'objectKey': input_object_key,
        'instruction': json.dumps(instruction),
        'status': 'requested'
      }
    )
    return cls(
      user_id=user_id,
      entity_timestamp=sort_key,
      input_object_key=input_object_key,
      instruction=instruction,
      status='requested'
    )

  def __init__(self, user_id: str, entity_timestamp: str, input_object_key: str, instruction: dict, status: str):
    self.user_id = user_id
    self.entity_timestamp = entity_timestamp
    self.input_object_key = input_object_key
    self.instruction = instruction
    self.status = status

  def update_prompt(self, prompt: str):
    response = table.update_item(
      Key={
        'userId': self.user_id,
        'sortKey': self.entity_timestamp
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
