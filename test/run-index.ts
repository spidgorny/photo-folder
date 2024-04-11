import { runTest } from "./bootstrap";
import { getPlaiceholder } from "plaiceholder";
import invariant from "tiny-invariant";
import { getS3Storage } from "../lib/S3Storage";
import { ThumbFile } from "../lib/thumb-file";

import { S3File } from "../lib/s3-file";

void runTest(async () => {
	const s3 = getS3Storage();
	const prefix = "2024 Cyprus";
	const files: S3File[] = await s3.list(prefix);
	invariant(files.length, `not files in ${prefix}`);
	// console.table(files);

	const thumbFile = new ThumbFile(prefix);
	await thumbFile.init();
	try {
		for (let [index, file] of files.entries()) {
			console.log("==", index, "/", files.length, file.key);
			if (thumbFile.existsKey(file.key) && thumbFile.get(file.key)?.metadata) {
				// don't process already processed
				continue;
			}
			const bytes = await s3.getBuffer(file.key);
			let { css, base64, metadata } = await getPlaiceholder(bytes, {
				autoOrient: true,
				size: 8,
			});
			delete metadata.icc;
			delete metadata.exif;
			delete metadata.xmp;
			thumbFile.put({ ...file, css, base64, metadata });
			if (!(index % 10)) {
				await thumbFile.save();
			}
		}
	} catch (error) {
		console.error(error);
	}
	await thumbFile.save();
});
