import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { getS3Storage, S3Storage } from "@/lib/S3Storage.ts";
import { ThumbFileS3 } from "@/lib/thumb-file.ts";
import invariant from "@/lib/invariant";

export async function DELETE(req: NextRequest) {
	// Authenticate user
	const user = await getAuthenticatedUser(req);
	if (!user) {
		return new NextResponse("Unauthorized", { status: 401 });
	}

	const formData = await req.json();
	console.log(formData);
	const keysToDelete = formData.keys as string[];
	console.log({ keysToDelete });
	invariant(keysToDelete.length, "keysToDelete length 0");

	// Check if user is allowed to delete from these prefixes
	if (user.allowedPrefixes && user.allowedPrefixes.length > 0) {
		for (const key of keysToDelete) {
			const prefix = key.split("/")[0];
			const normalizedPrefix = prefix.replace(/^\/+|\/+$/g, '');
			const isAllowed = user.allowedPrefixes.some((allowedPrefix: string) => {
				const normalizedAllowed = allowedPrefix.replace(/^\/+|\/+$/g, '');
				return normalizedPrefix === normalizedAllowed || prefix.startsWith(`${normalizedAllowed}/`);
			});
			if (!isAllowed) {
				return new NextResponse("Not allowed to delete from this folder", { status: 403 });
			}
		}
	}

	const s3 = getS3Storage();
	const res = await Promise.all(
		keysToDelete.map(async (key: string) => {
			await s3.remove(key);
			let keyParts = key.split("/");
			let thumbnailPath = [...keyParts];
			thumbnailPath.splice(-1, 0, ".thumbnails");
			console.log({ keyParts, thumbnailPath });
			await s3.remove(thumbnailPath.join("/"));
		}),
	);
	let prefix = keysToDelete[0].split("/")[0];
	await runAfterDelete(prefix, s3);
	return NextResponse.json({ status: "ok", res });
}

async function runAfterDelete(prefix: string, s3: S3Storage) {
	const files = await s3.list(prefix);
	const thumbFile = new ThumbFileS3(s3, prefix);
	await thumbFile.init();
	console.log("thumb file", thumbFile.thumbnails.length);
	let sourceDataListIsACopy = [...thumbFile.thumbnails];
	for (let entry of sourceDataListIsACopy) {
		const exists = files.find((x) => x.key === entry.key);
		console.log(exists ? "+" : "0", entry.key);
		if (!exists) {
			thumbFile.removeKey(entry.key);
		}
	}
	console.log("after delete", thumbFile.thumbnails.length);
	await thumbFile.save();
}
