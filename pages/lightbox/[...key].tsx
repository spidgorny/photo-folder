import { useParams } from "next/navigation";
import "yet-another-react-lightbox/styles.css";
import { useFiles } from "../../components/list-files";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import React from "react";
import "yet-another-react-lightbox/plugins/captions.css";
import { LightboxPreview } from "../../components/lightbox-preview";

export default function PreviewPage() {
  const params = useParams();
  const { data, error, isLoading } = useFiles();

  if (!params?.key) {
    return (
      <div className="flex justify-content-center py-5">Loading Params...</div>
    );
  }
  const fileKey = (params?.key as string[])?.join("/");
  if (!data?.files) {
    return (
      <LightboxPreview
        files={[{ key: fileKey }]}
        slides={[{ src: `/api/s3/jpg/${fileKey}` }]}
        fileKey={fileKey}
      />
    );
  }
  const slides = data.files.map((x) => ({
    src: `/api/s3/jpg/${x.key}`,
    title: x.key,
    description: `${x.size} bytes, ${x.modified}`,
  }));
  return (
    <LightboxPreview files={data.files} slides={slides} fileKey={fileKey} />
  );
}
