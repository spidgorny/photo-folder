import { S3Event } from "aws-lambda";
import { getS3Storage } from "../lib/S3Storage";
import { time, UploadObject, urlDecode } from "./utils.ts";
import { handlePlaceholder } from "./handle-placeholder.ts";
import { handleThumbnail } from "./handle-thumbnail.ts";
import path from "path";

function preventRunningIfWrongFileUploaded(uploadObject: UploadObject) {
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

export async function handler(event: S3Event) {
	console.log(event);
	let uploadObject = event.Records[0].s3.object;
	uploadObject.key = urlDecode(uploadObject.key);
	console.log(uploadObject);
	const prefix = uploadObject.key.split("/")[0];
	console.log({ prefix });
	preventRunningIfWrongFileUploaded(uploadObject);

	const s3 = getS3Storage();
	const bytes = await s3.getBuffer(uploadObject.key);
	const timePlaceholder = await time(
		async () => await handlePlaceholder(s3, prefix, uploadObject, bytes),
	);
	const timeThumbnail = await time(
		async () => await handleThumbnail(s3, prefix, uploadObject, bytes),
	);

	console.log({ timePlaceholder, timeThumbnail });
	return {
		statusCode: 200,
		body: JSON.stringify(
			{
				uploadObject,
				timePlaceholder,
				timeThumbnail,
			},
			null,
			2,
		),
	};
}
