import { S3Storage } from "./S3Storage";
import fs from "fs";
import path from "path";

import { S3File } from "../components/use-files";

export class ThumbFile {
  protected thumbnailFilePath: string;
  thumbnails = [] as S3File[];

  constructor(
    protected s3: S3Storage,
    protected prefix: string,
  ) {
    this.thumbnailFilePath = `${this.prefix}/.thumbnails.json`;
  }

  async init() {
    fs.mkdirSync(path.dirname(this.thumbnailFilePath), { recursive: true });
    let thumbnails = [];
    if (fs.existsSync(this.thumbnailFilePath)) {
      this.thumbnails = JSON.parse(
        fs.readFileSync(this.thumbnailFilePath, "utf8"),
      );
    } else {
      try {
        this.thumbnails = JSON.parse(this.s3.get(this.thumbnailFilePath));
      } catch (err) {
        console.error(err);
        this.thumbnails = [];
      }
    }
  }

  existsKey(key: string) {
    return this.thumbnails.find((x) => x.key === key);
  }

  put(value: S3File) {
    this.thumbnails = this.replaceOrAppend(
      this.thumbnails,
      value,
      (x: S3File) => x.key === value.key,
    );
  }

  replaceOrAppend(arr: any[], val: any, compFn: (v: any) => boolean) {
    const res = [...arr];
    const i = arr.findIndex(compFn);
    // console.log("find", val.key, "=", i);
    if (i === -1) {
      res.push(val);
    } else {
      res.splice(i, 1, val);
    }
    return res;
  }

  async save() {
    fs.writeFileSync(
      this.thumbnailFilePath,
      JSON.stringify(this.thumbnails, null, 2),
    );
    await this.s3.put(
      this.thumbnailFilePath,
      JSON.stringify(this.thumbnails, null, 2),
    );
  }

  removeKey(key: string) {
    this.thumbnails = this.thumbnails.filter((x) => x.key !== key);
  }
}
