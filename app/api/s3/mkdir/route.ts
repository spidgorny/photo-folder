import { NextRequest, NextResponse } from "next/server";
import { getS3Storage } from "../../../../lib/S3Storage.ts";

export async function POST(req: NextRequest) {
	const formData = await req.json();
	console.log(formData);
	const prefix = formData.name;

	const s3 = getS3Storage();
	const res = await s3.put(`${prefix}/.empty`, "");
	return NextResponse.json({ status: "ok", res });
}
