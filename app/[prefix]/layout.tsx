import { MainHeader } from '../main-header';

export default function FolderLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ prefix: string }>;
}) {
	return (
		<>
			<FolderHeaderWrapper params={params}>
				{children}
			</FolderHeaderWrapper>
		</>
	);
}

async function FolderHeaderWrapper({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ prefix: string }>;
}) {
	const { prefix } = await params;
	return (
		<>
			<MainHeader folderContext={{ prefix }} />
			{children}
		</>
	);
}
