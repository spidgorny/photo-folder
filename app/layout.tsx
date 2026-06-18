// app/layout.tsx
import 'bootstrap/dist/css/bootstrap.css';
import { AuthProvider } from '@/components/providers/AuthContext';
import { MainHeader } from './main-header';
// Import other necessary providers (e.g., Redux, ThemeContextProvider)

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* The AuthProvider wraps the entire application area */}
        <AuthProvider>
          <MainHeader />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

// Required metadata for Next.js build tools, replacing _document logic
export async function generateMetadata(): Promise<{
    title: string; description: string; openGraph: {
        images: string[]; // Define or use an appropriate path
        title: string;
    };
}> {
  return {
    title: 'Photo Folder Management',
    description: 'Browse and upload photos to S3.',
    openGraph: {
      images: ['/og-image.png'], // Define or use an appropriate path
      title: 'Photos Folder - Photo Manager',
    },
  };
}