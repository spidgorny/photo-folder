import * as React from "react";
import type { InferGetStaticPropsType, NextPageContext } from "next";
import Image, { ImageProps } from "next/image";
import { getPlaiceholder } from "plaiceholder";
import { IGetCSSReturn } from "plaiceholder/dist/css";

export const getStaticProps = async (context: any) => {
  const { css, img } = await getPlaiceholder("" + context.params.file);

  return {
    props: {
      img,
      css,
    },
  };
};

export function PreviewComponent(props: {
  css: IGetCSSReturn;
  src: string;
  img: ImageProps;
}) {
  return (
    <div
      style={{
        position: "relative",
        display: "block",
        overflow: "hidden",
        width: 320,
        height: 200,
      }}
    >
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
          ...props.css,
        }}
      />

      <Image src={props.src} {...props.img} />
    </div>
  );
}

const Preview: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = ({
  img,
  css,
}: {
  img: ImageProps;
  css: IGetCSSReturn;
}) => <PreviewComponent css={css} src={img.src} img={img} />;

export default Preview;
