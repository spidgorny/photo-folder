"use client";
import { useState } from "react";
import Link from "next/link";
import { useClientSession } from "@/components/use-client-session.tsx";
import { MySlidingPane } from "@/components/my-sliding-pane.tsx";
import { SignInForm } from "@/components/SignInForm";

export function MainHeader() {
	return (
		<header className="bg-white border-bottom shadow-sm">
			<div className="container-fluid">
				<div className="d-flex justify-content-between align-items-center py-3">
					<div className="d-flex align-items-center gap-4">
						<h4 className="m-0">
							<Link href="/" className="text-decoration-none text-dark">
								📷 Photo Folder
							</Link>
						</h4>
					</div>
					<SignInOrOut />
				</div>
			</div>
		</header>
	);
}

function SignInOrOut() {
	const session = useClientSession();
	if (session.isLoading) {
		return <div>Loading...</div>;
	}
	if (session.user) {
		return <SignOut />;
	}
	return <SignIn />;
}

function SignIn() {
	const session = useClientSession();
	return (
		<MySlidingPane button="Sign In">
			{({ close }) => (
				<div>
					<div className="mb-3">Sign in with your email (Google account recommended):</div>
					<SignInForm
						onSuccess={() => {
							close();
							session.mutate();
						}}
					/>
					<div className="py-4 text-end">
						<button className="btn btn-outline-secondary" >
							Close
						</button>
					</div>
				</div>
			)}
		</MySlidingPane>
	);
}


function SignOut() {
	const session = useClientSession();
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const signOut = async () => {
		setIsLoggingOut(true);
		try {
			const response = await fetch("/api/auth/logout", {
				method: "POST",
			});
			if (!response.ok) {
				console.warn("Logout may have failed");
			}
			session.mutate();
		} finally {
			setIsLoggingOut(false);
		}
	};

	const userEmail = typeof session.user === 'string' ? session.user : '';
	const userInitial = userEmail?.charAt(0)?.toUpperCase() || "U";

	return (
		<div className="d-flex align-items-center gap-2">
			<div
				className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
				style={{ width: "36px", height: "36px", fontSize: "14px" }}
				title={userEmail || "User"}
			>
				{userInitial}
			</div>
			<span className="text-muted small d-none d-md-inline">
				{userEmail || "User"}
			</span>
			<button
				onClick={signOut}
				className="btn btn-outline-danger btn-sm"
				disabled={isLoggingOut}
			>
				{isLoggingOut ? "Signing out..." : "Sign Out"}
			</button>
		</div>
	);
}
