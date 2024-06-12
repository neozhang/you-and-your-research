export const extractDoc = async (url: string, apikey: string, vault: any) => {
	if (url.startsWith("[[") && url.endsWith("]]")) {
		return extractLocalDoc(url, vault);
	} else {
		return extractRemoteDoc(url, apikey);
	}
};

const extractLocalDoc = async (url: string, vault: any) => {
	const docName = url.slice(2, -2);
	const doc = await findFileInVault(docName + ".md", vault.getRoot());

	if (doc) {
		const data = await vault.read(doc);
		const contentWithoutFrontmatter = data.replace(/---[\s\S]*?---\n/, "");
		return {
			title: docName.replace(/[\\/:*?"<>|]/g, "_"),
			content: contentWithoutFrontmatter,
			isLocal: true,
			saved: true,
			savedName: docName.replace(/[\\/:*?"<>|]/g, "_") + ".md",
		};
	} else {
		throw new Error("Local note not found");
	}
};

const findFileInVault = async (
	fileName: string,
	directory: any
): Promise<any | null> => {
	const files = directory.children;
	for (const file of files) {
		if (file.children) {
			const found = await findFileInVault(fileName, file);
			if (found) return found;
		} else if (file.name === fileName) {
			return file;
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

const extractRemoteDoc = async (url: string, apiKey: string) => {
	const jinaAPI = "https://r.jina.ai/";
	try {
		const response = await (!apiKey
			? fetch(jinaAPI + url, {
					method: "GET",
					headers: {
						Accept: "application/json",
					},
			  })
			: fetch(jinaAPI + url, {
					method: "GET",
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${apiKey}`,
					},
			  }));

		const data = await response.json();
		return {
			title: data.data.title.replace(/[\\/:*?"<>|]/g, "_"),
			content: data.data.content,
			isLocal: false,
			saved: false,
			savedName: data.data.title.replace(/[\\/:*?"<>|]/g, "_") + ".md",
		};
	} catch (error) {
		console.error("Failed to fetch data", error);
		throw new Error("Failed to fetch data");
	}
};

export default extractDoc;
