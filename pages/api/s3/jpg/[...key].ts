import { NextApiRequest, NextApiResponse } from "next";

import { getS3Storage } from "../../../../lib/S3Storage";

export default async (req: NextApiRequest, res: NextApiResponse) => {
	let queryKey = Array.isArray(req.query.key)
		? req.query.key.flatMap((x) => x.split("/"))
		: req.query?.key?.split("/") ?? [];
	const s3 = getS3Storage();
	const bytes = await s3.getBuffer(queryKey.join("/"));
	res.status(200);
	res.setHeader("cache-control", "public, immutable, max-age=31536000");
	res.setHeader("content-type", "image/jpeg");
	res.send(bytes);
};
