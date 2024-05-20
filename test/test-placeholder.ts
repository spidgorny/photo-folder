import { runTest } from "./bootstrap";
import { getPlaiceholder } from "plaiceholder";
import fs from "fs";
import { ExifParserFactory } from "ts-exif-parser";
import invariant from "@/lib/invariant.ts";

void runTest(async () => {
	const bytes = fs.readFileSync("2024 Cyprus/IMG_20240518_144333.jpg");
	let { metadata } = await getPlaiceholder(bytes, {
		autoOrient: true,
		size: 8,
	});
	const { exif, ...rest } = metadata;
	console.log(metadata);
	invariant(exif, "exif missing");
	const Data = ExifParserFactory.create(bytes)
		.enableTagNames(true)
		.enableReturnTags(true)
		.enableTagNames(true)
		.enablePointers(true)
		.enableSimpleValues(true)
		.enableImageSize(true)
		.enableBinaryFields(true)
		.parse();
	console.log(Data);
});
