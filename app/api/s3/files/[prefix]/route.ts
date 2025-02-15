import { NextRequest, NextResponse } from "next/server";
import { getThumbnailsFallbackToFiles } from "@/app/api/s3/files/[prefix]/getThumbnailsFallbackToFiles.ts";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ prefix: string }> },
) {
	const { prefix } = await params;
	const files = await getThumbnailsFallbackToFiles(prefix);
	return NextResponse.json({ files });
}
