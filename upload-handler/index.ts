import { S3Event } from "aws-lambda";
import { getS3Storage, S3Storage } from "../lib/S3Storage";
import { time, UploadObject, urlDecode } from "./utils.ts";
import { handlePlaceholder } from "./handle-placeholder.ts";
import { handleThumbnail } from "./handle-thumbnail.ts";
import path from "path";
import { Logger } from "../lib/logger.ts";
import { APIGatewayProxyEvent } from "aws-lambda/trigger/api-gateway-proxy";
import invariant from "../lib/invariant";

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

async function handleUploadObject(
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

export async function handlerApi(event: APIGatewayProxyEvent) {
	try {
		invariant(event.httpMethod === "POST", "must be POST");
		invariant(event.body, "event without body");
		const body = JSON.parse(event.body);
		const file = body.file as string;
		const logger = new Logger(file);

		const s3 = getS3Storage();
		const [uploadObject] = await s3.list(file);
		const output = await handleUploadObject(s3, logger, uploadObject);

		return {
			status: "ok",
			event,
			output,
		};
	} catch (e) {
		return {
			status: "error",
			message: e.message,
			stack: e.stack?.split("\n"),
		};
	}
}

export async function handler(event: S3Event) {
	// console.log(event);
	let uploadObject = event.Records[0].s3.object as UploadObject;
	uploadObject.key = urlDecode(uploadObject.key);
	const logger = new Logger(uploadObject.key);
	try {
		let envSorted = Object.fromEntries(
			Object.entries(process.env).sort((a, b) => a[0].localeCompare(b[0])),
		);
		logger.log(envSorted);
		logger.log(uploadObject);
		preventRunningIfWrongFileUploaded(uploadObject);

		const s3 = getS3Storage();
		return await handleUploadObject(s3, logger, uploadObject);
	} catch (e) {
		logger.log("ERROR", e.message, e.stack.split("\n"));
	}
}
