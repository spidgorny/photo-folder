// components/PhotoCard.tsx
'use client'; // Must be a Client Component because it handles user interaction (onClick)

import { useAuth } from '@/components/providers/AuthContext';
import Image from 'next/image'; 

interface PhotoCardProps {
  folderName: string;
  photoCount?: number;
}

export default function PhotoCard({ folderName, photoCount = 0 }: PhotoCardProps) {
  // Use the custom hook to ensure authentication is active before showing content.
  const { user } = useAuth();

  if (!user) {
    return null; // Don't render until authenticated in the parent page logic
  }

  // Placeholder for thumbnail image source (we assume Image is configured)
  const placeholderUrl = `s3-bucket-name.com/${encodeURIComponent(folderName)}/thumb.jpg`;

  return (
    <div className="bg-white shadow border rounded hover:ring-2 ring-blue-200 transition duration-150 cursor-pointer p-4 flex flex-col">
      {/* Image Placeholder */}
      <div className="w-full h-32 bg-gray-200 mb-3 relative overflow-hidden">
        {/* Using Next.js Image component for optimization */}
        <Image 
          src={placeholderUrl} 
          alt={`Thumbnail for ${folderName}`} 
          layout="fill" // Use modern layout props
          objectFit="cover" 
          priority 
        />
      </div>

      {/* Content */}
      <h3 className="text-md font-medium text-gray-800 truncate">{folderName}</h3>
      <p className="text-sm text-gray-500 mb-2">{photoCount} photos</p>
      
      {/* Action Button */}
      <button 
        className="mt-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-3 rounded transition"
        // This click handler demonstrates client activity using the context/state.
        onClick={() => console.log(`Navigating to folder: ${folderName}`)}
      >
        View Folder →
      </button>
    </div>
  );
}