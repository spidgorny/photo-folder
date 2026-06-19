import { MainHeader } from '../main-header';

export default function FolderLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<MainHeader />
			{children}
		</>
	);
}
