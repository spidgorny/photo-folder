"use client";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import axios from "axios";

export function MakeFolder() {
	const router = useRouter();
	const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		let form = e.target as HTMLFormElement;
		const formData = Object.fromEntries(new FormData(form).entries());
		console.log(formData);

		const res = await axios.post("/api/s3/mkdir", formData);
		console.log(res.data);
		router.push(`/${formData.name}`);
	};

	return (
		<div className="container py-3">
			<form onSubmit={onSubmit}>
				<div className="d-flex gap-3 justify-content-between">
					<input
						name="name"
						className="form-control"
						placeholder="new folder name"
						required
					/>
					<button type="submit" className="btn btn-primary">
						Folder
					</button>
				</div>
			</form>
		</div>
	);
}
