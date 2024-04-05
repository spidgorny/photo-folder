import { useParams } from "next/navigation";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import React from "react";
import "yet-another-react-lightbox/plugins/captions.css";
import { LightboxPreview } from "../../../components/lightbox-preview";
import { useFiles } from "../../../components/use-files";

export default function PreviewPage() {
  const params = useParams();
  if (!params?.prefix) {
    return (
      <div className="flex justify-content-center py-5">Loading Params...</div>
    );
  }
  return (
    <PreviewLoader
      prefix={params.prefix as string}
      fileKey={params.key as string[]}
    />
  );
}

function PreviewLoader(props: { prefix: string; fileKey: string[] }) {
  const { data, error, isLoading } = useFiles(props.prefix);

  const fileKey = (props?.fileKey as string[])?.join("/");
  if (!data?.files) {
    return (
      <LightboxPreview
        prefix={props.prefix}
        files={[{ key: fileKey, size: 123, modified: "2020-01-01" }]}
        slides={[
          {
            src: `/api/s3/jpg/${fileKey}`,
            alt: fileKey,
            srcSet: [
              { src: `/api/s3/thumb/${fileKey}`, width: 1280, height: 576 },
              { src: `/api/s3/jpg/${fileKey}`, width: 4000, height: 1800 },
            ],
          },
        ]}
        fileKey={fileKey}
      />
    );
  }

  const slides = data.files.map((x) => ({
    src: `/api/s3/jpg/${x.key}`,
    alt: x.key,
    title: x.key,
    description: `${x.size} bytes, ${x.modified}`,
    srcSet: [
      { src: `/api/s3/thumb/${fileKey}`, width: 1280, height: 576 },
      { src: `/api/s3/jpg/${fileKey}`, width: 4000, height: 1800 },
    ],
  }));
  return (
    <LightboxPreview
      prefix={props.prefix}
      files={data.files}
      slides={slides}
      fileKey={fileKey}
    />
  );
}
