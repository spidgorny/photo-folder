import { NextApiRequest, NextApiResponse } from "next";
import { getS3Storage } from "../index";
import { promisify } from "node:util";
import { getPlaiceholder } from "plaiceholder";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  let queryKey = req.query.key as string[];
  const s3 = getS3Storage();
  const s3get = promisify(s3.get.bind(s3));
  const bytes = await s3get(queryKey.join("/"));
  res.status(200);
  res.setHeader("cache-control", "public, max-age=999999999");
  res.setHeader("content-type", "image/jpeg");
  res.send(bytes);
};
