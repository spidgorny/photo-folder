import { getPasswordFor } from "@/app/api/s3/files/[prefix]/getThumbnailsFallbackToFiles";
import { runTest } from "@/test/bootstrap.ts";
import { getS3Storage } from "@lib/S3Storage.ts";

void runTest(async () => {
	const s3 = getS3Storage();
	let folders = await s3.listFolders();
	let foldersWithInfo = await Promise.all(
		folders.map(async (folder) => {
			const password = await getPasswordFor(folder.key);
			return { key: folder.key, password };
		}),
	);
	console.table(foldersWithInfo);
	// const files = await s3.list("2025-portugal");
	// console.table(files);
});
