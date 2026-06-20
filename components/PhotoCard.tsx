// components/PhotoCard.tsx
'use client'; // Must be a Client Component because it handles user interaction (onClick)

import { useAuth } from '@/components/providers/AuthContext';
import { useRouter } from 'next/navigation';

interface PhotoCardProps {
  folderName: string;
  photoCount?: number;
  firstImage?: {
    key: string;
    src: string;
  } | null;
  loading?: boolean;
}

export default function PhotoCard({ folderName, photoCount = 0, firstImage, loading = false }: PhotoCardProps) {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return null;
  }

  const handleNavigate = () => router.push(`/${encodeURIComponent(folderName)}`);

  return (
    <div className="card h-100">
      {firstImage ? (
        <img
          src={firstImage.src}
          alt={folderName}
          className="card-img-top"
          style={{ height: '150px', objectFit: 'cover', cursor: 'pointer' }}
          onClick={handleNavigate}
        />
      ) : loading ? (
        <div
          className="card-img-top d-flex align-items-center justify-content-center"
          style={{ height: '150px', backgroundColor: '#f8f9fa', cursor: 'pointer' }}
          onClick={handleNavigate}
        >
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div
          className="card-img-top d-flex align-items-center justify-content-center"
          style={{ height: '150px', backgroundColor: `hsl(${Math.random() * 360}, 70%, 80%)`, cursor: 'pointer' }}
          onClick={handleNavigate}
        >
          <div className="display-6">📷</div>
        </div>
      )}

      <div className="card-body d-flex flex-column">
        <h5 className="card-title text-truncate">{folderName}</h5>
        <p className="card-text text-muted">{loading ? 'Loading...' : `${photoCount} photos`}</p>

        <button
          className="btn btn-primary mt-auto"
          onClick={handleNavigate}
        >
          View Folder →
        </button>
      </div>
    </div>
  );
}