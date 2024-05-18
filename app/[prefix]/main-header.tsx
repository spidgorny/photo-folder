"use client";
import axios from "axios";
import { useState } from "react";
import Link from "next/link";
import { useClientSession } from "../use-client-session.tsx";
import { MySlidingPane } from "../my-sliding-pane.tsx";

export function MainHeader() {
	return (
		<header className="bg-light p-2 d-flex justify-content-between">
			<h4>
				<Link href="/public" className="text-decoration-none text-black">
					Photo Folder (S3)
				</Link>
			</h4>
			<SignInOrOut />
		</header>
	);
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
	return (
		<MySlidingPane button="Sign In">
			{({ close }) => (
				<div>
					<div>Sign-in with email:</div>
					<SignInForm
						onSuccess={() => {
							close();
							props.onSuccess();
						}}
					/>
					<div className="py-5 my-5 text-end">
						<button className="btn btn-outline-secondary">close</button>
					</div>
				</div>
			)}
		</MySlidingPane>
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
