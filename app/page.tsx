// app/page.tsx (The main landing and folder grid page)
'use client';

import { useState } from 'react';
import { useClientSession } from '@/components/use-client-session';
import PhotoCard from '@/components/PhotoCard';
import { SignInForm } from '@/components/SignInForm';
import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css";

export default function HomePage() {
  const { user, folders, isLoading, error, mutate } = useClientSession();
  const [showSignIn, setShowSignIn] = useState(false);

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

  // Aggregate data for the cards (In a real scenario, you might fetch photo counts here)
  const folderCards = folders?.map(folder => ({
    name: folder.name || folder.key?.replace(/\/$/, '') || '',
    photoCount: Math.floor(Math.random() * 100) + 5 // Mocking count
  })) || [];

  return (
    <main className="p-8">
      <h1 className='text-3xl font-semibold mb-6'>Welcome back, {user?.email || user?.userId || 'User'}!</h1>
      {/* Structure now clearly separating content and sidebar */}
      <div className="grid grid-cols-4 gap-8 pt-4">
        {/* Left/Right Column for Sidebar (Metadata Management) */}
        <aside className='col-span-1 sticky top-8 h-fit'> 
          <h2 className='text-xl font-medium mb-3 border-b pb-2'>Management Tools</h2>
           <div className="p-4 border rounded bg-gray-50">
              {/* Reusing the button logic from before */}
            <button 
              // Note: Use a router hook here in a real implementation for navigation
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
              onClick={() => console.log('Generate button clicked')}
            >
              Regenerate Thumbnails (Batch)
            </button>
          </div>
        </aside>
        
        {/* Main Grid View for Folders */}
        <section className='col-span-3'>
          <h2 className='text-2xl font-medium mb-6'>Your Photo Folders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {folderCards.map((folder) => (
              // Render the new client component here
              <PhotoCard key={folder.name} folderName={folder.name} photoCount={folder.photoCount} />
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}