import { getPlaiceholder } from "plaiceholder";
import { FOLDER } from "../files";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";

export default async (req: NextApiRequest, res: NextApiResponse) => {
	let imageFile = path.join(FOLDER, req.query.file as string);
	// imageFile = imageFile.replaceAll(/\\/g, "/");
	// imageFile = imageFile.replace(/C:/, "/c");
	// console.log({ imageFile });
	const imageBlob = fs.readFileSync(imageFile);
	const { css, base64 } = await getPlaiceholder(imageBlob);
	res.status(200);
	res.setHeader("cache-control", "public, max-age=999999999");
	res.json({ css, base64 });
};
