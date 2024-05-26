import { Gallery, Image, ThumbnailImageProps } from "react-grid-gallery";
import { useThumbnails } from "../../components/use-thumbnails.tsx";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useClientSession } from "../../components/use-client-session.tsx";
import { SelectedImages } from "./selected-images.tsx";
import { default as NextImage } from "next/image";
import { useSelectedImages } from "@/app/[prefix]/lightbox/[...key]/use-selected-images.tsx";

export function ListFilesGrid(props: { prefix: string }) {
	const router = useRouter();
	const session = useClientSession();
	const { data, error } = useThumbnails(props.prefix);

	const images =
		data?.files.map(
			(file) =>
				({
					key: file.key,
					id: file.key.split("/").slice(-1)[0],
					title: file.key.split("/").slice(-1)[0],
					src: `/api/s3/thumb/${file.key}`,
					width: file.metadata?.width,
					height: file.metadata?.height,
					isSelected: false,
					caption: file.key.split("/").slice(-1)[0],
					tags: [
						// { value: "Ocean", title: "Ocean" },
						// { value: "People", title: "People" },
					],
					// alt: "Boats (Jeshu John - designerspics.com)",
				}) as Image & { key: string },
		) ?? [];

	const { list: selectedImages, push, removeBy } = useSelectedImages<string>();

	const handleSelect = (
		index: number,
		item: Image & { key: string },
		event: React.MouseEvent<HTMLElement, MouseEvent>,
	) => {
		console.log(index, item);
		if (selectedImages.includes(item.key)) {
			removeBy((x: string) => x === item.key);
		} else {
			push(item.key as string);
		}
	};

	const onClick = (index: number, item: Image) => {
		router.push(`/${props.prefix}/lightbox/` + item.key!);
	};

	const ImageComponent = (props: ThumbnailImageProps) => {
		// const [show, setShow] = useState(false);

		const { title, id, ...otherProps } = props.imageProps;

		return (
			<div
				style={{ ...props.imageProps.style, textAlign: "center" }}
				// onMouseOver={() => setShow(true)}
				// onMouseOut={() => setShow(false)}
				id={id ?? title}
			>
				<NextImage
					priority={false}
					fetchPriority="low"
					title={title ?? ""}
					width={512}
					height={512}
					{...otherProps}
				/>
			</div>
		);
	};

	// console.log("selectedImages", selectedImages);
	const imagesWithSelected = images.map((image) => {
		return {
			...image,
			isSelected: selectedImages.includes(image.key),
		};
	});

	return (
		<div>
			{error && <div className="alert alert-danger">{error?.message}</div>}
			{!data && <div>loading...</div>}

			{data && (
				<Gallery
					images={imagesWithSelected}
					onSelect={handleSelect}
					onClick={onClick}
					enableImageSelection={session?.user}
					thumbnailImageComponent={ImageComponent}
				/>
			)}

			<SelectedImages
				prefix={props.prefix}
				selectedImages={selectedImages.map((x) => `/api/s3/thumb/${x}`)}
			/>
		</div>
	);
}
