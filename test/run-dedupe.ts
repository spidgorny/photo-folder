import { runTest } from "./bootstrap";
import { ThumbFile } from "../lib/thumb-file";

void runTest(async () => {
	const prefix = "2024 Cyprus";

	const thumbFile = new ThumbFile(prefix);
	await thumbFile.init();
	console.log("thumb file", thumbFile.thumbnails.length);
	let sourceDataListIsACopy = [...thumbFile.thumbnails];
	for (let entry of sourceDataListIsACopy) {
		thumbFile.removeKey(entry.key);
		thumbFile.put(entry);
	}
	console.log("deduped", thumbFile.thumbnails.length);
	await thumbFile.save();
});
