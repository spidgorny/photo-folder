"use client";
import Head from "next/head";
import { useParams } from "next/navigation";
import { ListFilesGrid } from "../../components/list-files-grid.tsx";
import "react-sliding-pane/dist/react-sliding-pane.css";
import { MainHeader } from "./main-header.tsx";
import { FileUploader } from "react-drag-drop-files";
import { useState } from "react";
import axios from "axios";
import { useClientSession } from "../use-client-session.tsx";

export default function Home() {
	const params = useParams();
	const session = useClientSession();
	return (
		<main className="container-fluid">
			<MainHeader />
			{!params?.prefix && <div>???</div>}
			{params?.prefix && (
				<div>
					{session.user && <DropArea prefix={params.prefix as string} />}
					<ListFilesGrid prefix={params.prefix as string} />
				</div>
			)}
		</main>
	);
}

function DropArea(props: { prefix: string }) {
	const fileTypes = ["JPG", "PNG", "GIF"];
	const [files, setFiles] = useState<FileList | null>(null);

	const handleChange = (file: FileList) => {
		// console.log(file);
		setFiles(file);
	};

	const onDrop = async (files: FileList) => {
		console.log(files);
		const aFiles = Array.from(files);
		console.log(aFiles);
		let formData = new FormData();
		formData.append("prefix", props.prefix);
		aFiles.forEach((file) => {
			formData.append("file", file);
		});
		console.log(formData);
		const res = await axios.post(`/api/s3/upload`, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		console.log(res);
	};

	return (
		<div className="bg-light py-3">
			<FileUploader
				classes="mx-auto"
				handleChange={handleChange}
				name="file"
				types={fileTypes}
				multiple={true}
				onDrop={onDrop}
				onSelect={onDrop}
			/>
		</div>
	);
}
