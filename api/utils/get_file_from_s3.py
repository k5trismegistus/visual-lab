from .boto3_session import boto3_session
s3 = boto3_session.client('s3')

def get_file_from_s3(bucket, key):
    obj = s3.get_object(Bucket=bucket, Key=key)
    return obj
