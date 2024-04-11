import { NextRequest, NextResponse } from "next/server";
import { getS3Storage } from "../../../../lib/S3Storage.ts";
import path from "path";

export async function POST(req: NextRequest) {
	const formData = await req.formData();
	console.log(formData);
	const files = formData.getAll("file") as File[];
	console.log(files);

	const prefix = formData.get("prefix") as string;
	console.log({ prefix });
	const s3 = getS3Storage();
	for (let file of files) {
		try {
			const basename = path.basename(file.name);
			const res = await s3.put(
				`${prefix}/${basename}`,
				Buffer.from(await file.arrayBuffer()),
			);
			console.log(basename, res);
		} catch (err) {
			console.error(err);
		}
	}
	return NextResponse.json({ status: "ok" });
}
