"use client";
import { MainHeader } from '../main-header';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ManageThumbnails } from './manage-thumbnails';
import { createPortal } from 'react-dom';

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
			{typeof document !== 'undefined' && createPortal(
				<CustomModal
					isOpen={showThumbnailManager}
					onClose={() => setShowThumbnailManager(false)}
				>
					<ManageThumbnails prefix={folderName} close={() => setShowThumbnailManager(false)} />
				</CustomModal>,
				document.body
			)}
		</>
	);
}

function CustomModal({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) {
	if (!isOpen) return null;

	return (
		<div
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundColor: 'rgba(0, 0, 0, 0.5)',
				zIndex: 2147483647,
				display: 'flex',
				justifyContent: 'flex-end',
				alignItems: 'center',
			}}
			onClick={onClose}
		>
			<div
				style={{
					width: '600px',
					height: '100%',
					backgroundColor: 'white',
					boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.2)',
					overflowY: 'auto',
					padding: '20px',
					position: 'relative',
				}}
				onClick={(e) => e.stopPropagation()}
			>
				{children}
			</div>
		</div>
	);
}
