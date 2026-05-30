import { getS3Storage } from "@/lib/S3Storage.ts";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ prefix: string }> },
) {
	const { prefix } = await params;
	const s3 = getS3Storage();
	let files = await s3.list(prefix);
	files = files.filter((file) => !file.key.endsWith("/"));
	return NextResponse.json({ files });
}
