import { runTest } from "../bootstrap.ts";
import { getS3Storage } from "@lib/S3Storage.ts";
import fs from "fs";

void runTest(async () => {
	const prefix = "2025-portugal";

	const s3 = getS3Storage();
	const bytes = await s3.getString(`${prefix}/.thumbnails.json`);
	fs.writeFileSync(`${prefix}.json`, bytes);
});
