import { useFiles, useThumbnails } from "@/components/use-thumbnails.tsx";
import { Spinner } from "react-bootstrap";
import axios from "axios";
import React, { useState } from "react";
import { SaveButton } from "spidgorny-react-helpers/save-button.tsx";
import { sortBy } from "spidgorny-react-helpers/lib/array.ts";
import {
	reindexFile,
	updateThumbnailFile,
	regenerateMissingThumbnails,
} from "@/app/[prefix]/actions.ts";
import { useWorking } from "spidgorny-react-helpers/use-working.tsx";
import { S3File } from "@/lib/s3-file.ts";
import bytes from "bytes";

export function ManageThumbnails(props: { prefix: string; close: () => void }) {
	const { files, mutateThumbnails } = useThumbnails(props.prefix);
	const { uploads } = useFiles(props.prefix);
	const { isWorking, wrapWorking } = useWorking();

	const sortByTime = wrapWorking(async () => {
		const sorted = files.toSorted(sortBy((x) => x.created ?? x.modified));
		await updateThumbnailFile(`${props.prefix}/.thumbnails.json`, sorted);
		await mutateThumbnails();
	});

	const regenerateMissing = wrapWorking(async () => {
		const missingCount = uploads.filter(
			(file) => !files.some((x) => x.key === file.key),
		).length;

		if (
			!confirm(
				`Regenerate thumbnails for all ${missingCount} missing files? This may take a while.`,
			)
		) {
			return;
		}

		const result = await regenerateMissingThumbnails(props.prefix);
		alert(`Triggered regeneration for ${result.triggered} missing files.`);
		await mutateThumbnails();
	});

	const uploadsWithoutThumbnails = uploads.filter(
		(file) => !files.some((x) => x.key === file.key),
	);

	const isPerfectlySorted =
		files
			.toSorted(sortBy((x) => x.created ?? x.modified))
			.map((x) => x.key)
			.join(",") === files.map((x) => x.key).join(",");

	return (
		<div>
			<div className="d-flex justify-content-between align-items-center mb-3">
				<h5>Manage Thumbnails — {props.prefix}</h5>
				<button
					className="btn btn-sm btn-outline-secondary"
					onClick={props.close}
				>
					Close
				</button>
			</div>

			<div className="mb-4 p-3 border rounded bg-light">
				<button
					onClick={regenerateMissing}
					className="btn btn-success btn-lg mb-2"
					disabled={isWorking || uploadsWithoutThumbnails.length === 0}
				>
					🔄 Regenerate All Missing Thumbnails (
					{uploadsWithoutThumbnails.length})
				</button>
				<small className="text-muted d-block">
					Calls the Lambda handler for every file that is missing from{" "}
					<code>.thumbnails.json</code>.
					<br />
					Use this after bulk uploads or if thumbnails are incomplete.
				</small>
			</div>

			<h6>Uploads without Thumbnails ({uploadsWithoutThumbnails.length})</h6>
			<table className="table table-sm">
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

			<div className="d-flex justify-content-between mt-4">
				<h5>Current Thumbnails ({files.length})</h5>
				<SaveButton
					className="gap-2 align-items-center"
					onClick={async () => {
						await sortByTime(null);
					}}
					isWorking={isWorking}
					disabled={isPerfectlySorted}
				>
					Sort By Time
				</SaveButton>
			</div>

			<table className="table table-sm">
				<thead>
					<tr>
						<th colSpan={2}>Status</th>
						<th>File</th>
						<th>Size</th>
						<th className="text-end">Date</th>
					</tr></thead>
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

export function useWorkingWithError(code: () => {}) {
	const { isWorking, wrapWorking } = useWorking();
	const [ error, setError ] = useState<Error | null>(null);

	const run = wrapWorking(async () => {
		try {
			await code();
		} catch (e) {
			setError(e as Error);
		}
	});

	return { isWorking, run, error };
}

const FileRow = (props: {
	prefix: string;
	file: S3File;
	thumbList: S3File[];
}) => {
	  const { mutateThumbnails } = useThumbnails(props.prefix);
  const [isWorking, setIsWorking] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const reindex = async () => {
    setIsWorking(true);
    setError(null);
    try {
      await axios.post('/api/reindex', { prefix: props.prefix, key: props.file.key }, { withCredentials: true });
      await mutateThumbnails();
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsWorking(false);
    }
  };

	const hasThumbnail = props.thumbList.some((x) => props.file.key === x.key);

	return (
		<>
			<tr>
				<td>
					<button onClick={reindex} disabled={isWorking} className="btn btn-sm">
						{isWorking ? (
							<Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
						) : hasThumbnail ? "✅" : "🔴"}
					</button>
				</td>
				<td>{props.file.base64 && (
					<img src={props.file.base64} width={32} height={32} alt="thumb" />
				)}</td>
				<td>{props.file.key.split("/").slice(-1)[0]}</td>
				<td>{bytes(props.file.size)}</td>
				<td align="right" className="font-monospace text-nowrap">
					{new Date(props.file.created ?? props.file.modified).toISOString().substring(0, 19)}
				</td>
			</tr>
			{error && (
				<tr>
					<td colSpan={99} className="text-danger small py-1 px-2">
						⚠️ {error.message}
					</td>
				</tr>
			)}
		</>
	);
};
