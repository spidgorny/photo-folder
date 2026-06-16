"use server";

import axios from "axios";
import { getS3Storage } from "@/lib/S3Storage.ts";
import invariant from "@/lib/invariant";
import { S3File } from "@/lib/s3-file";
import AxiosError from "axios-error";

export async function updateThumbnailFile(fileName: string, files: S3File[]) {
	files = files.map((x) => ({ ...x, created: undefined }));
	const s3 = getS3Storage();
	const bytes = await s3.getString(fileName);
	const oldJson = JSON.parse(bytes);
	const newJson = JSON.stringify(files);
	console.log(oldJson[0], files[0]);
	return await s3.put(fileName, newJson);
}

export async function reindexFile(fileKey: string) {
	try {
		const apiUrl = process.env.LAMBDA_HANDLE_UPLOAD;
		invariant(apiUrl, "LAMBDA_HANDLE_UPLOAD missing");
		let payload = {
			file: fileKey,
		};
		console.log("POST", apiUrl, payload);
		const response = await axios.post(apiUrl, payload, {
			headers: { "Content-Type": "application/json" },
		});
		console.log("lambda <", response.data);
	} catch (err) {
		console.error("UPLOAD ERROR", new AxiosError(err));
	}
}

// New function: trigger thumbnail generation for all missing files
export async function regenerateMissingThumbnails(prefix: string) {
	const s3 = getS3Storage();

	// Get all uploaded files
	const allFiles = await s3.list(prefix);
	const uploads = allFiles.filter((f) => !f.key.endsWith("/"));

	// Get current thumbnails list
	let thumbnails: S3File[] = [];
	try {
		const bytes = await s3.getString(`${prefix}/.thumbnails.json`);
		thumbnails = JSON.parse(bytes);
	} catch (e) {
		console.log("No .thumbnails.json yet, will create one");
	}

	const existingKeys = new Set(thumbnails.map((t) => t.key));
	const missing = uploads.filter((f) => !existingKeys.has(f.key));

	console.log(`Found ${missing.length} files missing thumbnails in ${prefix}`);

	for (const file of missing) {
		console.log(`Triggering regeneration for: ${file.key}`);
		await reindexFile(file.key);
		// Small delay to avoid overwhelming the Lambda
		await new Promise((r) => setTimeout(r, 800));
	}

	return {
		triggered: missing.length,
		totalUploads: uploads.length,
	};
}
