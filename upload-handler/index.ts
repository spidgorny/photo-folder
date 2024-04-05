import { S3Event } from "aws-lambda";
import { ThumbFileS3 } from "../lib/thumb-file";
import { getPlaiceholder } from "plaiceholder";
import { getS3Storage } from "../lib/S3Storage";

export async function handler(event: S3Event) {
  console.log(event);
  let uploadObject = event.Records[0].s3.object;
  console.log(uploadObject);
  const prefix = uploadObject.key.split("/")[0];
  console.log({ prefix });

  const s3 = getS3Storage();
  const thumbFile = new ThumbFileS3(s3, prefix);
  await thumbFile.init();
  const bytes = await s3.get(uploadObject.key);
  let { css, base64, metadata } = await getPlaiceholder(bytes, {
    autoOrient: true,
    size: 8,
  });
  delete metadata.icc;
  delete metadata.exif;
  delete metadata.xmp;
  const modified = new Date().toISOString();
  let value = {
    key: uploadObject.key,
    size: uploadObject.size,
    modified,
    css,
    base64,
    metadata,
  };
  console.log(value);
  thumbFile.put(value);
  await thumbFile.save();
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        uploadObject,
        value,
      },
      null,
      2,
    ),
  };
}
