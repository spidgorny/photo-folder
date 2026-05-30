import { NextApiRequest, NextApiResponse } from "next";
import { getPlaiceholder } from "plaiceholder";
import { getS3Storage } from "@lib/S3Storage.ts";

export default async (req: NextApiRequest, res: NextApiResponse) => {
	let queryKey = req.query.key as string[];
	const s3 = getS3Storage();
	const bytes = await s3.getBuffer(queryKey.join("/"));
	const { css, base64 } = await getPlaiceholder(bytes, { autoOrient: true });
	res.status(200);
	res.setHeader("cache-control", "public, max-age=999999999");
	res.json({ css, base64 });
};
