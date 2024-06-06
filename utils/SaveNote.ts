interface Note {
	title: string;
	content: string;
	url: string;
}

export const saveNote = (note: Note, vault) => {
	console.log("Notes saved:", note);
	// Additional logic to handle saved notes
	const sanitizedTitle = note.title.replace(/[\\/:*?"<>|]/g, "-");
	const cleanedContent = cleanupJinaReaderContent(note.content);
	let fileName = `${sanitizedTitle}.md`;
	let counter = 1;
	const checkAndCreateFile = async () => {
		while (await vault.exists(fileName)) {
			fileName = `${sanitizedTitle} - ${counter}.md`;
			counter++;
		}
		const contentWithFrontmatter = `---\nurl: ${note.url}\n---\n${cleanedContent}`;
		await vault.create(fileName, contentWithFrontmatter);
	};
	checkAndCreateFile();
};

const cleanupJinaReaderContent = (content: string) => {
	const cleanedContent = content
		.replace(/^\d+\.\s+(#+\s*.+)/gm, "$1")
		.replace(/^(.+)\n=+/gm, "# $1")
		.replace(/^(.+)\n-+/gm, "## $1")
		.replace(/^\s+/gm, ""); // Remove whitespace at the beginning of paragraphs
	return cleanedContent;
};

export default saveNote;
