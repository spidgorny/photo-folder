"use server";

import axios from "axios";
import { getS3Storage } from "@/lib/S3Storage.ts";
import invariant from "@/lib/invariant";
import { S3File } from "@/lib/s3-file";
import AxiosError from "axios-error";

export async function updateThumbnailFile(fileName: string, files: S3File[]) {
	const s3 = getS3Storage();
	const bytes = await s3.getString(fileName);
	const oldJson = JSON.parse(bytes);

	// Create a map of old files by key to preserve all properties
	const oldFilesMap = new Map(oldJson.map((f: any) => [f.key, f]));

	// Sort the files but preserve all properties from original data
	const mergedFiles = files.map((file) => {
		const oldFile = oldFilesMap.get(file.key);
		if (oldFile) {
			// Preserve all properties from the original file, just update with sorted order
			return { ...oldFile, created: undefined };
		}
		return { ...file, created: undefined };
	});

	const newJson = JSON.stringify(mergedFiles);
	console.log("Updated thumbnail file with", mergedFiles.length, "files");
	return await s3.put(fileName, newJson);
}

// Server action to reindex a single file
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
