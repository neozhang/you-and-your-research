import { TFile } from "obsidian";
import { AddProperties } from "./addProperties";

interface Note {
	title: string;
	content: string;
	url: string;
}

export const SaveNote = (note: Note, vault: any) => {
	console.log("Notes saved:", note);
	const cleanedContent = cleanupJinaReaderContent(note.content);
	let fileName = `${note.title}.md`;
	let counter = 1;
	const checkAndCreateFile = async () => {
		while (await vault.exists(fileName)) {
			fileName = `${note.title} - ${counter}.md`;
			counter++;
		}
		await vault.create(fileName, cleanedContent);
		const file = await vault.getAbstractFileByPath(fileName);
		if (file instanceof TFile) {
			await AddProperties(vault, file, { url: note.url });
		}
	};
	checkAndCreateFile();
};

const cleanupJinaReaderContent = (content: string) => {
	const cleanedContent = content
		.replace(/^\d+\.\s+(#+\s*.+)/gm, "$1")
		.replace(/^(.+)\n=+/gm, "# $1")
		.replace(/^(.+)\n-+/gm, "## $1")
		.replace(/^\s+/gm, "");
	return cleanedContent;
};

export default SaveNote;
