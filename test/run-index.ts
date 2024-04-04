import { runTest } from "./bootstrap";
import fs from "fs";
import { getPlaiceholder } from "plaiceholder";
import { S3File } from "../components/list-files";
import path from "path";
import invariant from "tiny-invariant";
import { getS3Storage } from "../lib/S3Storage";
import sharp from "sharp";

void runTest(async () => {
  const s3 = getS3Storage();
  const prefix = "2024 Cyprus";
  const files: S3File[] = await s3.list({ prefix });
  invariant(files.length, `not files in ${prefix}`);
  // console.table(files);
  const thumbnailFilePath = `${prefix}/thumbnails.json`;
  fs.mkdirSync(path.dirname(thumbnailFilePath), { recursive: true });
  let thumbnails = [];
  if (fs.existsSync(thumbnailFilePath)) {
    thumbnails = JSON.parse(fs.readFileSync(thumbnailFilePath, "utf8"));
  } else {
    try {
      thumbnails = JSON.parse(s3.get(`${prefix}/thumbnails.json`));
    } catch (err) {
      console.error(err);
      thumbnails = [];
    }
  }

  try {
    for (let [index, file] of files.entries()) {
      console.log("==", index, "/", files.length, file.key);
      if (thumbnails.find((x) => x.key === file.key)) {
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
      thumbnails = replaceOrAppend(
        thumbnails,
        { ...file, css, base64, metadata },
        (x: S3File) => x.key === file.key,
      );
      if (!(index % 10)) {
        fs.writeFileSync(
          thumbnailFilePath,
          JSON.stringify(thumbnails, null, 2),
        );
      }
    }
  } catch (error) {
    console.error(error);
  }
  fs.writeFileSync(thumbnailFilePath, JSON.stringify(thumbnails, null, 2));
  await s3.put(
    `${prefix}/thumbnails.json`,
    JSON.stringify(thumbnails, null, 2),
  );
});

const replaceOrAppend = (arr: any[], val: any, compFn: (v: any) => boolean) => {
  const res = [...arr];
  const i = arr.findIndex(compFn);
  // console.log("find", val.key, "=", i);
  if (i === -1) {
    res.push(val);
  } else {
    res.splice(i, 1, val);
  }
  return res;
};
