"use server";

import { getS3Storage } from "@/lib/S3Storage.ts";
import { S3File } from "@/lib/s3-file.ts";
import invariant from "@/lib/invariant.ts";
import axios from "axios";

export async function updateThumbnailFile(fileName: string, files: S3File[]) {
	files = files.map((x) => ({ ...x, created: undefined }));
	const s3 = getS3Storage();
	const bytes = await s3.getString(fileName);
	const oldJson = JSON.parse(bytes);
	const newJson = JSON.stringify(files);
	// console.log({
	// 	existing: bytes.length,
	// 	newJson: newJson.length,
	// 	oldLength: oldJson.length,
	// 	newLength: files.length,
	// });
	console.log(oldJson[0], files[0]);
	// invariant(bytes.length === newJson.length, "wrong files size");
	return await s3.put(fileName, newJson);
}

export async function reindexFile(fileKey: string) {
	try {
		const apiUrl =
			"https://u7gkfc0ife.execute-api.eu-central-1.amazonaws.com/handle-upload";
		let payload = {
			file: fileKey,
		};
		console.log(apiUrl, payload);
		const res = await axios.post(apiUrl, payload);
		console.log(res.data);
	} catch (err) {
		console.error("AXIOS ERROR", err);
	}
}
