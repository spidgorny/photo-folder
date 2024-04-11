import { MainHeader, useClientSession } from "./[prefix]/main-header.tsx";
import { MakeFolder } from "./make-folder.tsx";

export default function Home() {
	const session = useClientSession();
	return (
		<main className="container-fluid">
			<MainHeader />
			{session.user && <MakeFolder />}
		</main>
	);
}
