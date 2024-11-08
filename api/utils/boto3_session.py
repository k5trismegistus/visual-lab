import os
import boto3

boto3_session = boto3.Session(profile_name=os.environ['AWS_PROFILE']) if 'AWS_PROFILE' in os.environ else boto3.Session()
