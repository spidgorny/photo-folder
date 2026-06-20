"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClientSession } from "@/components/use-client-session.tsx";
import { MySlidingPane } from "@/components/my-sliding-pane.tsx";
import { SignInForm } from "@/components/SignInForm";
import { UploadSidebar } from "@/components/upload-sidebar";
import { Dropdown } from "react-bootstrap";

interface MainHeaderProps {
	onOpenThumbnailManager?: () => void;
}

export function MainHeader({ onOpenThumbnailManager }: MainHeaderProps) {
	const [showUploadSidebar, setShowUploadSidebar] = useState(false);
	const pathname = usePathname();
	const folderName = pathname?.split('/').slice(-1)[0] || '';
	const isFolderPage = pathname !== '/' && pathname?.split('/').length === 2;

	return (
		<>
			<header className="bg-white border-bottom shadow-sm">
				<div className="container-fluid">
					<div className="d-flex justify-content-between align-items-center py-3">
						<div className="d-flex align-items-center gap-4">
							<h4 className="m-0">
								<Link href="/" className="text-decoration-none text-dark">
									📷 Photo Folder
								</Link>
							</h4>
							{isFolderPage && <span className="text-muted">/ {folderName}</span>}
						</div>
						<div className="d-flex align-items-center gap-3">
							{isFolderPage && (
								<>
									<button
										className="btn btn-outline-primary btn-sm"
										onClick={() => setShowUploadSidebar(true)}
									>
										Upload
									</button>
									<button
										className="btn btn-outline-primary btn-sm"
										onClick={onOpenThumbnailManager}
									>
										Manage Thumbnails
									</button>
								</>
							)}
							<SignInOrOut />
						</div>
					</div>
				</div>
			</header>
			<UploadSidebar isOpen={showUploadSidebar} onClose={() => setShowUploadSidebar(false)} />
		</>
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
		<Dropdown>
			<Dropdown.Toggle
				as="div"
				className="d-flex align-items-center gap-2 cursor-pointer"
				style={{ cursor: "pointer" }}
			>
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
			</Dropdown.Toggle>
			<Dropdown.Menu align="end">
				<Dropdown.Item
					onClick={signOut}
					disabled={isLoggingOut}
					className="text-danger"
				>
					{isLoggingOut ? "Signing out..." : "Sign Out"}
				</Dropdown.Item>
			</Dropdown.Menu>
		</Dropdown>
	);
}
