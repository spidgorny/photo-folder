import s3_storage from "s3-storage";
import { NextApiRequest, NextApiResponse } from "next";
import invariant from "tiny-invariant";
import toArray from "stream-to-array";
import { S3File } from "../../../components/list-files";

export function getS3Storage() {
  invariant(process.env.AWS_ACCESS_KEY_ID, "missing AWS_ACCESS_KEY_ID");
  invariant(process.env.AWS_SECRET_ACCESS_KEY, "missing AWS_SECRET_ACCESS_KEY");
  invariant(process.env.BUCKET_NAME, "missing BUCKET_NAME");
  return s3_storage(process.env.BUCKET_NAME, {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_DEFAULT_REGION,
  });
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const s3 = getS3Storage();
  const stream = s3.list();
  console.log("stream", stream);
  let files = await toArray(stream);
  files = files.filter(
    (file: S3File) =>
      !file.key.split("/").some((file) => !file.startsWith(".")),
  );
  return res.status(200).json({ files });
};
