import { useFiles, useThumbnails } from "@/components/use-thumbnails.tsx";
import { Spinner, ProgressBar } from "react-bootstrap";
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
import { useClientSession } from "@/components/use-client-session.tsx";

export function ManageThumbnails(props: { prefix: string; close: () => void }) {
	const { files, mutateThumbnails } = useThumbnails(props.prefix);
	const { uploads } = useFiles(props.prefix);
	const { isWorking, wrapWorking } = useWorking();
	const session = useClientSession();
	const isAuthenticated = !!session.user;
	const [regenerationProgress, setRegenerationProgress] = useState({ completed: 0, processing: [] as string[], total: 0 });

const sortByTime = () => {
const sorted = files.toSorted(sortBy((x) => x.created ?? x.modified));
updateThumbnailFile(`${props.prefix}/.thumbnails.json`, sorted);
alert("Sorted! The order will be saved to S3.");
};

	const regenerateMissing = wrapWorking(async () => {
		const missingFiles = uploads.filter(
			(file) => !files.some((x) => x.key === file.key),
		);

		if (missingFiles.length === 0) {
			alert("No missing thumbnails to regenerate.");
			return;
		}

		setRegenerationProgress({ completed: 0, processing: [], total: missingFiles.length });

		const result = await regenerateMissingThumbnails(props.prefix, (progress) => {
			setRegenerationProgress({
				completed: progress.completed,
				processing: progress.processing.map(f => f.split('/').slice(-1)[0]),
				total: progress.total,
			});
		});

		setRegenerationProgress({ completed: 0, processing: [], total: 0 });

		if (result.errors.length > 0) {
			alert(`Regeneration complete: ${result.triggered} succeeded, ${result.failed} failed. Check console for details.`);
		} else {
			alert(`Successfully regenerated thumbnails for ${result.triggered} files.`);
		}
		await mutateThumbnails();
	});

	const uploadsWithoutThumbnails = uploads.filter(
		(file) => !files.some((x) => x.key === file.key),
	);

	const filesWithoutBase64 = files.filter(
		(file) => !file.base64 || !file.metadata,
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
				<div className="d-flex flex-column gap-2">
					<button
						onClick={regenerateMissing}
						className="btn btn-success"
						disabled={isWorking || uploadsWithoutThumbnails.length === 0 || !isAuthenticated}
						title={!isAuthenticated ? "Please sign in to regenerate thumbnails" : undefined}
					>
						🔄 Regenerate All Missing Thumbnails (
						{uploadsWithoutThumbnails.length})
					</button>
					{regenerationProgress.total > 0 && (
						<div>
							<div className="d-flex justify-content-between mb-1">
								<small className="text-muted">
									{regenerationProgress.processing.length > 0 && (
										<>Processing: {regenerationProgress.processing.join(', ')} </>
									)}
								</small>
								<small className="text-muted">
									{regenerationProgress.completed} / {regenerationProgress.total}
								</small>
							</div>
							<div className="d-flex" style={{ height: '20px' }}>
								<div
									style={{
										width: `${(regenerationProgress.completed / regenerationProgress.total) * 100}%`,
										backgroundColor: '#198754',
										transition: 'width 0.3s ease',
									}}
								/>
								<div
									style={{
										width: `${(regenerationProgress.processing.length / regenerationProgress.total) * 100}%`,
										backgroundColor: '#ffc107',
										transition: 'width 0.3s ease',
									}}
								/>
							</div>
							<div className="d-flex gap-2 mt-1">
								<small className="text-muted">
									<span style={{ color: '#198754' }}>●</span> Completed: {regenerationProgress.completed}
								</small>
								<small className="text-muted">
									<span style={{ color: '#ffc107' }}>●</span> Processing: {regenerationProgress.processing.length}
								</small>
								<small className="text-muted">
									<span style={{ color: '#6c757d' }}>●</span> Remaining: {regenerationProgress.total - regenerationProgress.completed - regenerationProgress.processing.length}
								</small>
							</div>
						</div>
					)}
					<small className="text-muted">
						Calls the Lambda handler for every file that is missing from{" "}
						<code>.thumbnails.json</code>.
						<br />
						Use this after bulk uploads or if thumbnails are incomplete.
						{!isAuthenticated && (
							<>
								<br />
								<strong className="text-danger">⚠️ Sign in required to regenerate thumbnails</strong>
							</>
						)}
					</small>
				</div>
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

			{filesWithoutBase64.length > 0 && (
				<>
					<h6 className="mt-4">Files without Base64/Metadata ({filesWithoutBase64.length})</h6>
					<table className="table table-sm">
						<tbody>
							{filesWithoutBase64.map((file) => (
								<FileRow
									key={file.key}
									prefix={props.prefix}
									file={file}
									thumbList={files}
								/>
							))}
						</tbody>
					</table>
				</>
			)}

			<div className="d-flex justify-content-between mt-4">
				<h5>Current Thumbnails ({files.length})</h5>
<button className="btn btn-outline-primary gap-2 align-items-center" onClick={sortByTime}>Sort By Time</button>
			</div>

			<table className="table table-sm">
				<thead>
					<tr>
						<th>Thumb</th>
						<th>Status</th>
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
  const session = useClientSession();
  const isAuthenticated = !!session.user;

  const reindex = async () => {
    if (!isAuthenticated) return;
    setIsWorking(true);
    setError(null);
    try {
      await axios.post('/api/reindex', { prefix: props.prefix, key: props.file.key }, { withCredentials: true });
      await mutateThumbnails();
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const backendError = e.response?.data?.error || e.response?.data || e.message;
        const status = e.response?.status;
        const errorMessage = status ? `${status}: ${backendError}` : backendError;
        setError(new Error(errorMessage));
      } else {
        setError(e as Error);
      }
    } finally {
      setIsWorking(false);
    }
  };

	const hasThumbnail = props.thumbList.some((x) => props.file.key === x.key);

	return (
		<>
			<tr>
				<td>{props.file.base64 && (
					<img src={props.file.base64} width={48} height={48} alt="thumb" style={{ objectFit: 'cover' }} />
				)}</td>
				<td>
					<button
						onClick={reindex}
						disabled={isWorking || !isAuthenticated}
						className="btn btn-sm"
						title={!isAuthenticated ? "Please sign in to regenerate thumbnails" : undefined}
					>
						{isWorking ? (
							<Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
						) : hasThumbnail ? "✅" : "🔴"}
					</button>
				</td>
				<td>{props.file.key.split("/").slice(-1)[0]}</td>
				<td>{bytes(props.file.size)}</td>
				<td align="right" className="font-monospace text-nowrap">
					{new Date(props.file.created ?? props.file.modified).toISOString().substring(0, 19)}
				</td>
			</tr>
			{error && (
				<tr>
					<td colSpan={5} className="text-danger small py-1 px-2">
						⚠️ {error.message}
					</td>
				</tr>
			)}
		</>
	);
};
