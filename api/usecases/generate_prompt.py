import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from utils.boto3_session import boto3_session
from api.models.generate_request import GenerateRequestRequest


from utils.get_file_from_s3 import get_file_from_s3

bedrock_runtime = boto3_session.client("bedrock-runtime")
MODEL_ID = "us.meta.llama3-2-90b-instruct-v1:0"

def generate_prompt(object_key, instruction):
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
    - 画像の種類は「{instruction['aesthetic']}」でお願いします。
    - 色合いは「{instruction['color_scheme']}」でお願いします。
    - 以下のような補足説明があります。
      {instruction['note']}
  """

  Request.create('user0', object_key, instruction)

  bucket = os.environ['S3_BUCKET']
  image = get_file_from_s3(bucket, object_key)['Body'].read()

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

  return response_text

if __name__ == '__main__':
  instruction = {
    'aesthetic': 'abstract',
    'color_scheme': 'monochrome',
    'note': 'この画像は、複数のオブジェクトが配置されています。'
  }
  print(generate_prompt('input/user0/testinput.png', instruction))
