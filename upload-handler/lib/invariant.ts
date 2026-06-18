export default function invariant(
	condition: any,
	message: string | Error | Function,
): asserts condition {
	if (condition) {
		return;
	}
	if (message instanceof Error) {
		throw message;
	}
	const provided = typeof message === "function" ? message() : message;
	const value = provided ? provided : "Invariant failed";
	throw new Error(value);
}
