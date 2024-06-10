export const extractDoc = async (url: string, vault: any) => {
	if (url.startsWith("[[") && url.endsWith("]]")) {
		return extractLocalDoc(url, vault);
	} else {
		return extractRemoteDoc(url);
	}
};

const extractLocalDoc = async (url: string, vault: any) => {
	const docName = url.slice(2, -2);
	const doc = vault.getAbstractFileByPath(docName + ".md"); // can only access the top level of the vault
	if (doc) {
		const data = await vault.read(doc);
		const contentWithoutFrontmatter = data.replace(/---[\s\S]*?---\n/, "");
		return {
			title: docName.replace(/[\\/:*?"<>|]/g, "_"),
			content: contentWithoutFrontmatter,
			isLocal: true,
		};
	} else {
		throw new Error("Local note not found");
	}
};

const extractRemoteDoc = async (url: string) => {
	const jinaAPI = "https://r.jina.ai/";
	try {
		const response = await fetch(jinaAPI + url, {
			method: "GET",
			headers: {
				Accept: "application/json",
			},
		});
		const data = await response.json();
		console.log(data);
		return {
			title: data.data.title.replace(/[\\/:*?"<>|]/g, "_"),
			content: data.data.content,
			isLocal: false,
		};
	} catch (error) {
		console.error("Failed to fetch data", error);
		throw new Error("Failed to fetch data");
	}
};

export default extractDoc;
