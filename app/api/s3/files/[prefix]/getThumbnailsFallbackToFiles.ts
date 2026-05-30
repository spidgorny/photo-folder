import { getS3Storage } from "@lib/S3Storage.ts";
import { S3File } from "@lib/s3-file.ts";
import path from "node:path";

export async function getThumbnailsFallbackToFiles(prefix: string) {
	const s3 = getS3Storage();
	try {
		const bytes = await s3.getString(`${prefix}/.thumbnails.json`);
		let files = JSON.parse(bytes) as S3File[];
		files = files.map((file) => {
			const parts = file.key.match(/20(\d\d)(\d\d)(\d\d)_?(\d\d)(\d\d)(\d\d)/);
			if (!parts) {
				return file;
			}
			let sFormat = `20${parts[1]}-${parts[2]}-${parts[3]}T${parts[4]}:${parts[5]}:${parts[6]}Z`;
			const created = parts ? new Date(sFormat) : undefined;
			return { ...file, created };
		});
		return files;
	} catch (err) {
		console.error(err);
		return await s3.list(prefix);
	}
}

export async function getPasswordFor(prefix: string) {
	let passwordFileName = path.posix.join(prefix, ".password.json");
	try {
		const s3 = getS3Storage();
		const bytes = await s3.getString(passwordFileName);
		const { password } = JSON.parse(bytes);
		return password;
	} catch (err) {
		console.error(`ERROR in getPasswordFor(${passwordFileName})`, err.message);
		return undefined;
	}
}
