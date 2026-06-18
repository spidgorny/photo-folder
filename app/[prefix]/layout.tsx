import { MainHeader } from '../main-header';
import { FolderHeaderWrapper } from './folder-header-wrapper.tsx';

export default function FolderLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ prefix: string }>;
}) {
	return (
		<>
			<FolderHeaderWrapper params={params} />
			{children}
		</>
	);
}
