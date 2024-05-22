"use client";
import { useParams } from "next/navigation";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import React from "react";
import "yet-another-react-lightbox/plugins/captions.css";
import { LightboxPreview } from "./lightbox-preview.tsx";
import { useThumbnails } from "../../../../components/use-thumbnails.tsx";
import { urlDecode } from "../../../../upload-handler/utils.ts";

export default function PreviewPage() {
	const params = useParams<{ prefix: string; key: string[] }>();
	if (!params?.prefix) {
		return (
			<div className="flex justify-content-center py-5">Loading Params...</div>
		);
	}
	let paramsKey = params.key.map((x) => urlDecode(x));
	console.log("prefix", params.prefix, paramsKey);
	return (
		<PreviewLoader
			prefix={params.prefix as string}
			selectedFile={paramsKey as string[]}
		/>
	);
}

function PreviewLoader(props: { prefix: string; selectedFile: string[] }) {
	const { data, error, isLoading } = useThumbnails(props.prefix);

	const fileKey = (props?.selectedFile as string[])?.join("/");
	if (!data?.files) {
		return "Loading...";
	}

	const slides = data.files.map((x, index) => ({
		src: `/api/s3/jpg/${x.key}`,
		alt: x.key,
		title: `${x.key} [${index + 1}/${data.files.length}]`,
		description: `${x.size} bytes, ${x.modified}`,
		srcSet: [
			{ src: `/api/s3/thumb/${x.key}`, width: 1280, height: 576 },
			{ src: `/api/s3/jpg/${x.key}`, width: 4000, height: 1800 },
		],
	}));

	return (
		<LightboxPreview
			// key={data?.files?.length}
			prefix={props.prefix}
			files={data.files}
			slides={slides}
			fileKey={fileKey}
		/>
	);
}
