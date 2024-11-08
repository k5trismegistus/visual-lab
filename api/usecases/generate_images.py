import base64
import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
import json
from utils.boto3_session import boto3_session
from api.models.generate_request import GenerateRequest

bedrock_runtime = boto3_session.client("bedrock-runtime")
model_id = 'stability.sd3-large-v1:0'

def generate_images(request):
  if request.status != 'prompted':
    raise Exception('Request is not prompted yet')

  body = {
    "output_format": "jpeg",
    "prompt": request.instruction['negative_prompt'],
    "negative_prompt": request.instruction['negative_prompt'],
    "aspect_ratio": "1:1",
  }

  response = bedrock_runtime.invoke_model(
    modelId=model_id,
    body=json.dumps(body),
    contentType='application/json'
  )

  return json.loads(response["body"].read().decode("utf-8"))


if __name__ == '__main__':
  request = Request(
    user_id='test_user',
    entity_timestamp='REQUEST#2021-10-01T00:00:00.000Z#1234',
    input_object_key='input/1234.jpg',
    instruction={
      'prompt': 'A monochrome abstract image of two people holding a star in their hands, with a person in the background. The person on the left is holding the star with their right hand, and the person on the right is holding the star with their left hand. The person in the background is standing behind the star, with their arms outstretched. The star is glowing with a soft, white light. The background is a subtle gradient of gray and white, with a few faint stars scattered throughout. The overall atmosphere is one of wonder and magic.',
      'negative_prompt': 'A realistic image of two people holding a star in their hands, with a person in the background. The person on the left is holding the star with their left hand, and the person on the right is holding the star with their right hand. The person in the background is standing in front of the star, with their arms crossed. The star is not glowing, and the background is a plain white or gray color. The overall atmosphere is one of boredom and mundanity.',
    },
    status='prompted'
  )
  response = generate_images(request)

  base64_image = response['images'][0]

  image_data = base64.b64decode(base64_image)
  with open('output.jpg', 'wb') as f:
    f.write(image_data)

