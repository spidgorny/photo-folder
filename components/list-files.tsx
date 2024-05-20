import { PreviewImage } from "./preview-image";
import { useThumbnails } from "./use-thumbnails.tsx";
import { S3File } from "../lib/s3-file";

export function ListFiles(props: { prefix: string }) {
	const { data, error, isLoading } = useThumbnails(props.prefix);
	if (error) return <div className="alert alert-danger">{error?.message}</div>;
	if (!data) return <div>loading...</div>;
	return (
		<div id="ListFiles" className="d-flex flex-wrap">
			{data.files.map((file: S3File) => (
				<PreviewImage key={file.key} prefix={props.prefix} file={file}>
					{file.key}
				</PreviewImage>
			))}
		</div>
	);
}
