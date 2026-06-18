import path from "node:path";
import { time, UploadObject } from "./utils.ts";
import { S3Storage } from "../lib/S3Storage";
import { Logger } from "../lib/logger";
import { handlePlaceholder } from "./handle-placeholder.ts";
import { handleThumbnail } from "./handle-thumbnail.ts";

export function preventRunningIfWrongFileUploaded(uploadObject: UploadObject) {
	if (uploadObject.key.includes("/.thumbnails/")) {
		throw new Error("ignore files in .thumbnails/ folder");
	}
	const allowedFiles = [
		"jpeg",
		"jpg",
		"png",
		"webp",
		"gif",
		"avif",
		"tiff",
		"svg",
	];
	if (!allowedFiles.some((ext) => uploadObject.key.endsWith(ext))) {
		throw new Error(`wrong extension [${path.extname(uploadObject.key)}]`);
	}
}

export async function handleUploadObject(
	s3: S3Storage,
	logger: Logger,
	uploadObject: UploadObject,
) {
	const prefix = uploadObject.key.split("/")[0];
	logger.log({ prefix });

	logger.log("getBuffer", uploadObject.key);
	const bytes = await s3.getBuffer(uploadObject.key);
	logger.log("handlePlaceholder");
	const timePlaceholder = await time(
		async () =>
			await handlePlaceholder(s3, logger, prefix, uploadObject, bytes),
	);
	logger.log("handleThumbnail");
	const timeThumbnail = await time(
		async () => await handleThumbnail(s3, logger, prefix, uploadObject, bytes),
	);

	logger.log({ timePlaceholder, timeThumbnail });
	let output = {
		uploadObject,
		timePlaceholder,
		timeThumbnail,
	};
	logger.log(output);
	return output;
}

