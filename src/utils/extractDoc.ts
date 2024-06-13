import { Card } from "../types";
import { requestUrl } from "obsidian";

export const extractDoc = async (
	url: string,
	apikey: string,
	vault: any
): Promise<Card> => {
	if (url.startsWith("[[") && url.endsWith("]]")) {
		return extractLocalDoc(url, vault);
	} else if (url.startsWith("http")) {
		return extractRemoteDoc(url, apikey);
	} else {
		return {
			id: -1,
			title: `This is not a valid URL or local note`,
			content: "Only URLs or local notes are supported.",
			url: "",
			isLocal: false,
			saved: false,
			savedName: "",
		};
	}
};

const extractLocalDoc = async (url: string, vault: any): Promise<Card> => {
	const docName = url.slice(2, -2);
	const doc = await findFileInVault(docName + ".md", vault.getRoot());

	if (doc) {
		const data = await vault.read(doc.file);
		const contentWithoutFrontmatter = data.replace(/---[\s\S]*?---\n/, "");
		return {
			id: 1,
			title: docName.replace(/[\\/:*?"<>|]/g, "_"),
			content: contentWithoutFrontmatter,
			url: url,
			isLocal: true,
			saved: false,
			savedName: docName.replace(/[\\/:*?"<>|]/g, "_") + ".md",
			savedPath: doc.path,
		};
	} else {
		return {
			id: -1,
			title: `${url} was not found in your vault`,
			content: "Check your input and try again.",
			url: "",
			isLocal: false,
			saved: false,
			savedName: "",
		};
	}
};

const extractRemoteDoc = async (url: string, apiKey: string): Promise<Card> => {
	const jinaAPI = "https://r.jina.ai/";
	try {
		const response = await (!apiKey
			? requestUrl({
					method: "GET",
					headers: {
						Accept: "application/json",
					},
					url: jinaAPI + url,
			  })
			: requestUrl({
					method: "GET",
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${apiKey}`,
					},
					url: jinaAPI + url,
			  }));

		const data = await response.json;
		return {
			id: 1,
			title: data.data.title.replace(/[\\/:*?"<>|]/g, "_"),
			content: data.data.content,
			url: url,
			isLocal: false,
			saved: false,
			savedName: data.data.title.replace(/[\\/:*?"<>|]/g, "_") + ".md",
		};
	} catch {
		return {
			id: -1,
			title: `Unable to access ${url}`,
			content: "Check your input and settings and try again.",
			url: "",
			isLocal: false,
			saved: false,
			savedName: "",
		};
	}
};

const findFileInVault = async (
	fileName: string,
	directory: any,
	currentPath: string = ""
): Promise<{ file: any; path: string } | null> => {
	const files = directory.children;
	for (const file of files) {
		const newPath = currentPath;
		if (file.children) {
			const found = await findFileInVault(fileName, file, newPath);
			if (found) return found;
		} else if (file.name === fileName) {
			return { file, path: newPath };
		}
	}
	return null;
};

export const getNoteSuggestions = async (query: string, vault: any) => {
	const suggestions = [];
	const searchQuery = query.slice(2).toLowerCase(); // Remove the leading [[ and convert to lowercase
	const files = vault.getMarkdownFiles();

	for (const file of files) {
		if (
			file.name.toLowerCase().includes(searchQuery) &&
			file.extension === "md"
		) {
			suggestions.push(file.name.replace(".md", ""));
		}
		if (suggestions.length >= 5) break; // Limit to 5 suggestions
	}
	return suggestions;
};

export default extractDoc;
