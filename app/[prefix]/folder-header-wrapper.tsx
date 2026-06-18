"use client";
import { useState, useEffect } from "react";
import { MainHeader } from '../main-header';

export function FolderHeaderWrapper({ params }: { params: Promise<{ prefix: string }> }) {
	const [prefix, setPrefix] = useState<string>("");

	useEffect(() => {
		params.then((p) => setPrefix(p.prefix));
	}, [params]);

	if (!prefix) return null;

	return <MainHeader folderContext={{ prefix }} />;
}
