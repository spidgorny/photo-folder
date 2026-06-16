"use client";
import { useClientSession } from "../components/use-client-session.tsx";
import { MakeFolder } from "./make-folder.tsx";
import Link from "next/link";

export default function Home() {
  const session = useClientSession();

  return (
    <main className="container-fluid py-4">
      {session.isLoading ? (
        <div className="text-center">Loading folders...</div>
      ) : session.user ? (
        <div>
          <div className="mb-4">
            <h4>Welcome, {session.user.email}</h4>
            <p className="text-muted">Your available photo folders:</p>
          </div>

          <div className="row g-3">
            {session.folders && session.folders.length > 0 ? (
              session.folders.map((folder: string) => (
                <div key={folder} className="col-md-4 col-sm-6">
                  <Link
                    href={`/${folder}`}
                    className="text-decoration-none"
                  >
                    <div className="card h-100 shadow-sm hover-shadow">
                      <div className="card-body d-flex flex-column align-items-center justify-content-center py-5">
                        <div className="display-4 mb-3">📁</div>
                        <h5 className="card-title text-center">{folder}</h5>
                        <small className="text-muted">Click to open folder</small>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="alert alert-info">
                No folders available. Make sure your email is configured in VALID_USERS or the permission map.
              </div>
            )}
          </div>

          <div className="mt-5">
            <MakeFolder />
          </div>
        </div>
      ) : (
        <div className="text-center py-5">
          <h2>Photo Folder</h2>
          <p className="lead">Sign in above to see your S3 photo folders</p>
        </div>
      )}
    </main>
  );
}
