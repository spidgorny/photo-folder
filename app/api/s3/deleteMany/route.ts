import { NextRequest, NextResponse } from "next/server";
import { getS3Storage, S3Storage } from "../../../../lib/S3Storage.ts";
import { ThumbFile, ThumbFileS3 } from "../../../../lib/thumb-file.ts";
import { S3File } from "../../../../lib/s3-file.ts";
import invariant from "tiny-invariant";

export async function DELETE(req: NextRequest) {
	const formData = await req.json();
	console.log(formData);
	const keysToDelete = formData.keys as string[];
	console.log({ keysToDelete });
	invariant(keysToDelete.length);
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
