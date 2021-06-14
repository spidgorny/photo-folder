import * as React from "react";
import type { InferGetStaticPropsType } from "next";
import Image from "next/image";
import { getPlaiceholder } from "plaiceholder";

export const getStaticProps = async () => {
  const { css, img } = await getPlaiceholder("" + "/IMG_20210520_082925.jpg");

  return {
    props: {
      img,
      css,
    },
  };
};

const Page: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = ({
  img,
  css,
}) => (
  <div style={{ position: "relative", display: "block", overflow: "hidden" }}>
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
        ...css,
      }}
    />

    <Image {...img} />
  </div>
);

export default Page;
