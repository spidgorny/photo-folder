import useSWR from "swr";
import { fetcher } from "../lib/fetcher";

export interface S3File {
  key: string;
  size: number;
  modified: string;
  css?: Record<string, string>;
  base64?: string;
  metadata?: Record<string, any> & {
    width: number;
    height: number;
  };
}

export function useFiles(prefix: string) {
  const { data, error, isLoading } = useSWR<{ files: S3File[] }>(
    `/api/s3/files?prefix=${prefix}`,
    fetcher,
  );
  return { data, error, isLoading };
}
