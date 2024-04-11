import { MainHeader, useClientSession } from "./[prefix]/main-header.tsx";
import { FormEvent } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Home() {
	const session = useClientSession();
	return (
		<main className="container-fluid">
			<MainHeader />
			{session.user && <MakeFolder />}
		</main>
	);
}

function MakeFolder() {
	const router = useRouter();
	const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		let form = e.target as HTMLFormElement;
		const formData = Object.fromEntries(new FormData(form).entries());
		console.log(formData);

		const res = await axios.post("/api/s3/mkdir", formData);
		console.log(res);
		router.push(`/${formData.name}`);
	};

	return (
		<div className="container">
			<form onSubmit={onSubmit}>
				<input
					name="name"
					className="form-control"
					placeholder="new folder name"
					required
				/>
				<button type="submit">New Folder</button>
			</form>
		</div>
	);
}
