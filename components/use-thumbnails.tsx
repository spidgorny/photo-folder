import useSWR from "swr";
import { fetcher } from "../lib/fetcher";
import { S3File } from "../lib/s3-file";

export function useThumbnails(prefix: string) {
	const { data, error, isLoading, mutate } = useSWR<{ files: S3File[] }>(
		prefix ? `/api/s3/files/${prefix}` : null,
		fetcher,
	);
	return {
		data,
		files: data?.files ?? [],
		error,
		isLoading,
		mutateThumbnails: mutate,
	} as {
		data: { files: S3File[] };
		files: S3File[];
		error?: Error;
		isLoading: boolean;
		mutateThumbnails: () => Promise<void>;
	};
}

/** Returns raw list of S3File[] from S3 API call */
export function useFiles(prefix: string) {
	const { isLoading, data } = useSWR(`/api/s3/uploads/${prefix}`, fetcher);
	return { isLoading, uploads: data?.files ?? [] } as {
		isLoading: boolean;
		uploads: S3File[];
	};
}
