import invariant from "tiny-invariant";
import s3_storage from "s3-storage";
import { promisify } from "node:util";
import toArray from "stream-to-array";
import { S3File } from "../components/list-files";

export type S3Storage = ReturnType<typeof getS3Storage>;

export function getS3Storage() {
  invariant(process.env.AWS_ACCESS_KEY_ID, "missing AWS_ACCESS_KEY_ID");
  invariant(process.env.AWS_SECRET_ACCESS_KEY, "missing AWS_SECRET_ACCESS_KEY");
  invariant(process.env.BUCKET_NAME, "missing BUCKET_NAME");
  const s3s = s3_storage(process.env.BUCKET_NAME, {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_DEFAULT_REGION,
  });
  const s3get = promisify(s3s.get.bind(s3s));
  return {
    list: async (options?: { prefix?: string }) => {
      let files = await toArray(s3s.list(options));
      files = files.filter(
        (file: S3File) =>
          !file.key.split("/").some((file) => file.startsWith(".")),
      );
      return files;
    },
    get: (key: string) => s3get(key),
    put: (key: string, bytes: any, meta?: any) =>
      new Promise((resolve, reject) => {
        s3s.put(key, bytes, meta, (err: Error | null, data: any) => {
          if (err) {
            reject(err);
          }
          resolve(data);
        });
      }),
    exists: (key: string, options?: any) =>
      new Promise((resolve, reject) => {
        s3s.exists(key, options, (err: Error | null, data: any) => {
          if (err) {
            reject(err);
          }
          resolve(data);
        });
      }),
  };
}
