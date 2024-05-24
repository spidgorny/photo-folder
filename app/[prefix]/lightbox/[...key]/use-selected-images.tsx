// https://github.com/uidotdev/usehooks/blob/main/index.js#L564
import React from "react";
// import { useSessionStorage } from "@react-hooks-library/core";

// this is required because we need a setter function support which @react-hooks-library doesn't support
import useSessionStorageState from "use-session-storage-state";

export function useSessionStorageList<T>(
	sessionKey: string,
	defaultList: T[] = [],
) {
	const [list, setList] = useSessionStorageState<T[]>(sessionKey, {
		defaultValue: defaultList,
	});

	const set = React.useCallback((l: T[]) => {
		setList(l);
	}, []);

	const push = React.useCallback((element: T) => {
		setList((list: T[]) => [...list, element]);
	}, []);

	const removeAt = React.useCallback((index: number) => {
		setList((list: T[]) => [...list.slice(0, index), ...list.slice(index + 1)]);
	}, []);

	const insertAt = React.useCallback((index: number, element: T) => {
		setList((list: T[]) => [
			...list.slice(0, index),
			element,
			...list.slice(index),
		]);
	}, []);

	const updateAt = React.useCallback((index: number, element: T) => {
		setList((list: T[]) => list.map((e, i) => (i === index ? element : e)));
	}, []);

	const clear = React.useCallback(() => setList([]), []);

	// keep all except matching by selector
	const removeBy = (selector: (x: T) => boolean) =>
		setList((list: T[]) => list.filter((x) => !selector(x)));

	return [
		list,
		{ set, push, removeAt, insertAt, updateAt, clear, removeBy },
	] as [
		list: T[],
		{
			set: (l: T[]) => void;
			removeBy: (selector: (x: T) => boolean) => void;
			insertAt: (index: number, element: T) => void;
			clear: () => void;
			removeAt: (index: number) => void;
			updateAt: (index: number, element: T) => void;
			push: (element: T) => void;
		},
	];
}

export function useSelectedImages<T>(defaultList: T[] = []) {
	const [list, methods] = useSessionStorageList<T>(
		"selected-images",
		defaultList,
	);
	console.log("selected-images", list);

	return { list, ...methods };
}
