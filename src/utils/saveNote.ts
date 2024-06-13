import { TFile } from "obsidian";
import { Card } from "../types";

export const saveNote = async (
	note: Card,
	vault: any,
	app: any,
	path: string,
	tag: string
) => {
	const cleanedContent = cleanupJinaReaderContent(note.content);
	let fileName = `${note.title}.md`;
	let counter = 1;
	let fullPath = `${path}/${fileName}`;
	while (await vault.exists(fullPath)) {
		fileName = `${note.title} - ${counter}.md`;
		fullPath = `${path}/${fileName}`;
		counter++;
	}
	if (!vault.getFolderByPath(path)) {
		await vault.createFolder(path);
	}

	await vault.create(fullPath, cleanedContent);
	const file = await vault.getAbstractFileByPath(fullPath);
	if (file instanceof TFile) {
		await app.fileManager.processFrontMatter(file, (fm: any) => {
			fm["url"] = note.url;
			if (tag) {
				fm["tags"] = !fm["tags"] ? [tag] : [...fm["tags"], tag];
			}
		});
	}

	return fileName;
};

export const openNote = async (
	path: string,
	fileName: string,
	vault: any,
	workspace: any
) => {
	const file = await vault.getAbstractFileByPath(`${path}/${fileName}`);
	workspace.getLeaf(true).openFile(file);
};

const cleanupJinaReaderContent = (content: string) => {
	const cleanedContent = content
		.replace(/^\d+\.\s+(#+\s*.+)/gm, "$1") // remove the number at the beginning of each line
		.replace(/^(.+)\n=+/gm, "# $1") // change heading 1 from = to #
		.replace(/^(.+)\n-+/gm, "## $1") // change heading 2 from - to ##
		.replace(/^\s+/gm, "") // remove whitespaces at the beginning of each line
		.replace(/\n/gm, "\n\n") // add a blank line after each line
		.replace(/\n\s*\n(?=>\s*\n)/gm, ""); // remove the blank line after blank blockquote lines

	return cleanedContent;
};

export default saveNote;
