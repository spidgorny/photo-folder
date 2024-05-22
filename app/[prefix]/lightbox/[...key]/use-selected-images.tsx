// https://github.com/uidotdev/usehooks/blob/main/index.js#L564
import React from "react";
import { useSessionStorage } from "@react-hooks-library/core";

export function useSessionStorageList<T>(
	sessionKey: string,
	defaultList: T[] = [],
) {
	const [list, setList] = useSessionStorage<T[]>(sessionKey, defaultList);

	const setListWithCallback = (l: T[]) => {
		setList(l);
	};

	const set = React.useCallback((l: T[]) => {
		setListWithCallback(l);
	}, []);

	const push = React.useCallback((element: T) => {
		setListWithCallback([...list, element]);
	}, []);

	const removeAt = React.useCallback((index: number) => {
		setListWithCallback([...list.slice(0, index), ...list.slice(index + 1)]);
	}, []);

	const insertAt = React.useCallback((index: number, element: T) => {
		setListWithCallback([
			...list.slice(0, index),
			element,
			...list.slice(index),
		]);
	}, []);

	const updateAt = React.useCallback((index: number, element: T) => {
		setListWithCallback(list.map((e, i) => (i === index ? element : e)));
	}, []);

	const clear = React.useCallback(() => setListWithCallback([]), []);

	// keep all except matching by selector
	const removeBy = (selector: (x: T) => boolean) =>
		setListWithCallback(list.filter((x) => !selector(x)));

	return [list, { set, push, removeAt, insertAt, updateAt, clear, removeBy }];
}

export function useSelectedImages<T>(defaultList: T[] = []) {
	const [list, methods] = useSessionStorageList<T>(
		"selected-images",
		defaultList,
	);
	console.log("selected-images", list);

	return { list, ...methods };
}
