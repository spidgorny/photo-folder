import { S3Storage } from "../lib/S3Storage.ts";
import { UploadObject } from "./utils.ts";
import sharp from "sharp";
import path from "path";
import { Logger } from "../lib/logger.ts";

export async function handleThumbnail(
	s3: S3Storage,
	logger: Logger,
	prefix: string,
	uploadObject: UploadObject,
	bytes: Buffer,
) {
	let thumbnail: Buffer;
	logger.log("original", bytes.length);
	const src = sharp(bytes);
	let metadata = await src.metadata();
	if (metadata.width > metadata.height) {
		thumbnail = await src.resize({ width: 1200 }).toBuffer();
	} else {
		thumbnail = await src.resize({ height: 1200 }).toBuffer();
	}
	const thumbPath = `${prefix}/.thumbnails/${path.basename(uploadObject.key)}`;
	logger.log("saving", thumbPath, thumbnail.length);
	await s3.put(thumbPath, thumbnail);
}
