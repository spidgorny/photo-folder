<!--
title: 'AWS NodeJS Example'
description: 'This template demonstrates how to deploy a NodeJS function running on AWS Lambda using the traditional Serverless Framework.'
layout: Doc
framework: v3
platform: AWS
language: nodeJS
priority: 1
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Upload Handler Lambda

This Lambda function processes images uploaded to S3 by generating thumbnails, placeholders, and extracting EXIF metadata.

## Sharp Lambda Layer Setup

This function uses the Sharp library for image processing. Since Sharp requires platform-specific native binaries, we use a prebuilt Lambda layer:

```bash
# Download the prebuilt sharp layer for Linux x64
curl -L -o release-x64.zip https://github.com/cbschuld/sharp-aws-lambda-layer/releases/latest/download/release-x64.zip

# Publish the layer to AWS Lambda
aws lambda publish-layer-version \
  --layer-name sharp-lambda-x64 \
  --description "Sharp Layer for x86_64" \
  --license-info "Apache-2.0" \
  --zip-file fileb://release-x64.zip \
  --compatible-runtimes nodejs18.x nodejs20.x nodejs22.x nodejs24.x \
  --compatible-architectures x86_64
```

After publishing, update the layer ARN in `serverless.yml` to match your AWS account and region.

## Usage

### Deployment

In order to deploy the example, you need to run the following command:

```
$ serverless deploy
```

After running deploy, you should see output similar to:

```bash
Deploying aws-node-project to stage dev (us-east-1)

✔ Service deployed to stack aws-node-project-dev (112s)

functions:
  hello: aws-node-project-dev-hello (1.5 kB)
```

### Invocation

After successful deployment, you can invoke the deployed function by using the following command:

```bash
serverless invoke --function hello
```

Which should result in response similar to the following:

```json
{
    "statusCode": 200,
    "body": "{\n  \"message\": \"Go Serverless v3.0! Your function executed successfully!\",\n  \"input\": {}\n}"
}
```

### Local development

You can invoke your function locally by using the following command:

```bash
serverless invoke local --function hello
```

Which should result in response similar to the following:

```
{
    "statusCode": 200,
    "body": "{\n  \"message\": \"Go Serverless v3.0! Your function executed successfully!\",\n  \"input\": \"\"\n}"
}
```
