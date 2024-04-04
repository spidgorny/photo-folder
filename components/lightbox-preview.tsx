import { S3File } from "./list-files";
import Lightbox, { Slide } from "yet-another-react-lightbox";
import { useRouter } from "next/navigation";
import React from "react";
import { Captions, Thumbnails } from "yet-another-react-lightbox/dist/plugins";

export function LightboxPreview(props: {
  files: S3File[];
  slides: Slide[];
  fileKey: string;
}) {
  const router = useRouter();
  const index = props?.files?.findIndex((x) => x.key === props.fileKey);

  const thumbnailsRef = React.useRef(null);
  const captionsRef = React.useRef(null);
  return (
    <Lightbox
      key={index}
      open={true}
      close={() => router.push(`/?key=${props.fileKey}`)}
      plugins={[Thumbnails, Captions]}
      thumbnails={{ ref: thumbnailsRef }}
      captions={{ ref: captionsRef }}
      slides={props.slides}
      index={index}
      on={{
        view: ({ index }: { index: number }) => {
          // console.log(index, "/", props.files.length, props.files[index]);
          const indexKey = props.files[index]?.key;
          if (!indexKey) {
            return;
          }
          window.history.replaceState(null, "", `/lightbox/${indexKey}`);
        },
      }}
    />
  );
}
