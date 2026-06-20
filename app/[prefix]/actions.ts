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
		let payload = JSON.stringify({ file: fileKey });
		console.log("[ReindexFile] POST to Lambda:", apiUrl, "with payload:", payload);
		const response = await axios.post(apiUrl, payload, { headers: { "Content-Type": "application/json" } });
  if (response.status !== 200) {
    console.error('[ReindexFile] Lambda upload failed', response.status, response.data);
    throw new Error(`Lambda upload failed with status ${response.status}: ${JSON.stringify(response.data)}`);
  }
  console.log('[ReindexFile] Lambda response:', response.data);
	} catch (err) {
		if (axios.isAxiosError(err)) {
			console.error("[ReindexFile] Axios error details:", {
				message: err.message,
				status: err.response?.status,
				statusText: err.response?.statusText,
				data: err.response?.data,
				url: err.config?.url,
				method: err.config?.method,
				headers: err.config?.headers,
			});
			const errorMessage = `Failed to regenerate thumbnail for ${fileKey}: ${err.response?.status} ${err.response?.statusText} - ${JSON.stringify(err.response?.data)}`;
			throw new Error(errorMessage);
		} else if (err instanceof Error) {
			console.error("[ReindexFile] Error:", {
				message: err.message,
				stack: err.stack,
				name: err.name,
			});
			throw new Error(`Failed to regenerate thumbnail for ${fileKey}: ${err.message}`);
		} else {
			console.error("[ReindexFile] Unknown error:", err);
			throw new Error(`Failed to regenerate thumbnail for ${fileKey}: ${String(err)}`);
		}
	}
}

// New function: trigger thumbnail generation for all missing files with concurrency pool
export async function regenerateMissingThumbnails(
	prefix: string,
	onProgress?: (progress: { completed: number; processing: string[]; total: number }) => void,
) {
	const s3 = getS3Storage();
	const errors: { file: string; error: string }[] = [];
	const CONCURRENCY = 10;

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

	let completed = 0;
	let successCount = 0;
	const processing = new Set<string>();
	const queue = [...missing];

	const processNext = async (): Promise<void> => {
		if (queue.length === 0) return;

		const file = queue.shift()!;
		processing.add(file.key);

		// Notify progress
		onProgress?.({
			completed,
			processing: Array.from(processing),
			total: missing.length,
		});

		try {
			await reindexFile(file.key);
			successCount++;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : String(err);
			console.error(`Failed to regenerate thumbnail for ${file.key}:`, errorMessage);
			errors.push({ file: file.key, error: errorMessage });
		} finally {
			processing.delete(file.key);
			completed++;

			// Notify progress
			onProgress?.({
				completed,
				processing: Array.from(processing),
				total: missing.length,
			});

			// Process next file if available
			await processNext();
		}
	};

	// Start initial batch of concurrent workers
	const workers = Math.min(CONCURRENCY, queue.length);
	const initialWorkers = Array.from({ length: workers }, () => processNext());
	await Promise.all(initialWorkers);

	return {
		triggered: successCount,
		failed: errors.length,
		totalUploads: uploads.length,
		errors,
	};
}
