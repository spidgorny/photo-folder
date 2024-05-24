import { NextApiRequest, NextApiResponse } from "next";
import { getS3Storage } from "@/lib/S3Storage.ts";
import { S3File } from "@/lib/s3-file.ts";

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const prefix = req.query.prefix;
	const s3 = getS3Storage();
	try {
		const bytes = await s3.getString(`${prefix}/.thumbnails.json`);
		let files = JSON.parse(bytes) as S3File[];
		files = files.map((file) => {
			const parts = file.key.match(/20(\d\d)(\d\d)(\d\d)_(\d\d)(\d\d)(\d\d)/);
			const created = parts
				? new Date(
						`20${parts[1]}-${parts[2]}-${parts[3]} ${parts[4]}-${parts[5]}-${parts[6]}Z`,
					)
				: undefined;
			return { ...file, created };
		});
		return res.status(200).json({ files });
	} catch (err) {
		console.error(err);
		const files = await s3.list(prefix as string);
		// console.log("files", files.length);
		return res.status(200).json({ files });
	}
};
