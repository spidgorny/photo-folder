import { runTest } from "./bootstrap";
import fs from "fs";
import { getPlaiceholder } from "plaiceholder";
import { S3File } from "../components/list-files";
import path from "path";
import invariant from "tiny-invariant";
import { getS3Storage } from "../lib/S3Storage";
import { ThumbFile } from "../lib/thumb-file";

void runTest(async () => {
  const s3 = getS3Storage();
  const prefix = "2024 Cyprus";
  const files: S3File[] = await s3.list({ prefix });
  invariant(files.length, `not files in ${prefix}`);
  // console.table(files);

  const thumbFile = new ThumbFile(s3, prefix);
  await thumbFile.init();
  try {
    for (let [index, file] of files.entries()) {
      console.log("==", index, "/", files.length, file.key);
      if (thumbFile.existsKey(file.key)) {
        // don't process already processed
        continue;
      }
      const bytes = await s3.get(file.key);
      let { css, base64, metadata } = await getPlaiceholder(bytes, {
        autoOrient: true,
        size: 8,
      });
      delete metadata.icc;
      delete metadata.exif;
      delete metadata.xmp;
      thumbFile.put({ ...file, css, base64, metadata });
      if (!(index % 10)) {
        await thumbFile.save();
      }
    }
  } catch (error) {
    console.error(error);
  }
  await thumbFile.save();
});
