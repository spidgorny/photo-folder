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
  loaded: boolean;
}

export default function HomePage() {
  const { user, folders, isLoading, error, mutate } = useClientSession();
  const [showSignIn, setShowSignIn] = useState(false);
  const [folderDetails, setFolderDetails] = useState<Record<string, FolderDetails>>({});

  useEffect(() => {
    const fetchFolderDetails = async () => {
      if (!folders || folders.length === 0) return;

      // Initialize folder details with basic info immediately
      const initialDetails: Record<string, FolderDetails> = {};
      folders.forEach((folder: any) => {
        const folderName = folder.name || folder.key?.replace(/\/$/, '') || '';
        initialDetails[folderName] = {
          name: folderName,
          photoCount: 0,
          firstImage: null,
          loaded: false,
        };
      });
      setFolderDetails(initialDetails);

      // Fetch details for each folder independently
      folders.forEach(async (folder: any) => {
        const folderName = folder.name || folder.key?.replace(/\/$/, '') || '';
        try {
          const response = await fetch(`/api/s3/folder-details?folder=${encodeURIComponent(folderName)}`);
          if (response.ok) {
            const data = await response.json();
            setFolderDetails((prev) => ({
              ...prev,
              [folderName]: {
                name: folderName,
                photoCount: data.photoCount || 0,
                firstImage: data.firstImage || null,
                loaded: true,
              },
            }));
          } else {
            setFolderDetails((prev) => ({
              ...prev,
              [folderName]: {
                ...prev[folderName],
                loaded: true,
              },
            }));
          }
        } catch (err) {
          console.error(`Error fetching details for ${folderName}:`, err);
          setFolderDetails((prev) => ({
            ...prev,
            [folderName]: {
              ...prev[folderName],
              loaded: true,
            },
          }));
        }
      });
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
  }foders && flers.leh> 0 
row rowols-1 ow-cols-md-2rowcols-lg-3 g-
  return ({fodr.ma((fl:ny) = {
    <main clascoest=focderaine r fo>r.me || folerkey?relce(a\/$/, '') || '';sName='h3 mb-0'>Welcome back, {user?.email || user?.userId || 'User'}!</h1>
      </i>consteta fdeDetai[folderNae];
      {/* MadViu*n
        <section>N
          <h2 className='h4 
                   mb-4'>Your Photo FoNers<
                   /h2>tails? ?? 0
                   tails?age ?? null}
                    lodin={!details?.loadd
                 
          {loadingDetails ? (
            <di;
            }v 
          </div>
        ) : (className="text-center py-4">
          <div className="text-center py-4 text-muted">No folders found  <div className="spinner-border" role="status">
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