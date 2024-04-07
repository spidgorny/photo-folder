import { NextApiRequest, NextApiResponse } from "next";
import { getS3Storage } from "../../../lib/S3Storage";

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const prefix = req.query.prefix;
	const s3 = getS3Storage();
	try {
		const bytes = await s3.get(`${prefix}/.thumbnails.json`);
		const files = JSON.parse(bytes);
		return res.status(200).json({ files });
	} catch (err) {
		console.error(err);
		const files = await s3.list(prefix as string);
		// console.log("files", files.length);
		return res.status(200).json({ files });
	}
};
