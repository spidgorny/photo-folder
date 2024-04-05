import { runTest } from "./bootstrap";
import fs from "fs";
import { getPlaiceholder } from "plaiceholder";
import path from "path";
import invariant from "tiny-invariant";
import { getS3Storage } from "../lib/S3Storage";
import { ThumbFile } from "../lib/thumb-file";
import { S3File } from "../components/use-files";

void runTest(async () => {
  const s3 = getS3Storage();
  const prefix = "2024 Cyprus";
  const files: S3File[] = await s3.list({ prefix });
  console.log("s3 files", files.length);
  invariant(files.length, `not files in ${prefix}`);

  const thumbFile = new ThumbFile(s3, prefix);
  await thumbFile.init();
  console.log("thumb file", thumbFile.thumbnails.length);
  let sourceDataListIsACopy = [...thumbFile.thumbnails];
  for (let entry of sourceDataListIsACopy) {
    const exists = files.find((x) => x.key === entry.key);
    console.log(exists ? "+" : "0", entry.key);
    if (!exists) {
      thumbFile.removeKey(entry.key);
    }
    delete entry.metadata.xmp;
    thumbFile.put(entry);
  }
  await thumbFile.save();
});
