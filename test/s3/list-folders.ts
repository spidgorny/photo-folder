import { runTest } from "@/test/bootstrap.ts";
import { getS3Storage } from "@lib/S3Storage.ts";

void runTest(async () => {
	const s3 = getS3Storage();
	const folders = await s3.listFolders();
	console.table(folders);
	const files = await s3.list("2025-portugal");
	console.table(files);
});
