import { NextApiRequest, NextApiResponse } from "next";
import { getS3Storage } from "@/lib/S3Storage.ts";

export default async (req: NextApiRequest, res: NextApiResponse) => {
	let queryKey = Array.isArray(req.query.key)
		? req.query.key.flatMap((x) => x.split("/"))
		: req.query?.key?.split("/") ?? [];
	queryKey.splice(-1, 0, ".thumbnails");
	const s3 = getS3Storage();

	try {
		const bytes = await s3.getBuffer(queryKey.join("/"));
		res.status(200);
		res.setHeader("cache-control", "public, immutable, max-age=31536000");
		res.setHeader("content-type", "image/jpeg");
		res.setHeader("content-length", bytes.length);
		res.send(bytes);
	} catch (error: any) {
		// If thumbnail doesn't exist, fall back to original image
		if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
			try {
				const originalKey = Array.isArray(req.query.key)
					? req.query.key.join("/")
					: req.query.key || "";
				const bytes = await s3.getBuffer(originalKey);
				res.status(200);
				res.setHeader("cache-control", "public, max-age=3600");
				res.setHeader("content-type", "image/jpeg");
				res.setHeader("content-length", bytes.length);
				res.send(bytes);
			} catch (fallbackError: any) {
				res.status(404).json({ error: "Image not found" });
			}
		} else {
			console.error("Error fetching thumbnail:", error);
			res.status(500).json({ error: "Failed to fetch image" });
		}
	}
};
