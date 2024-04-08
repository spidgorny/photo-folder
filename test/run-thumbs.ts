import { runTest } from "./bootstrap";
import fs from "fs";
import { getPlaiceholder } from "plaiceholder";
import path from "path";
import invariant from "tiny-invariant";
import { getS3Storage } from "../lib/S3Storage";
import sharp from "sharp";

import { S3File } from "../lib/s3-file";

void runTest(async () => {
	const s3 = getS3Storage();
	const prefix = "2024 Cyprus";
	const files: S3File[] = await s3.list(prefix);
	invariant(files.length, `not files in ${prefix}`);

	for (let [index, file] of files.entries()) {
		const thumbPath = `${prefix}/.thumbnails/${path.basename(file.key)}`;
		if (await s3.exists(thumbPath)) {
			// don't process already processed
			continue;
		}
		console.log("==", index, "/", files.length, file.key);
		let thumbnail: Buffer;
		const bytes = await s3.getBuffer(file.key);
		const src = sharp(bytes);
		let metadata = await src.metadata();
		if (metadata.width > metadata.height) {
			thumbnail = await src.resize({ width: 1200 }).toBuffer();
		} else {
			thumbnail = await src.resize({ height: 1200 }).toBuffer();
		}
		await s3.put(thumbPath, thumbnail);
	}
});
