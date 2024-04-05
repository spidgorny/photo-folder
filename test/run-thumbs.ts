import { runTest } from "./bootstrap";
import fs from "fs";
import { getPlaiceholder } from "plaiceholder";
import path from "path";
import invariant from "tiny-invariant";
import { getS3Storage } from "../lib/S3Storage";
import sharp from "sharp";
import { S3File } from "../components/use-files";

void runTest(async () => {
  const s3 = getS3Storage();
  const prefix = "2024 Cyprus";
  const files: S3File[] = await s3.list({ prefix });
  invariant(files.length, `not files in ${prefix}`);

  for (let [index, file] of files.entries()) {
    console.log("==", index, "/", files.length, file.key);
    const thumbPath = `${prefix}/.thumbnails/${path.basename(file.key)}`;
    if (await s3.exists(thumbPath)) {
      // don't process already processed
      continue;
    }
    let thumbnail: Buffer;
    const bytes = await s3.get(file.key);
    const src = sharp(bytes);
    let metadata = await src.metadata();
    if (metadata.width > metadata.height) {
      thumbnail = await src.resize({ width: 1200 }).toBuffer();
    } else {
      thumbnail = await src.resize({ height: 1200 }).toBuffer();
    }
    await s3.put(thumbPath, thumbnail);
    // fs.writeFileSync(thumbPath, thumbnail);
  }
});
