// lib/getS3Storage.ts
import { S3Client } from "@aws-sdk/client-s3";

/**
 * Initializes and returns a singleton S3 service client instance.
 *
 * NOTE: In a real application, credentials should come from environment variables (process.env).
 */
export function getFakeS3Storage(): {
	listFolders: () => Promise<Array<{ name: string }>>;
	getPresignUrl: (key: string, contentType: string) => Promise<string>;
} {
	// Placeholder for actual S3 client setup
	const s3Client = new S3Client({
		region: process.env.AWS_REGION || "us-east-1",
	});

	return {
		/** Mimics listFolders logic from the actual AWS S3 API call */
		listFolders: async () => {
			console.log("Stub: Calling S3 to list root folders...");
			// Simulate successful data retrieval of a few sample folders
			await new Promise((resolve) => setTimeout(resolve, 200)); // Simulate network latency
			return [
				{ name: "Vacation/2024" },
				{ name: "Work_Projects" },
				{ name: "Family_Photos/2023" },
			];
		},

		/** Mimics generating a pre-signed URL for temporary upload access */
		getPresignUrl: async (key: string, contentType: string) => {
			console.log(
				`Stub: Generating presigned URL for ${key} (${contentType})...`,
			);
			// Simulate the AWS SDK call to generate the signed URL
			await new Promise((resolve) => setTimeout(resolve, 100));
			return `https://s3-bucket-name.s3.amazonaws.com/?Signature=STUB&Key=${key}&Expires=3600`;
		},
	};
}
