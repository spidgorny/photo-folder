import useSWR from "swr";
import { fetcher } from "../lib/fetcher";
import { S3File } from "../lib/s3-file";

export function useFiles(prefix: string) {
	const { data, error, isLoading } = useSWR<{ files: S3File[] }>(
		`/api/s3/files?prefix=${prefix}`,
		fetcher,
	);
	return { data, error, isLoading };
}
