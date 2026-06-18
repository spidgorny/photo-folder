// app/page.tsx (The main landing and folder grid page)
import { getBackendSession } from '@/lib/session'; 
import { getS3Storage } from '@/lib/S3Storage';
import PhotoCard from '@/components/PhotoCard'; // Use the newly created component


export default async function HomePage() {
  // Note: getAuthenticatedUser and connection logic remains in middleware/AuthContext setup.
  const session = await getBackendSession();
  
  if (!session) {
    return <div className="p-8 text-center">Please log in to view your photos.</div >;
  }

  let folders;
  try {
    const s3 = getS3Storage(); 
    folders = await s3.listFolders(); 

    // Aggregate data for the cards (In a real scenario, you might fetch photo counts here)
    const folderCards = folders.map(folder => ({
      name: folder.name,
      photoCount: Math.floor(Math.random() * 100) + 5 // Mocking count
    }));

    return (
      <main className="p-8">
        <h1 className='text-3xl font-semibold mb-6'>Welcome back, {session.user || 'User'}!</h1>
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
  } catch (error) {
    console.error("Error fetching S3 folders: ", error);
    return <div className="p-8 text-red-600">Failed to load photo folders from S3 due to a server error. Please check the logs.</div>;
  }
}