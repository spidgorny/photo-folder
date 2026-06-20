// app/page.tsx (The main landing and folder grid page)
'use client';

import { useState, useEffect } from 'react';
import { useClientSession } from '@/components/use-client-session';
import PhotoCard from '@/components/PhotoCard';
import { SignInForm } from '@/components/SignInForm';
import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css";

interface FolderDetails {
  name: string;
  photoCount: number;
  firstImage: {
    key: string;
    src: string;
  } | null;
}

export default function HomePage() {
  const { user, folders, isLoading, error, mutate } = useClientSession();
  const [showSignIn, setShowSignIn] = useState(false);
  const [folderDetails, setFolderDetails] = useState<FolderDetails[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchFolderDetails = async () => {
      if (!folders || folders.length === 0) return;

      setLoadingDetails(true);
      try {
        const details = await Promise.all(
          folders.map(async (folder: any) => {
            const folderName = folder.name || folder.key?.replace(/\/$/, '') || '';
            try {
              const response = await fetch(`/api/s3/folder-details?folder=${encodeURIComponent(folderName)}`);
              if (response.ok) {
                const data = await response.json();
                return {
                  name: folderName,
                  photoCount: data.photoCount || 0,
                  firstImage: data.firstImage || null,
                };
              }
              return {
                name: folderName,
                photoCount: 0,
                firstImage: null,
              };
            } catch (err) {
              console.error(`Error fetching details for ${folderName}:`, err);
              return {
                name: folderName,
                photoCount: 0,
                firstImage: null,
              };
            }
          })
        );
        setFolderDetails(details);
      } catch (error) {
        console.error('Error fetching folder details:', error);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchFolderDetails();
  }, [folders]);

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (error || !user) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center p-8">
          <h1 className="display-6 fw-semibold mb-4">Photo Folder</h1>
          <p className="mb-6 text-muted">Please log in to view your photos.</p>
          <button
            onClick={() => setShowSignIn(true)}
            className="btn btn-primary btn-lg px-5"
          >
            Sign In
          </button>
          <SlidingPane
            isOpen={showSignIn}
            width="50%"
            onRequestClose={() => setShowSignIn(false)}
            title="Sign In"
          >
            <SignInForm onSuccess={() => { setShowSignIn(false); mutate(); }} />
          </SlidingPane>
        </div>
      </div>
    );
  }

  return (
    <main className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className='h3 mb-0'>Welcome back, {user?.email || user?.userId || 'User'}!</h1>
      </div>

      {/* Main Grid View for Folders */}
      <section>
        <h2 className='h4 mb-4'>Your Photo Folders</h2>
        {loadingDetails ? (
          <div className="text-center py-4">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {folderDetails.map((folder) => (
              <div className="col" key={folder.name}>
                <PhotoCard folderName={folder.name} photoCount={folder.photoCount} firstImage={folder.firstImage} />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}