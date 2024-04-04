import useSWR from "swr";
import { fetcher } from "./fetcher";
import { PreviewImage } from "./preview-image";

export interface S3File {
  key: string;
  size: number;
  modified: string;
}

export function ListFiles() {
  const { data, error } = useSWR<{ files: S3File[] }>("/api/s3/files", fetcher);
  if (error) return <div className="alert alert-danger">{error?.message}</div>;
  if (!data) return <div>loading...</div>;
  return (
    <div id="ListFiles" className="d-flex flex-wrap">
      {data.files.map((file: S3File) => (
        <PreviewImage key={file.key} file={file}>
          {file.key}
        </PreviewImage>
      ))}
    </div>
  );
}
