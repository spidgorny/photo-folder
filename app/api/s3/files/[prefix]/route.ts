import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { getThumbnailsFallbackToFiles } from "./getThumbnailsFallbackToFiles";

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

	// Use thumbnails.json to get base64 data for thumbnails
	const files = await getThumbnailsFallbackToFiles(prefix);
	return NextResponse.json({ files });
}
