import useSWR from "swr";
import { fetcher } from "../../lib/fetcher.tsx";
import axios from "axios";
import { useState } from "react";
import SlidingPane from "react-sliding-pane";
import Link from "next/link";

export function MainHeader() {
	return (
		<header className="bg-light p-2 d-flex justify-content-between">
			<h4>
				<Link href="/" className="text-decoration-none text-black">
					Photo Folder (S3)
				</Link>
			</h4>
			<SignInOrOut />
		</header>
	);
}

export function useClientSession() {
	const { isLoading, data, mutate } = useSWR("/api/auth/me", fetcher);
	return { isLoading, ...data, mutate };
}

function SignInOrOut() {
	const session = useClientSession();
	if (session.isLoading) {
		return <div>Loading...</div>;
	}
	if (session.user) {
		return <SignOut onSuccess={() => session.mutate()} />;
	}
	return <SignIn onSuccess={() => session.mutate()} />;
}

function SignIn(props: { onSuccess: () => void }) {
	const [openPanel, setOpenPanel] = useState(false);
	return (
		<div>
			<button
				onClick={() => setOpenPanel(true)}
				className="btn btn-outline-primary"
			>
				Sign In
			</button>
			<SlidingPane
				isOpen={openPanel}
				width={"50%"}
				onRequestClose={() => setOpenPanel(false)}
			>
				<div>
					<div>Sign-in with email:</div>
					<SignInForm
						onSuccess={() => {
							setOpenPanel(false);
							props.onSuccess();
						}}
					/>
					<div className="py-5 my-5 text-end">
						<button
							onClick={() => setOpenPanel(false)}
							className="btn btn-outline-secondary"
						>
							close
						</button>
					</div>
				</div>
			</SlidingPane>
		</div>
	);
}

function SignInForm(props: { onSuccess: () => void }) {
	const [error, setError] = useState<Error | null>(null);

	const signIn = async (e: any) => {
		e.preventDefault();
		setError(null);
		const data = Object.fromEntries(new FormData(e.target).entries());
		console.log("sign in", data);
		try {
			const res = await axios.post("/api/auth/login", data);
			console.log("res", res);
			props.onSuccess();
		} catch (e) {
			console.error(e);
			setError(
				e?.response?.data?.status ? new Error(e?.response?.data?.status) : e,
			);
		}
	};

	return (
		<form onSubmit={signIn}>
			<div className="form-floating mb-3">
				<input
					type="email"
					name="email"
					className="form-control"
					id="floatingInput"
					placeholder="name@example.com"
				/>
				<label htmlFor="floatingInput">Email address</label>
			</div>

			<button className="btn btn-primary w-100 py-2" type="submit">
				Sign in
			</button>

			{error && <div className="alert alert-danger mt-3">{error.message}</div>}
		</form>
	);
}

function SignOut(props: { onSuccess: () => void }) {
	const signOut = async () => {
		const res = await axios.post("/api/auth/logout");
		console.log("res", res);
		props.onSuccess();
	};

	return (
		<button onClick={signOut} className="btn btn-outline-secondary">
			Sign Out
		</button>
	);
}
