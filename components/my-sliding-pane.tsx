import "react-sliding-pane/dist/react-sliding-pane.css";
import SlidingPane from "react-sliding-pane";
import { ReactNode, useState, useEffect } from "react";

export function MySlidingPane(props: {
	title?: string;
	button: ReactNode;
	children: (withClose: { close: () => void }) => ReactNode;
}) {
	const [openPanel, setOpenPanel] = useState(false);
	const close = () => setOpenPanel(false);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape" && openPanel) {
				close();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [openPanel, close]);

	return (
		<div>
			<button
				onClick={() => setOpenPanel(true)}
				className="btn btn-outline-primary"
			>
				{props.button}
			</button>
			<SlidingPane
				isOpen={openPanel}
				width={"50%"}
				onRequestClose={close}
				title={props.title}
			>
				{props.children({ close })}
			</SlidingPane>
		</div>
	);
}
