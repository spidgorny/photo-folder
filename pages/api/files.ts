// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export const FOLDER = "C:\\Users\\depidsvy\\Pictures\\1000 Full HD Wallpapers";

import { getPlaiceholder } from "plaiceholder";
import * as fs from "fs";
export default (req, res) => {
  const files = fs.readdirSync(FOLDER);
  res.status(200).json({ files });
};
