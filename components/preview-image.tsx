import { PropsWithChildren } from "react";
import Image from "next/image";
import Link from "next/link";
import { S3File } from "./use-files";

export function PreviewImage(
  props: PropsWithChildren<{ prefix: string; file: S3File }>,
) {
  // const { data, error } = useSWR("/api/s3/" + props.file.key, fetcher);
  const aspectRatio = props.file.metadata.width / props.file.metadata.height;
  return (
    <div
      id={props.file.key}
      style={{
        position: "relative",
        border: "solid 1px silver",
        display: "block",
        overflow: "hidden",
        width: 320,
        height: 320 / aspectRatio,
      }}
    >
      <Link
        href={`/${props.prefix}/lightbox/` + encodeURIComponent(props.file.key)}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            width: 320,
            height: 320 / aspectRatio,
            transform: "scale(1.1)",
            filter: "blur(20px)",
            zIndex: 10,
            ...props.file.css,
          }}
        />
        <Image
          src={`/api/s3/thumb/${props.file.key}`}
          width={320}
          height={320 / aspectRatio}
          unoptimized
          alt={props.file.key}
          loading="lazy"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            zIndex: 20,
          }}
        />
      </Link>
    </div>
  );
}
