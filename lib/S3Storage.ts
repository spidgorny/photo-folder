import invariant from "tiny-invariant";
// import s3_storage from "s3-storage";
import { promisify } from "node:util";
import toArray from "stream-to-array";
import {
	GetObjectCommand,
	GetObjectCommandInput,
	HeadObjectCommand,
	ListObjectsV2Command,
	ListObjectsV2CommandOutput,
	PutObjectCommand,
	PutObjectCommandInput,
	S3Client,
} from "@aws-sdk/client-s3";
import { S3File } from "./s3-file";
import fs from "fs";
import { Progress, Upload } from "@aws-sdk/lib-storage";
import { Logger } from "./logger";
import path from "path";
import { Transform } from "stream";
import http from "http";
import { StreamingBlobPayloadOutputTypes } from "@smithy/types";
import { onlyOncePerSecond } from "./date";

export class S3Storage {
	protected s3: S3Client;
	protected logger: Logger;

	constructor(
		protected bucketName: string,
		protected options: {
			accessKeyId: string;
			secretAccessKey: string;
			region: string;
		},
	) {
		this.s3 = new S3Client({
			region: options.region,
			// requestHandler: new FetchHttpHandler({}),
		});
		this.logger = new Logger("S3Storage");
	}

	async list(Prefix?: string): Promise<S3File[]> {
		const data = await this.s3.send(
			new ListObjectsV2Command({
				Bucket: this.bucketName,
				Prefix,
			}),
		);
		return data.Contents.map((x) => ({
			key: x.Key,
			size: x.Size,
			modified: x.LastModified?.toISOString(),
		}));
	}

	async uploadS3File(Key: string, filePath: string) {
		const startTime = Date.now();
		const upload = new Upload({
			// @ts-ignore
			client: this.s3,
			params: {
				Bucket: this.bucketName,
				Key,
				Body: fs.createReadStream(filePath),
			},
		});

		upload.on("httpUploadProgress", (progress: Progress) => {
			if (!progress.loaded || !progress.total) {
				return;
			}
			this.logger.progress(
				progress.loaded / progress.total,
				this.logger.bytesPerSecond(progress.loaded, startTime),
				Key,
			);
		});
		await upload.done();
	}

	async exists(Key: string) {
		try {
			// logger.log("HEAD", bucketName, Key);
			const data = await this.s3.send(
				new HeadObjectCommand({
					Bucket: this.bucketName,
					Key,
				}),
			);
			return data.$metadata.httpStatusCode === 200;
		} catch (err: any) {
			if (err.$metadata?.httpStatusCode === 404) {
				return false;
			}
			throw err;
		}
	}

	async downloadS3File(Key: string, filePath: string, fileSize?: number) {
		// logger.log("GET", bucketName, Key);

		const params: GetObjectCommandInput = {
			Bucket: this.bucketName,
			Key: Key,
		};
		const res = await this.s3.send(new GetObjectCommand(params));
		invariant(res.Body, "res.Body not there in GetObjectCommand");

		if (!fs.existsSync(path.dirname(filePath))) {
			fs.mkdirSync(path.dirname(filePath), { mode: 0o777, recursive: true });
		}
		let writeStream = fs.createWriteStream(filePath);
		await this.waitForDownloadStreamToFinish(
			res.Body,
			writeStream,
			Key,
			fileSize,
		);
	}

	async waitForDownloadStreamToFinish(
		readable: StreamingBlobPayloadOutputTypes,
		writeStream: fs.WriteStream,
		fileName: string,
		fileSize?: number,
	) {
		const self = this;
		let totalBytes = 0;
		let progressHandler = new Transform({
			transform(chunk: Buffer, encoding: BufferEncoding, callback) {
				totalBytes += chunk.length;
				onlyOncePerSecond(async () => {
					self.logger.progress(
						totalBytes / fileSize,
						fileName,
						totalBytes,
						"/",
						fileSize,
					);
				});
				this.push(chunk);
				callback();
			},
		});

		return new Promise(async (resolve, reject) => {
			(readable as http.IncomingMessage)
				.pipe(progressHandler)
				.pipe(writeStream)
				.on("error", (err: Error) => reject(err))
				.on("close", () => resolve(null));
		});
	}

	async getString(Key: string) {
		return this.get(Key).toString();
	}

	async get(Key: string) {
		const params: GetObjectCommandInput = {
			Bucket: this.bucketName,
			Key: Key,
		};
		const res = await this.s3.send(new GetObjectCommand(params));
		invariant(res.Body, "res.Body not there in GetObjectCommand");

		return Buffer.from(await res.Body.transformToByteArray());
	}

	async put(Key: string, bytes: string | Buffer) {
		const params: PutObjectCommandInput = {
			Bucket: this.bucketName,
			Key: Key,
			Body: bytes,
		};
		const res = await this.s3.send(new PutObjectCommand(params));
		return res;
	}
}

export function getS3Storage() {
	invariant(process.env.BUCKET_ACCESS_KEY_ID, "missing BUCKET_ACCESS_KEY_ID");
	invariant(
		process.env.BUCKET_SECRET_ACCESS_KEY,
		"missing BUCKET_SECRET_ACCESS_KEY",
	);
	invariant(process.env.BUCKET_NAME, "missing BUCKET_NAME");
	return new S3Storage(process.env.BUCKET_NAME, {
		accessKeyId: process.env.BUCKET_ACCESS_KEY_ID,
		secretAccessKey: process.env.BUCKET_SECRET_ACCESS_KEY,
		region: process.env.AWS_DEFAULT_REGION,
	});
}
