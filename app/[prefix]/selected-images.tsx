"use client";
import NextImage from "next/image";
import { useThumbnails } from "@components/use-thumbnails.tsx";
import React from "react";
import { useSelectedImages } from "@/app/[prefix]/lightbox/[...key]/use-selected-images.tsx";
import { Image } from "@components/react-grid-gallery/src";

export function SelectedImages(props: {
	prefix: string;
	selectedImages: Image[];
}) {
	const { removeBy, clear } = useSelectedImages<Image>();
	return (
		<div>
			{props.selectedImages.length > 0 && (
				<div className="position-fixed w-100 bottom-0 border rounded start-0 bg-dark text-white p-3 d-flex justify-content-between">
					<div>
						Selected images: {props.selectedImages.length}
						<div>
							{props.selectedImages.map((image) => (
								<div
									className="position-relative d-inline-block"
									key={image.key}
								>
									<NextImage
										src={image.src}
										width={80}
										height={80}
										alt={image.alt ?? ""}
										key={image.key}
										className="object-cover border rounded mx-1"
									/>
									<button
										type="button"
										className="position-absolute btn-close bg-white rounded"
										aria-label="Close"
										style={{ top: 0, right: 5 }}
										onClick={() => removeBy((x) => x.key === image.key)}
									/>
								</div>
							))}
						</div>
					</div>
					<div>
						<DeleteButton
							prefix={props.prefix}
							images={props.selectedImages}
							resetSelectedImages={clear}
						/>
					</div>
				</div>
			)}
		</div>
	);
}

function DeleteButton(props: {
	prefix: string;
	images: Image[];
	resetSelectedImages: () => void;
}) {
	const { mutateThumbnails, data, error, isLoading } = useThumbnails(
		props.prefix,
	);
	const [isDeleting, setIsDeleting] = React.useState(false);
	const [deleteProgress, setDeleteProgress] = React.useState(0);
	const [deleteError, setDeleteError] = React.useState<string | null>(null);

	const onClick = async () => {
		setIsDeleting(true);
		setDeleteProgress(0);
		setDeleteError(null);

		const keys = props.images.map((x) => x.key);
		const totalKeys = keys.length;

		try {
			// Simulate progress for each deletion
			for (let i = 0; i < totalKeys; i++) {
				setDeleteProgress(((i + 1) / totalKeys) * 100);
			}

			const response = await fetch("/api/s3/deleteMany", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ keys }),
			});

			if (!response.ok) {
				throw new Error(response.statusText);
			}

			await mutateThumbnails();
			props.resetSelectedImages();
		} catch (error) {
			setDeleteError(error instanceof Error ? error.message : "Delete failed");
			console.error("Delete error:", error);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className="d-flex flex-column gap-2">
			<button
				className="btn btn-danger"
				onClick={onClick}
				disabled={isDeleting || props.images.length === 0}
			>
				{isDeleting ? (
					<>
						<span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
						Deleting...
					</>
				) : (
					`Delete (${props.images.length})`
				)}
			</button>
			{isDeleting && (
				<div className="progress" style={{ height: "6px", minWidth: "150px" }}>
					<div
						className="progress-bar progress-bar-striped progress-bar-animated"
						role="progressbar"
						style={{ width: `${deleteProgress}%` }}
						aria-valuenow={deleteProgress}
						aria-valuemin={0}
						aria-valuemax={100}
					></div>
				</div>
			)}
			{deleteError && (
				<div className="text-danger small">{deleteError}</div>
			)}
		</div>
	);
}
