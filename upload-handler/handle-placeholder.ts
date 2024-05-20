import { S3Storage } from "../lib/S3Storage.ts";
import { ThumbFileS3 } from "../lib/thumb-file.ts";
import { getPlaiceholder } from "plaiceholder";
import { UploadObject } from "./utils.ts";
import { Logger } from "../lib/logger.ts";
import { ExifParserFactory } from "ts-exif-parser";

export async function handlePlaceholder(
	s3: S3Storage,
	logger: Logger,
	prefix: string,
	uploadObject: UploadObject,
	bytes: Buffer,
) {
	const thumbFile = new ThumbFileS3(s3, prefix);
	await thumbFile.init();
	logger.log("thumbFile length", thumbFile.thumbnails.length);
	let { base64, metadata } = await getPlaiceholder(bytes, {
		autoOrient: true,
		size: 8,
	});
	// console.log(metadata.exif);
	delete metadata.icc;
	delete metadata.exif;
	delete metadata.xmp;
	const modified = new Date().toISOString();

	const exif = ExifParserFactory.create(bytes)
		.enableTagNames(true)
		.enableReturnTags(true)
		.enableTagNames(true)
		.enablePointers(true)
		.enableSimpleValues(true)
		.enableImageSize(true)
		.enableBinaryFields(true)
		.parse();

	let value = {
		key: uploadObject.key,
		size: uploadObject.size,
		modified,
		base64,
		metadata,
		tags: exif.tags,
	};
	logger.log("put", value);
	thumbFile.put(value);
	await thumbFile.save();
}
