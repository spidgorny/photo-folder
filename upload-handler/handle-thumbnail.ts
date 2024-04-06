import { S3Storage } from "../lib/S3Storage.ts";
import { UploadObject } from "./utils.ts";
import sharp from "sharp";
import path from "path";

export async function handleThumbnail(
	s3: S3Storage,
	prefix: string,
	uploadObject: UploadObject,
	bytes: Buffer,
) {
	let thumbnail: Buffer;
	console.log("original", bytes.length);
	const src = sharp(bytes);
	let metadata = await src.metadata();
	if (metadata.width > metadata.height) {
		thumbnail = await src.resize({ width: 1200 }).toBuffer();
	} else {
		thumbnail = await src.resize({ height: 1200 }).toBuffer();
	}
	const thumbPath = `${prefix}/.thumbnails/${path.basename(uploadObject.key)}`;
	console.log("saving", thumbPath, thumbnail.length);
	await s3.put(thumbPath, thumbnail);
}
