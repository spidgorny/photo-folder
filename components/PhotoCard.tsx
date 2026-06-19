// components/PhotoCard.tsx
'use client'; // Must be a Client Component because it handles user interaction (onClick)

import { useAuth } from '@/components/providers/AuthContext';
import { useRouter } from 'next/navigation'; 

interface PhotoCardProps {
  folderName: string;
  photoCount?: number;
}

export default function PhotoCard({ folderName, photoCount = 0 }: PhotoCardProps) {
  // Use the custom hook to ensure authentication is active before showing content.
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return null; // Don't render until authenticated in the parent page logic
  }

  // Placeholder for thumbnail image source (we assume Image is configured)
  // Using a colored div as placeholder instead of invalid URL
  const placeholderColor = `hsl(${Math.random() * 360}, 70%, 80%)`;

  return (
    <div className="card h-100">
      {/* Image Placeholder */}
      <div className="card-img-top d-flex align-items-center justify-content-center" style={{ height: '150px', backgroundColor: placeholderColor }}>
        <div className="display-6">📷</div>
      </div>

      <div className="card-body d-flex flex-column">
        {/* Content */}
        <h5 className="card-title text-truncate">{folderName}</h5>
        <p className="card-text text-muted">{photoCount} photos</p>
        
        {/* Action Button */}
        <button 
          className="btn btn-primary mt-auto"
          onClick={() => router.push(`/${folderName}`)}
        >
          View Folder →
        </button>
      </div>
    </div>
  );
}