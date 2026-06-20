import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { getS3Storage } from "@/lib/S3Storage.ts";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ prefix: string }> },
) {
	// Authenticate user
	const user = await getAuthenticatedUser(request);
	if (!user) {
		return new NextResponse("Unauthorized", { status: 401 });
	}

	const { prefix } = await params;

	// Check if user is allowed to access this prefix
	if (user.allowedPrefixes && user.allowedPrefixes.length > 0) {
		const normalizedPrefix = prefix.replace(/^\/+|\/+$/g, '');
		const isAllowed = user.allowedPrefixes.some((allowedPrefix: string) => {
			const normalizedAllowed = allowedPrefix.replace(/^\/+|\/+$/g, '');
			return normalizedPrefix === normalizedAllowed || prefix.startsWith(`${normalizedAllowed}/`);
		});
		if (!isAllowed) {
			return new NextResponse("Not allowed to access this folder", { status: 403 });
		}
	}

	// Use fast S3 list operation instead of downloading large .thumbnails.json
	const s3 = getS3Storage();
	const files = await s3.list(prefix);
	return NextResponse.json({ files });
}
