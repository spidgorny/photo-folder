import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { getS3Storage } from "../../../../lib/S3Storage.ts";
import path from "path";

export async function POST(req: NextRequest) {
	// Authenticate user
	const user = await getAuthenticatedUser(req);
	if (!user) {
		return new NextResponse("Unauthorized", { status: 401 });
	}

	const formData = await req.formData();
	console.log(formData);
	const files = formData.getAll("file") as File[];
	// console.log(files);

	const prefix = formData.get("prefix") as string;
	console.log({ prefix });

	// Check if user is allowed to upload to this prefix
	if (user.allowedPrefixes && user.allowedPrefixes.length > 0) {
		const normalizedPrefix = prefix.replace(/^\/+|\/+$/g, '');
		const isAllowed = user.allowedPrefixes.some((allowedPrefix: string) => {
			const normalizedAllowed = allowedPrefix.replace(/^\/+|\/+$/g, '');
			return normalizedPrefix === normalizedAllowed || normalizedPrefix.startsWith(`${normalizedAllowed}/`);
		});
		if (!isAllowed) {
			return new NextResponse("Not allowed to upload to this folder", { status: 403 });
		}
	}

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
