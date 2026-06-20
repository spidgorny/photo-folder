"use client";
import { useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { useThumbnails } from "@/components/use-thumbnails.tsx";

interface UploadSidebarProps {
	isOpen: boolean;
	onClose: () => void;
}

export function UploadSidebar({ isOpen, onClose }: UploadSidebarProps) {
	const pathname = usePathname();
	const folderName = pathname?.split('/').slice(-1)[0] || '';
	const { mutateThumbnails } = useThumbnails(folderName);
	const [isDragging, setIsDragging] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const dragCounter = useRef(0);

	const handleDragEnter = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		dragCounter.current++;
		if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
			setIsDragging(true);
		}
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		dragCounter.current--;
		if (dragCounter.current === 0) {
			setIsDragging(false);
		}
	}, []);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.dataTransfer.dropEffect !== 'copy') {
			e.dataTransfer.dropEffect = 'copy';
		}
	}, []);

	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
		dragCounter.current = 0;

		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
			if (files.length > 0) {
				setSelectedFiles(prev => [...prev, ...files]);
			}
		}
	}, []);

	const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		setSelectedFiles(prev => [...prev, ...files]);
	}, []);

	const handleUpload = async () => {
		if (selectedFiles.length === 0 || !folderName) return;

		setUploading(true);
		setUploadProgress(0);

		for (let i = 0; i < selectedFiles.length; i++) {
			const file = selectedFiles[i];
			const formData = new FormData();
			formData.append("file", file);
			formData.append("prefix", folderName);

			try {
				const response = await fetch("/api/s3/upload", {
					method: "POST",
					body: formData,
				});

				if (response.ok) {
					setUploadedFiles(prev => [...prev, file.name]);
				} else {
					console.error("Upload failed for:", file.name);
				}
			} catch (error) {
				console.error("Upload failed:", error);
			}

			setUploadProgress(((i + 1) / selectedFiles.length) * 100);
		}

		setUploading(false);
		setSelectedFiles([]);

		// Force SWR to revalidate and refresh the thumbnail cache
		mutateThumbnails();
	};

	const handleClear = () => {
		setSelectedFiles([]);
		setUploadedFiles([]);
		setUploadProgress(0);
	};

	const removeFile = (index: number) => {
		setSelectedFiles(prev => prev.filter((_, i) => i !== index));
	};

	if (!isOpen) return null;

	return (
		<div
			className={`position-fixed top-0 end-0 h-100 bg-white shadow-lg ${isDragging ? 'border-primary border-4' : ''}`}
			style={{ width: "400px", zIndex: 10000 }}
			onDragEnter={handleDragEnter}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
		>
			<div className="d-flex flex-column h-100">
				<div className="p-3 border-bottom d-flex justify-content-between align-items-center">
					<h5 className="m-0">Upload Photos</h5>
					<button className="btn btn-close" onClick={onClose}></button>
				</div>

				<div className="p-3 flex-grow-1 overflow-auto">
					{!folderName ? (
						<div className="alert alert-warning">
							Please navigate to a folder to upload photos.
						</div>
					) : (
						<>
							<div className="mb-3">
								<p className="text-muted mb-2">Uploading to: <strong>{folderName}</strong></p>
							</div>

							{isDragging && (
								<div className="alert alert-primary mb-3">
									Drop files here to upload
								</div>
							)}

							<div
								className="border rounded p-4 text-center mb-3"
								style={{
									borderStyle: "dashed",
									borderColor: isDragging ? "#0d6efd" : "#dee2e6",
									backgroundColor: isDragging ? "#e7f1ff" : "transparent",
									transition: "all 0.2s ease"
								}}
							>
								<div className="mb-3">
									<span style={{ fontSize: "48px" }}>📁</span>
								</div>
								<p className="text-muted mb-3">
									Drag and drop files here, or click to select
								</p>
								<input
									type="file"
									id="file-upload"
									multiple
									accept="image/*"
									onChange={handleFileSelect}
									className="form-control"
									disabled={uploading}
									style={{ display: "none" }}
								/>
								<label
									htmlFor="file-upload"
									className="btn btn-outline-primary"
									style={{ cursor: "pointer" }}
								>
									Select Files
								</label>
							</div>

							{selectedFiles.length > 0 && (
								<div className="mb-3">
									<h6 className="mb-2">Selected Files ({selectedFiles.length})</h6>
									<ul className="list-group">
										{selectedFiles.map((file, index) => (
											<li key={index} className="list-group-item d-flex justify-content-between align-items-center">
												<span className="text-truncate" style={{ maxWidth: "200px" }}>{file.name}</span>
												<div className="d-flex align-items-center gap-2">
													<span className="text-muted small">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
													<button
														className="btn btn-close btn-sm"
														onClick={() => removeFile(index)}
														disabled={uploading}
													></button>
												</div>
											</li>
										))}
									</ul>
								</div>
							)}

							{uploading && (
								<div className="mb-3">
									<div className="progress">
										<div
											className="progress-bar progress-bar-striped progress-bar-animated"
											role="progressbar"
											style={{ width: `${uploadProgress}%` }}
											aria-valuenow={uploadProgress}
											aria-valuemin={0}
											aria-valuemax={100}
										>
											{Math.round(uploadProgress)}%
										</div>
									</div>
								</div>
							)}

							{uploadedFiles.length > 0 && (
								<div className="mb-3">
									<h6 className="mb-2">Uploaded Files ({uploadedFiles.length})</h6>
									<ul className="list-group">
										{uploadedFiles.map((file, index) => (
											<li key={index} className="list-group-item text-success">
												<span className="me-2">✓</span>
												{file}
											</li>
										))}
									</ul>
								</div>
							)}
						</>
					)}
				</div>

				{folderName && (
					<div className="p-3 border-top">
						<div className="d-flex gap-2">
							<button
								className="btn btn-primary flex-grow-1"
								onClick={handleUpload}
								disabled={uploading || selectedFiles.length === 0}
							>
								{uploading ? "Uploading..." : "Upload"}
							</button>
							<button
								className="btn btn-outline-secondary"
								onClick={handleClear}
								disabled={uploading}
							>
								Clear
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
