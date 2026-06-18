import { S3Event } from "aws-lambda";
import { getS3Storage, S3Storage } from "../lib/S3Storage";
import { time, UploadObject, urlDecode } from "./utils.ts";
import { handlePlaceholder } from "./handle-placeholder.ts";
import { handleThumbnail } from "./handle-thumbnail.ts";
import path from "path";
import { Logger } from "../lib/logger";
import { APIGatewayProxyEvent } from "aws-lambda/trigger/api-gateway-proxy";
import invariant from "../lib/invariant";
import { handleUploadObject, preventRunningIfWrongFileUploaded } from "./handle-upload";

export async function handlerApi(event: APIGatewayProxyEvent) {
	try {
		// HTTP API Gateway v2 uses requestContext.http.method, API Gateway v1 uses httpMethod
		const httpMethod = (event as any).requestContext?.http?.method || event.httpMethod;
		invariant(httpMethod === "POST", "must be POST");
		invariant(event.body, "event without body");
		console.log("API Event", event.body);
		const body = JSON.parse(event.body);
		const file = body.file as string;
		const logger = new Logger(file);

		const s3 = getS3Storage();
		const possible = await s3.list(file);
		const uploadObject = possible.find((o) => o.key === file);
		if (!uploadObject) {
			return { status: "error", message: `File ${file} not found` };
		}
		const output = await handleUploadObject(s3, logger, uploadObject);

		return {
			status: "ok",
			event,
			output,
		};
	} catch (e) {
		invariant(e instanceof Error, "error is not an Error");
		return {
			status: "error",
			message: e.message,
			stack: e.stack?.split("\n"),
		};
	}
}

export async function handler(event: S3Event) {
	console.log("event", event);
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
    invariant(e instanceof Error, "error is not Error");
		// @ts-ignore
		logger.log("ERROR", e.message, e.stack?.split("\n"));
	}
}
