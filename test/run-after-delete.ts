import { runTest } from "./bootstrap";
import invariant from "tiny-invariant";
import { getS3Storage } from "../lib/S3Storage";
import { ThumbFile } from "../lib/thumb-file";

import { S3File } from "../lib/s3-file";

void runTest(async () => {
	const s3 = getS3Storage();
	const prefix = "2024 Cyprus";
	const files: S3File[] = await s3.list(prefix);
	console.log("s3 files", files.length);
	invariant(files.length, `not files in ${prefix}`);

	const thumbFile = new ThumbFile(prefix);
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

	await s3.put(
		thumbFile.thumbnailFilePath,
		JSON.stringify(thumbFile.thumbnails, null, 2),
	);
});
