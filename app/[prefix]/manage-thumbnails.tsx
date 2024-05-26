import { useFiles, useThumbnails } from "@/components/use-thumbnails.tsx";
import React from "react";
import { SaveButton } from "spidgorny-react-helpers/save-button.tsx";
import { sortBy } from "spidgorny-react-helpers/lib/array.ts";
import { reindexFile, updateThumbnailFile } from "@/app/[prefix]/actions.ts";
import { useWorking } from "spidgorny-react-helpers/use-working.tsx";
import { S3File } from "@/lib/s3-file.ts";

export function ManageThumbnails(props: { prefix: string; close: () => void }) {
	const { files, mutateThumbnails } = useThumbnails(props.prefix);
	const { uploads } = useFiles(props.prefix);
	const { isWorking, wrapWorking } = useWorking();

	const sortByTime = wrapWorking(async () => {
		const sorted = files.toSorted(sortBy((x) => x.created ?? x.modified));
		await updateThumbnailFile(`${props.prefix}/.thumbnails.json`, sorted);
		await mutateThumbnails();
	});

	const isPerfectlySorted =
		files
			.toSorted(sortBy((x) => x.created ?? x.modified))
			.map((x) => x.key)
			.join(",") === files.map((x) => x.key).join(",");

	const uploadsWithoutThumbnails = uploads.filter(
		(file) => !files.some((x) => x.key === file.key),
	);

	return (
		<div>
			<h5>Uploads without Thumbnails ({uploadsWithoutThumbnails.length})</h5>
			<table className="table">
				<tbody>
					{uploadsWithoutThumbnails.map((file) => (
						<FileRow
							key={file.key}
							prefix={props.prefix}
							file={file}
							thumbList={files}
						/>
					))}
				</tbody>
			</table>
			<div className="d-flex justify-content-between">
				<h5>Thumbnails {files.length}</h5>
				<SaveButton
					className="gap-2 align-items-center"
					onClick={async () => {
						await sortByTime(null);
						return;
					}}
					isWorking={isWorking}
					disabled={isPerfectlySorted}
				>
					Sort By Time
				</SaveButton>
			</div>
			<table className="table">
				<tbody style={{ fontSize: "10pt" }}>
					{files.map((file) => (
						<FileRow
							key={file.key}
							prefix={props.prefix}
							file={file}
							thumbList={files}
						/>
					))}
				</tbody>
			</table>
		</div>
	);
}

const FileRow = (props: {
	prefix: string;
	file: S3File;
	thumbList: S3File[];
}) => {
	const { mutateThumbnails } = useThumbnails(props.prefix);
	const { isWorking, wrapWorking } = useWorking();

	const reindex = wrapWorking(async () => {
		await reindexFile(props.file.key);
		await mutateThumbnails();
	});

	return (
		<tr>
			<td>
				{props.thumbList.some((x) => props.file.key === x.key) ? (
					"✅"
				) : (
					<SaveButton onClick={() => reindex(null)} isWorking={isWorking}>
						🔴
					</SaveButton>
				)}
			</td>
			<td>
				<img src={props.file.base64} width={32} height={32} />
			</td>
			<td>{props.file.key.split("/").slice(-1)[0]}</td>
			<td>{props.file.size}</td>
			<td align="right" className="font-monospace">
				{new Date(props.file.created ?? props.file.modified)
					.toISOString()
					.substring(0, 19)}
			</td>
		</tr>
	);
};
