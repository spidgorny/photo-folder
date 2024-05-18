import { runTest } from "./bootstrap";
import invariant from "@/lib/invariant";
import { getS3Storage } from "../lib/S3Storage";

import { S3File } from "../lib/s3-file";
import axios from "axios";

void runTest(async () => {
	const s3 = getS3Storage();
	const prefix = "marina-paintings";
	const files: S3File[] = await s3.list(prefix);
	invariant(files.length, `not files in ${prefix}`);
	console.table(files);
	const apiUrl =
		"https://u7gkfc0ife.execute-api.eu-central-1.amazonaws.com/handle-upload";

	for (let [index, file] of files.entries()) {
		console.log("==", index, "/", files.length, file.key);
		const { data } = await axios.post(apiUrl, {
			file: file.key,
		});
		console.log(data.output);
	}
});
