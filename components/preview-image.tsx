import { PropsWithChildren } from "react";
import useSWR from "swr";
import { fetcher } from "./fetcher";
import Image from "next/image";
import { S3File } from "./list-files";
import Link from "next/link";

export function PreviewImage(props: PropsWithChildren<{ file: S3File }>) {
  const { data, error } = useSWR("/api/s3/" + props.file.key, fetcher);
  return (
    <div
      style={{
        position: "relative",
        border: "solid 1px silver",
        display: "block",
        overflow: "hidden",
        width: 320,
        height: 200,
      }}
    >
      <Link href={"/lightbox/" + encodeURIComponent(props.file.key)}>
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            width: "100%",
            height: "100%",
            transform: "scale(1.5)",
            filter: "blur(40px)",
            ...data?.css,
          }}
        >
          <Image
            src={`/api/s3/${props.file.key}/jpg`}
            width={320}
            height={200}
            alt={props.file.key}
          />
        </div>
      </Link>
    </div>
  );
}
