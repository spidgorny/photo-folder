import { NextRequest, NextResponse } from "next/server";
import { getS3Storage } from "@lib/S3Storage.ts";
import { S3File } from "@lib/s3-file.ts";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ prefix: string }> },
) {
	const { prefix } = await params;
	const s3 = getS3Storage();
	try {
		const bytes = await s3.getString(`${prefix}/.thumbnails.json`);
		let files = JSON.parse(bytes) as S3File[];
		files = files.map((file) => {
			const parts = file.key.match(/20(\d\d)(\d\d)(\d\d)_?(\d\d)(\d\d)(\d\d)/);
			if (!parts) {
				return file;
			}
			let sFormat = `20${parts[1]}-${parts[2]}-${parts[3]}T${parts[4]}:${parts[5]}:${parts[6]}Z`;
			const created = parts ? new Date(sFormat) : undefined;
			return { ...file, created };
		});
		return NextResponse.json({ files });
	} catch (err) {
		console.error(err);
		const files = await s3.list(prefix as string);
		// console.log("files", files.length);
		return NextResponse.json({ files });
	}
}
