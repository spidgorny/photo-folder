import {NextApiRequest, NextApiResponse} from "next";
import { getPlaiceholder } from "plaiceholder";

export const FOLDER = "C:\\Users\\depidsvy\\Pictures\\1000 Full HD Wallpapers";

import * as fs from "fs";
export default (req: NextApiRequest, res: NextApiResponse) => {
  const files = fs.readdirSync(FOLDER);
  res.status(200).json({ files });
};
