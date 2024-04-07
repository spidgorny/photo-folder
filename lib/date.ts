let lastTime = Date.now();
export async function onlyOncePerSecond(
	someCode: (() => Promise<void>) | (() => void),
) {
	let sinceLastTime = Date.now() - lastTime;
	if (sinceLastTime < 1000) {
		return;
	}
	await someCode();
	lastTime = Date.now();
}
