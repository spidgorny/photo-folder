import { NextApiRequest, NextApiResponse } from "next";
import { getS3Storage } from "../../../../lib/S3Storage";

export default async (req: NextApiRequest, res: NextApiResponse) => {
	let queryKey = req.query.key as string[];
	queryKey.splice(-1, 0, ".thumbnails");
	const s3 = getS3Storage();
	const bytes = await s3.getBuffer(queryKey.join("/"));
	res.status(200);
	res.setHeader("cache-control", "public, max-age=31536000");
	res.setHeader("content-type", "image/jpeg");
	res.send(bytes);
};
