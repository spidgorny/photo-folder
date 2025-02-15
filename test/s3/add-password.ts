import { runTest } from "@/test/bootstrap.ts";
import { getS3Storage } from "@lib/S3Storage.ts";
import { getPasswordFor } from "@/app/api/s3/files/[prefix]/getThumbnailsFallbackToFiles.ts";
import { nanoid } from "nanoid";
import path from "path";

void runTest(async () => {
	const s3 = getS3Storage();
	let prefix = "2025-portugal-best";
	let password = await getPasswordFor(prefix);
	if (password) {
		console.log("password", password);
		return;
	}
	const putRes = await s3.put(
		path.posix.join(prefix, ".password.json"),
		JSON.stringify({ password: nanoid() }),
	);
	console.log(putRes);
	password = await getPasswordFor(prefix);
	console.log("password", password);
});
