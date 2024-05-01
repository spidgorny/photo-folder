export const urlDecode = function (str: string) {
	return decodeURIComponent(str.replace(/\+/g, " "));
};

export async function time(code: () => any) {
	const startTime = Date.now();
	await code();
	return (Date.now() - startTime) / 1000;
}

export type UploadObject = {
	key: string;
	size: number;
	eTag?: string;
	versionId?: string | undefined;
	sequencer?: string;
	prefix?: string;
};
