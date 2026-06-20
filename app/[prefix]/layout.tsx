"use client";
import { MainHeader } from '../main-header';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css";
import { ManageThumbnails } from './manage-thumbnails';

export default function FolderLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const folderName = pathname?.split('/').slice(-1)[0] || '';
	const [showThumbnailManager, setShowThumbnailManager] = useState(false);

	return (
		<>
			<MainHeader onOpenThumbnailManager={() => setShowThumbnailManager(true)} />
			{children}
			<SlidingPane
				isOpen={showThumbnailManager}
				width="600px"
				onRequestClose={() => setShowThumbnailManager(false)}
				title="Thumbnail Management"
			>
				<ManageThumbnails prefix={folderName} close={() => setShowThumbnailManager(false)} />
			</SlidingPane>
		</>
	);
}
