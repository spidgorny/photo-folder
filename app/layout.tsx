// app/layout.tsx
import 'bootstrap/dist/css/bootstrap.css';
import { AuthProvider } from '@/components/providers/AuthContext';
// Import other necessary providers (e.g., Redux, ThemeContextProvider)

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* The AuthProvider wraps the entire application area */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

// Required metadata for Next.js build tools, replacing _document logic
export async function generateMetadata(): Promise<{
    metadataBase: URL;
    title: string;
    description: string;
    openGraph: {
        images: string[];
        title: string;
    };
}> {
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
    title: 'Photo Folder Management',
    description: 'Browse and upload photos to S3.',
    openGraph: {
      images: ['/og-image.png'],
      title: 'Photos Folder - Photo Manager',
    },
  };
}