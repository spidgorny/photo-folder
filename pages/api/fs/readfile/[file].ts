import { getPlaiceholder } from "plaiceholder";
import * as fs from "fs";
import { FOLDER } from "../files";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
export default (req: NextApiRequest, res: NextApiResponse) => {
  const bytes = fs.readFileSync(path.join(FOLDER, req.query.file as string));
  const ext = path.extname(req.query.file as string);
  const mime = {
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".jpeg": "image/jpeg",
  };
  res.status(200);
  res.setHeader("content-type", mime[ext]);
  res.setHeader("cache-control", "public, max-age=999999999");
  res.send(bytes);
};
