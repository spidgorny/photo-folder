import { NextApiRequest, NextApiResponse } from "next";
import { getS3Storage } from "@/lib/S3Storage.ts";

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const prefix = req.query.prefix as string;
	const s3 = getS3Storage();
	const files = await s3.list(prefix);
	return res.status(200).json({ files });
};
